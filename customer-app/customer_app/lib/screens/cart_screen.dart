import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'address_screen.dart';
import 'login_screen.dart';
import 'payment_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String? _selectedAddressId;
  String _selectedAddressLabel = 'Select Delivery Address';

  Future<void> _selectAddress() async {
    try {
      final response = await ApiService.get('/address');
      if (response.statusCode == 200) {
        final List<dynamic> addresses = jsonDecode(response.body);
        if (mounted) {
          showModalBottomSheet(
            context: context,
            backgroundColor: Colors.transparent,
            builder: (ctx) => Container(
              decoration: const BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
              ),
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Select Delivery Address', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  const Divider(),
                  if (addresses.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Text('No addresses found.', style: Theme.of(context).textTheme.bodyMedium),
                    ),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), shape: BoxShape.circle),
                      child: const Icon(Icons.add_location_alt_rounded, color: Colors.blue, size: 20),
                    ),
                    title: const Text('Add New Address', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                    onTap: () {
                      Navigator.pop(ctx);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressScreen()));
                    },
                  ),
                  const Divider(),
                  ConstrainedBox(
                    constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.4),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: addresses.length,
                      itemBuilder: (ctx, index) {
                        final addr = addresses[index];
                        return ListTile(
                          leading: const Icon(Icons.location_on_rounded, color: AppColors.primary),
                          title: Text(addr['type'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${addr['addressLine1']}, ${addr['city']}'),
                          onTap: () {
                            setState(() {
                              _selectedAddressId = addr['id'];
                              _selectedAddressLabel = '${addr['type']}: ${addr['addressLine1']}';
                            });
                            Navigator.pop(ctx);
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error loading addresses')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Cart', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: cart.items.isEmpty 
        ? _buildEmptyCart()
        : Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.l),
                  itemCount: cart.items.length,
                  itemBuilder: (ctx, i) {
                    final cartItem = cart.items.values.toList()[i];
                    return _buildCartItem(cartItem, cart);
                  },
                ),
              ),
              _buildCheckoutSection(cart),
            ],
          ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: AppColors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
            child: Icon(Icons.shopping_basket_rounded, size: 64, color: AppColors.primary.withOpacity(0.2)),
          ),
          const SizedBox(height: 24),
          Text('Your cart is empty', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Looks like you haven\'t added anything yet!', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),
          SizedBox(
            width: 200,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Browse Menu'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(CartItem cartItem, CartProvider cart) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.l),
      padding: const EdgeInsets.all(AppSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppRadius.l),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.m),
            child: CachedNetworkImage(
              imageUrl: ApiService.getImageUrl(cartItem.item.image),
              width: 70,
              height: 70,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: AppSpacing.l),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(cartItem.item.name, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('${AppConstants.currency}${cartItem.item.price}', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(AppRadius.m),
            ),
            child: Row(
              children: [
                _miniButton(Icons.remove_rounded, () => cart.removeSingleItem(cartItem.item.id)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text('${cartItem.quantity}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
                _miniButton(Icons.add_rounded, () => cart.addItem(cartItem.item)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _miniButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.m),
      child: Padding(padding: const EdgeInsets.all(8), child: Icon(icon, size: 16, color: AppColors.primary)),
    );
  }

  Widget _buildCheckoutSection(CartProvider cart) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5))],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: _selectAddress,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.l),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(AppRadius.l),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on_rounded, color: AppColors.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedAddressLabel,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: _selectedAddressId == null ? AppColors.textSecondary : AppColors.text,
                          fontWeight: _selectedAddressId == null ? FontWeight.normal : FontWeight.bold,
                        ),
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            _billRow('Item Total', '${AppConstants.currency}${cart.totalAmount.toStringAsFixed(2)}'),
            _billRow('Delivery Fee', '${AppConstants.currency}0.00', isFree: true),
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total Amount', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                Text(
                  '${AppConstants.currency}${cart.totalAmount.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            ElevatedButton(
              onPressed: () => _handleCheckout(context),
              child: const Text('PLACE ORDER'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _billRow(String label, String value, {bool isFree = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary)),
          Text(
            isFree ? 'FREE' : value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: isFree ? Colors.green : AppColors.text,
              fontWeight: isFree ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  void _handleCheckout(BuildContext context) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please login to continue')));
      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }

    if (_selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a delivery address')));
      return;
    }

    final cart = Provider.of<CartProvider>(context, listen: false);
    
    final paymentSuccess = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PaymentScreen(amount: cart.totalAmount)),
    );

    if (paymentSuccess != true) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment cancelled or failed')));
      return;
    }

    final body = {
      'items': cart.items.values.map((ci) => {
        'menuItemId': ci.item.id,
        'quantity': ci.quantity,
        'price': ci.item.price,
      }).toList(),
      'totalPrice': cart.totalAmount,
      'deliveryType': 'DELIVERY',
      'addressId': _selectedAddressId,
    };

    try {
      final response = await ApiService.post('/orders', body);
      if (response.statusCode == 201) {
        cart.clear();
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.green, size: 64),
                  const SizedBox(height: 24),
                  Text('Order Placed!', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  const Text('Your delicious meal is being prepared.', textAlign: TextAlign.center),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                      },
                      child: const Text('OK'),
                    ),
                  ),
                ],
              ),
            ),
          );
        }
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order failed. Please try again.')));
      }
    } catch (e) {
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error placing order')));
    }
  }
}

