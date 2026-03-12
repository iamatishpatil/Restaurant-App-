import 'package:flutter/material.dart';

class ModeProvider with ChangeNotifier {
  bool _isVegMode = true; // Defaults to Veg-only

  bool get isVegMode => _isVegMode;

  void toggleMode() {
    _isVegMode = !_isVegMode;
    notifyListeners();
  }

  void setVegMode(bool value) {
    _isVegMode = value;
    notifyListeners();
  }
}
