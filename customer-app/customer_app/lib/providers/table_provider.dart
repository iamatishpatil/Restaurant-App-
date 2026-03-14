import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TableProvider with ChangeNotifier {
  String? _activeTableId;
  String? _activeTableNumber;

  String? get activeTableId => _activeTableId;
  String? get activeTableNumber => _activeTableNumber;

  bool get hasTable => _activeTableId != null;

  TableProvider() {
    _loadFromPrefs();
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _activeTableId = prefs.getString('active_table_id');
    _activeTableNumber = prefs.getString('active_table_number');
    notifyListeners();
  }

  Future<void> setTable(String id, String number) async {
    _activeTableId = id;
    _activeTableNumber = number;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('active_table_id', id);
    await prefs.setString('active_table_number', number);
    notifyListeners();
  }

  Future<void> clearTable() async {
    _activeTableId = null;
    _activeTableNumber = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('active_table_id');
    await prefs.remove('active_table_number');
    notifyListeners();
  }
}
