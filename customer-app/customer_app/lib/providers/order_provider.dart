import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/api_service.dart';

class OrderProvider with ChangeNotifier {
  dynamic _activeOrder;
  bool _isLoading = false;

  dynamic get activeOrder => _activeOrder;
  bool get isLoading => _isLoading;

  Future<void> fetchActiveOrder() async {
    try {
      _isLoading = true;
      final response = await ApiService.get('/orders/my');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List && data.isNotEmpty) {
          // Find the most recent active order (not DELIVERED or CANCELLED)
          final active = data.firstWhere(
            (o) => !['DELIVERED', 'CANCELLED', 'COMPLETED', 'SERVED'].contains(o['status'].toString().toUpperCase()),
            orElse: () => null,
          );
          _activeOrder = active;
        } else {
          _activeOrder = null;
        }
      }
    } catch (e) {
      debugPrint('Error fetching active order: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearActiveOrder() {
    _activeOrder = null;
    notifyListeners();
  }
}
