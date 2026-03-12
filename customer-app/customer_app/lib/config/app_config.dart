class AppConfig {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // For Android Emulator
  // static const String baseUrl = 'http://localhost:5000/api'; // For Web/iOS
  
  static const Duration timeout = Duration(seconds: 30);
}
