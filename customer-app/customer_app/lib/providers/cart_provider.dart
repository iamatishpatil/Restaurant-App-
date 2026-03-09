import 'package:flutter/material.dart';
import '../models/menu_item.dart';

class CartItem {
  final MenuItem item;
  int quantity;

  CartItem({required this.item, this.quantity = 1});
}

class CartProvider with ChangeNotifier {
  final Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => {..._items};

  int get itemCount => _items.length;

  double get totalAmount {
    var total = 0.0;
    _items.forEach((key, cartItem) {
      total += cartItem.item.price * cartItem.quantity;
    });
    return total;
  }

  void addItem(MenuItem item) {
    if (_items.containsKey(item.id)) {
      _items.update(item.id, (existing) => CartItem(item: existing.item, quantity: existing.quantity + 1));
    } else {
      _items.putIfAbsent(item.id, () => CartItem(item: item));
    }
    notifyListeners();
  }

  void removeItem(String itemId) {
    _items.remove(itemId);
    notifyListeners();
  }

  void removeSingleItem(String itemId) {
    if (!_items.containsKey(itemId)) return;
    if (_items[itemId]!.quantity > 1) {
      _items.update(itemId, (existing) => CartItem(item: existing.item, quantity: existing.quantity - 1));
    } else {
      _items.remove(itemId);
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}
