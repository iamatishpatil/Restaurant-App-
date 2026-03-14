import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/navigation_provider.dart';
import '../utils/constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'login_screen.dart';
import 'payment_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/table_provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    
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
            style: GoogleFonts.poppins(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6), height: 1.5),
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
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => _showNotesDialog(context, cartItem, cart),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primary.withOpacity(0.1)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.sticky_note_2_rounded, size: 12, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          cartItem.notes?.isEmpty ?? true ? 'Add Notes' : 'Edit Notes',
                          style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ),
                if (cartItem.notes != null && cartItem.notes!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    cartItem.notes!,
                    style: GoogleFonts.poppins(fontSize: 10, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          _buildCartQuantitySelector(cartItem, cart),
        ],
      ),
    );
  }

  void _showNotesDialog(BuildContext context, CartItem cartItem, CartProvider cart) {
    final controller = TextEditingController(text: cartItem.notes);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Cooking Instructions', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 18)),
        content: TextField(
          controller: controller,
          maxLines: 3,
          autofocus: true,
          style: GoogleFonts.poppins(fontSize: 14),
          decoration: InputDecoration(
            hintText: 'e.g. Extra spicy, No onions...',
            hintStyle: GoogleFonts.poppins(color: AppColors.textPlaceholder),
            filled: true,
            fillColor: AppColors.surface1,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.poppins(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              cart.updateNotes(cartItem.item.id, controller.text.trim());
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartQuantitySelector(CartItem cartItem, CartProvider cart) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
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
          color: Theme.of(context).cardTheme.color,
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
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 110),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Theme.of(context).dividerColor),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.restaurant_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 14),
                Consumer<TableProvider>(
                  builder: (context, table, _) {
                    return Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'DINING STATUS',
                            style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5), letterSpacing: 0.5),
                          ),
                          Text(
                            table.hasTable ? 'Dine-in at Table #${table.activeTableNumber}' : 'Dine-in Service',
                            style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: Theme.of(context).colorScheme.onSurface),
                          ),
                        ],
                      ),
                    );
                  }
                ),
              ],
            ),
          ).animate().slideY(begin: 0.5, end: 0).fadeIn(),
          const SizedBox(height: 24),
          
          _billRow('Subtotal', '${AppConstants.currency}${cart.totalAmount.toStringAsFixed(0)}'),
          _billRow('Tax & Service', 'Included', isGreen: true),
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
          Text(label, style: GoogleFonts.poppins(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6), fontWeight: FontWeight.w500)),
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

    final cart = Provider.of<CartProvider>(context, listen: false);
    final table = Provider.of<TableProvider>(context, listen: false);
    
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
        'notes': ci.notes,
      }).toList(),
      'totalPrice': cart.totalAmount,
      'deliveryType': 'DINE_IN',
      'tableId': table.activeTableId,
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
