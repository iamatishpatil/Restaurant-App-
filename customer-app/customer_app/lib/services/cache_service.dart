import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';

class CacheService {
  static const String _menuBoxName = 'menu_cache';
  static const String _categoriesKey = 'categories';
  static const String _menuItemsKey = 'menu_items';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(_menuBoxName);
  }

  static Box _getBox() => Hive.box(_menuBoxName);

  // Save Categories
  static Future<void> saveCategories(List<dynamic> categories) async {
    final box = _getBox();
    await box.put(_categoriesKey, jsonEncode(categories));
  }

  // Get Categories
  static List<dynamic>? getCategories() {
    final box = _getBox();
    final String? data = box.get(_categoriesKey);
    if (data == null) return null;
    return jsonDecode(data);
  }

  // Save Menu Items
  static Future<void> saveMenuItems(List<dynamic> items) async {
    final box = _getBox();
    await box.put(_menuItemsKey, jsonEncode(items));
  }

  // Get Menu Items
  static List<dynamic>? getMenuItems() {
    final box = _getBox();
    final String? data = box.get(_menuItemsKey);
    if (data == null) return null;
    return jsonDecode(data);
  }

  // Clear Cache
  static Future<void> clear() async {
    final box = _getBox();
    await box.clear();
  }
}
