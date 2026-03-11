import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/navigation_provider.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'address_screen.dart';
import 'login_screen.dart';
import 'payment_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

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
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final location = Provider.of<LocationProvider>(context, listen: false);
      if (location.selectedAddressId != null) {
        setState(() {
          _selectedAddressId = location.selectedAddressId;
          _selectedAddressLabel = location.currentAddress;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final location = Provider.of<LocationProvider>(context);
    
    // Keep internal state in sync if provider updates (e.g. background detection)
    if (_selectedAddressId == null && location.selectedAddressId != null) {
      _selectedAddressId = location.selectedAddressId;
      _selectedAddressLabel = location.currentAddress;
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'My Cart',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface, fontSize: 20),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Theme.of(context).colorScheme.onSurface, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: cart.items.isEmpty 
        ? _buildEmptyCart()
        : Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  physics: const BouncingScrollPhysics(),
                  itemCount: cart.items.length,
                  itemBuilder: (ctx, i) {
                    final cartItem = cart.items.values.toList()[i];
                    return _buildCartItem(cartItem, cart).animate().fadeIn(delay: (i * 100).ms).slideX(begin: 0.1, end: 0);
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
            height: 140,
            width: 140,
            decoration: BoxDecoration(
              color: AppColors.surface1,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.shopping_cart_outlined, size: 60, color: AppColors.primary.withOpacity(0.3)),
          ).animate().scale(duration: 600.ms, curve: Curves.bounceOut),
          const SizedBox(height: 32),
          Text(
            'Your cart is empty',
            style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
          ),
          const SizedBox(height: 12),
          Text(
            'Explore our delicious menu items\nand add them to your cart!',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
          ),
          const SizedBox(height: 40),
          SizedBox(
            width: 220,
            height: 56,
            child: ElevatedButton(
              onPressed: () => Provider.of<NavigationProvider>(context, listen: false).setIndex(0),
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Browse Menu'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(CartItem cartItem, CartProvider cart) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: CachedNetworkImage(
              imageUrl: ApiService.getImageUrl(cartItem.item.image),
              width: 90,
              height: 90,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cartItem.item.name,
                  style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
                ),
                const SizedBox(height: 4),
                Text(
                  '${AppConstants.currency}${cartItem.item.price.toStringAsFixed(0)}',
                  style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
              ],
            ),
          ),
          _buildCartQuantitySelector(cartItem, cart),
        ],
      ),
    );
  }

  Widget _buildCartQuantitySelector(CartItem cartItem, CartProvider cart) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface1,
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(4),
      child: Column(
        children: [
          _miniButton(Icons.add_rounded, () => cart.addItem(cartItem.item)),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(
              '${cartItem.quantity}',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 14),
            ),
          ),
          _miniButton(Icons.remove_rounded, () => cart.removeSingleItem(cartItem.item.id)),
        ],
      ),
    );
  }

  Widget _miniButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 28,
        width: 28,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, size: 16, color: AppColors.primary),
      ),
    );
  }

  Widget _buildCheckoutSection(CartProvider cart) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.4 : 0.08),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Premium Address Selector
          GestureDetector(
            onTap: _selectAddress,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.surface1,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.surface3.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DELIVERING TO',
                          style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.5),
                        ),
                        Text(
                          _selectedAddressLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: Theme.of(context).colorScheme.onSurface),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.expand_more_rounded, color: AppColors.textSecondary),
                ],
              ),
            ).animate().slideY(begin: 0.5, end: 0).fadeIn(),
          ),
          const SizedBox(height: 24),
          
          // Bill Summary (Surgical Style)
          _billRow('Subtotal', '${AppConstants.currency}${cart.totalAmount.toStringAsFixed(0)}'),
          _billRow('Delivery Fee', 'FREE', isGreen: true),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, color: AppColors.surface3),
          ),
          
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Grand Total',
                style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
              ),
              Text(
                '${AppConstants.currency}${cart.totalAmount.toStringAsFixed(0)}',
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Ultimate Place Order Button
          Container(
            height: 64,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () => _handleCheckout(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('PLACE ORDER', style: GoogleFonts.poppins(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1, color: Colors.white)),
                  const SizedBox(width: 12),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.white),
                ],
              ),
            ),
          ).animate().slideY(begin: 0.3, end: 0, delay: 200.ms).fadeIn(),
        ],
      ),
    );
  }

  Widget _billRow(String label, String value, {bool isGreen = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: isGreen ? const Color(0xFF00C853) : Theme.of(context).colorScheme.onSurface,
              fontWeight: isGreen ? FontWeight.w800 : FontWeight.w700,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms);
  }

  void _handleCheckout(BuildContext context) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Authentication required'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }

    if (_selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select delivery address'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    final cart = Provider.of<CartProvider>(context, listen: false);
    
    final paymentMethod = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PaymentScreen(amount: cart.totalAmount)),
    );

    if (paymentMethod == null || paymentMethod is! String) {
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
      'paymentMethod': paymentMethod,
    };

    try {
      final response = await ApiService.post('/orders', body);
      if (response.statusCode == 201) {
        cart.clear();
        if (mounted) {
          _showSuccessDialog();
        }
      }
    } catch (e) {
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to place order')));
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_rounded, color: Color(0xFF00C853), size: 72).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            Text('Order Successful!', style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w900)),
            const SizedBox(height: 12),
            Text(
              'Your chef is already on it. Tracking your order now...',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Future.microtask(() {
                    if (mounted) {
                      Provider.of<NavigationProvider>(context, listen: false).setIndex(2);
                    }
                  });
                },
                child: const Text('OK'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

