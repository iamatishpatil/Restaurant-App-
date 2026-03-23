import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static const String baseUrl = AppConfig.baseUrl;

  static Function? _logoutCallback;

  static void setLogoutCallback(Function callback) {
    _logoutCallback = callback;
  }

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> _processResponse(http.Response response) async {
    if (response.statusCode == 401) {
      if (_logoutCallback != null) {
        _logoutCallback!();
      }
    }
    return response;
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return _processResponse(response);
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
    return _processResponse(response);
  }

  static Future<http.Response> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return _processResponse(response);
  }

  static Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
    return _processResponse(response);
  }

  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return 'https://via.placeholder.com/150';
    
    final base = baseUrl.replaceAll('/api', '');
    
    if (path.startsWith('http')) {
      // If it's already an absolute URL but pointing to localhost, swap it with the current baseUrl host
      if (path.contains('localhost:5000') || path.contains('127.0.0.1:5000')) {
        return path.replaceAll('http://localhost:5000', base)
                   .replaceAll('http://127.0.0.1:5000', base);
      }
      return path;
    }
    
    return '$base${path.startsWith('/') ? '' : '/'}$path';
  }
}
