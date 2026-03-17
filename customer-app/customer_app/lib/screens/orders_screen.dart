import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import 'order_tracking_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<dynamic> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthAndFetch();
    });
  }

  Future<void> _checkAuthAndFetch() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.isAuthenticated) {
      _fetchOrders();
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchOrders() async {
    try {
      print('DEBUG: Fetching orders...');
      final response = await ApiService.get('/orders/my');
      print('DEBUG: Orders response status: ${response.statusCode}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _orders = data is List ? data : [];
          _isLoading = false;
        });
        print('DEBUG: Orders count: ${_orders.length}');
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print('ERROR [OrdersScreen]: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Orders History',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface, fontSize: 20),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        automaticallyImplyLeading: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Theme.of(context).colorScheme.onSurface, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    final auth = Provider.of<AuthProvider>(context);
    
    if (_isLoading) return _buildLoadingState();
    if (!auth.isAuthenticated) return _buildLoginPrompt();
    if (_orders.isEmpty) return _buildEmptyState();

    return RefreshIndicator(
      onRefresh: _fetchOrders,
      color: AppColors.primary,
      child: ListView.builder(
        itemCount: _orders.length,
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 140),
        physics: const BouncingScrollPhysics(),
        itemBuilder: (ctx, i) {
          final order = _orders[i];
          return _buildOrderCard(order).animate().fadeIn(delay: (i * 100).ms).slideX(begin: 0.1, end: 0);
        },
      ),
    );
  }

  Widget _buildLoginPrompt() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
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
              child: Icon(Icons.lock_outline_rounded, size: 60, color: AppColors.primary.withOpacity(0.3)),
            ).animate().scale(duration: 600.ms, curve: Curves.bounceOut),
            const SizedBox(height: 32),
            Text(
              'Login Required',
              style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
            ),
            const SizedBox(height: 12),
            Text(
              'Please login to view your order history\nand track your active meals.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: 220,
              height: 56,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Login Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator(color: AppColors.primary));
  }

  Widget _buildEmptyState() {
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
            child: Icon(Icons.receipt_long_outlined, size: 60, color: AppColors.primary.withOpacity(0.3)),
          ).animate().scale(duration: 600.ms, curve: Curves.bounceOut),
          const SizedBox(height: 32),
          Text(
            'No orders yet',
            style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
          ),
          const SizedBox(height: 12),
          Text(
            'Taste the world! Start by placing\nyour first gourmet order today.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
          ),
          const SizedBox(height: 48),
          SizedBox(
            width: 220,
            height: 56,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Go Back'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    String date = 'Just now';
    try {
      if (order['createdAt'] != null) {
        date = DateFormat('dd MMM yyyy • hh:mm a').format(DateTime.parse(order['createdAt']));
      }
    } catch (_) {}

    final status = (order['status'] ?? 'PENDING').toString().toUpperCase();
    final isDelivered = status == 'DELIVERED';
    final isCancelled = status == 'CANCELLED';

    Color statusColor = const Color(0xFFFF9100); // Pending/Processing
    if (isDelivered) statusColor = const Color(0xFF00C853);
    if (isCancelled) statusColor = const Color(0xFFFF5252);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(
            orderId: order['id'].toString(),
            status: order['status'],
          )));
        },
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      isDelivered ? Icons.check_circle_rounded : isCancelled ? Icons.cancel_rounded : Icons.local_shipping_rounded,
                      color: statusColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Order #${order['id'].toString().length > 8 ? order['id'].toString().substring(0, 8).toUpperCase() : order['id'].toString().toUpperCase()}',
                          style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
                        ),
                        Text(date, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPlaceholder)),
                      ],
                    ),
                  ),
                  _buildStatusChip(status, statusColor),
                ],
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Divider(height: 1, color: AppColors.surface3),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TOTAL AMOUNT',
                        style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.5),
                      ),
                      Text(
                        '${AppConstants.currency}${order['grandTotal'] ?? 0}',
                        style: GoogleFonts.poppins(
                          color: Theme.of(context).colorScheme.onSurface,
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.surface1,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(
                          orderId: order['id'].toString(),
                          status: order['status'],
                        )));
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        isDelivered ? 'View Bill' : 'Track Order',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.primary),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        status,
        style: GoogleFonts.poppins(
          color: color, 
          fontWeight: FontWeight.w800, 
          fontSize: 9,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
