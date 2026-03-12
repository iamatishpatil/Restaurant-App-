import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import 'dart:convert';

class LocationProvider with ChangeNotifier {
  String _currentAddress = 'Select Location';
  String? _selectedAddressId;
  Position? _currentPosition;
  bool _isLoading = false;
  bool _isLocationSet = false;
  bool _hasPermissionError = false;

  String get currentAddress => _currentAddress;
  String? get selectedAddressId => _selectedAddressId;
  bool get isLoading => _isLoading;
  bool get isLocationSet => _isLocationSet;
  bool get hasPermissionError => _hasPermissionError;

  LocationProvider() {
    _loadFromPrefs();
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _currentAddress = prefs.getString('last_address') ?? 'Select Location';
    _selectedAddressId = prefs.getString('last_address_id');
    _isLocationSet = prefs.getBool('is_location_set') ?? false;
    notifyListeners();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('last_address', _currentAddress);
    await prefs.setBool('is_location_set', _isLocationSet);
    if (_selectedAddressId != null) {
      await prefs.setString('last_address_id', _selectedAddressId!);
    } else {
      await prefs.remove('last_address_id');
    }
  }

  void finalizeLocation() {
    _isLocationSet = true;
    _saveToPrefs();
    notifyListeners();
  }

  void setManualAddress(String address, {String? id}) {
    _currentAddress = address;
    _selectedAddressId = id;
    _saveToPrefs();
    notifyListeners();
  }

  Future<void> determinePosition() async {
    _isLoading = true;
    notifyListeners();

    try {
      bool serviceEnabled;
      LocationPermission permission;

      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Location services are disabled.';
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Location permissions are denied';
        }
      }
      
      _hasPermissionError = false;
      
      if (permission == LocationPermission.deniedForever) {
        _hasPermissionError = true;
        throw 'Location permissions are permanently denied, we cannot request permissions.';
      } 

      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 15),
      );
      
      await _getAddressFromLatLng(_currentPosition!);
      // Auto-finalize on successful detection to stop re-prompting
      finalizeLocation();
    } catch (e) {
      print('ERROR [LocationProvider]: $e');
      _currentAddress = 'Error: ${e.toString().split('\n').first}';
      _isLocationSet = false;
      if (e.toString().contains('permission') || e.toString().contains('disabled')) {
        _hasPermissionError = true;
      }
      notifyListeners();
      rethrow; // Pass error up so the UI can intercept and show the dialog
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _getAddressFromLatLng(Position position) async {
    try {
      // Fallback address in case geocoding fails
      _currentAddress = '${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
      
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(const Duration(seconds: 10));

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        print('Geocoding result: ${place.toString()}');
        
        String? name = place.name;
        String? subLocality = place.subLocality;
        String? locality = place.locality;
        String? administrativeArea = place.administrativeArea;
        
        if (subLocality != null && subLocality.isNotEmpty && locality != null && locality.isNotEmpty) {
          _currentAddress = '$subLocality, $locality';
        } else if (locality != null && locality.isNotEmpty) {
          _currentAddress = locality;
        } else if (name != null && name.isNotEmpty) {
          _currentAddress = name;
        } else if (administrativeArea != null) {
          _currentAddress = administrativeArea;
        }
      }
      
      _selectedAddressId = null; 
      await _saveToPrefs();
      
      // Auto-save to backend if geocoding worked or even if it's just coords
      await _saveLocationToBackend(position);
      
      notifyListeners();
    } catch (e) {
      print('ERROR [ReverseGeocode]: $e');
      // Keep the lat/lng fallback if geocoding fails
    }
  }

  Future<void> _saveLocationToBackend(Position pos) async {
    try {
      final body = {
        'type': 'Current Location',
        'addressLine1': _currentAddress,
        'city': 'Detected',
        'state': 'Manual',
        'zipCode': '000000',
        'isDefault': false,
      };
      
      final response = await ApiService.post('/address', body);
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _selectedAddressId = data['id'];
        _saveToPrefs();
      }
    } catch (e) {
      print('Error saving location to backend: $e');
    }
  }
}
