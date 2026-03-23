class AppConfig {
  static const String baseUrl = 'http://192.168.43.205:5000/api'; // Updated to current machine IP
  // static const String baseUrl = 'http://10.0.2.2:5000/api'; // For Emulator
  
  static const Duration timeout = Duration(seconds: 30);
}
