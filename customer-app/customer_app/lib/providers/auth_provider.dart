import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<bool> login(String login, String password, {bool isEmail = true}) async {
    final body = isEmail ? {'email': login, 'password': password} : {'phone': login, 'password': password};
    
    try {
      final response = await ApiService.post('/auth/login', body);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = User.fromJson(data['user']);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('user', jsonEncode(data['user']));
        
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Login error: $e');
    }
    return false;
  }

  Future<bool> signup(String name, String email, String phone, String password) async {
    try {
      final response = await ApiService.post('/auth/signup', {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      });
      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = User.fromJson(data['user']);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('user', jsonEncode(data['user']));
        
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Signup error: $e');
    }
    return false;
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('token')) return;
    
    _token = prefs.getString('token');
    final userData = jsonDecode(prefs.getString('user')!);
    _user = User.fromJson(userData);
    notifyListeners();
  }

  Future<bool> updateProfile(String name, String email, String phone) async {
    try {
      final response = await ApiService.put('/auth/update', {
        'name': name,
        'email': email,
        'phone': phone,
      });
      if (response.statusCode == 200) {
        final userData = jsonDecode(response.body);
        _user = User.fromJson(userData);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(userData));
        
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Update profile error: $e');
    }
    return false;
  }
}
