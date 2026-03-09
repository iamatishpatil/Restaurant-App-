import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import 'order_tracking_screen.dart';

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
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    try {
      final response = await ApiService.get('/orders/my');
      if (response.statusCode == 200) {
        setState(() {
          _orders = jsonDecode(response.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching orders: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Orders', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: _isLoading 
        ? _buildLoadingState()
        : _orders.isEmpty 
          ? _buildEmptyState()
          : RefreshIndicator(
              onRefresh: _fetchOrders,
              color: AppColors.primary,
              child: ListView.builder(
                itemCount: _orders.length,
                padding: const EdgeInsets.all(AppSpacing.l),
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                itemBuilder: (ctx, i) {
                  final order = _orders[i];
                  return _buildOrderCard(order);
                },
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
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: AppColors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
            child: Icon(Icons.receipt_long_rounded, size: 64, color: AppColors.primary.withOpacity(0.2)),
          ),
          const SizedBox(height: 24),
          Text('No orders yet', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Your order history will appear here', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 32),
          SizedBox(
            width: 180,
            child: ElevatedButton(
              onPressed: _fetchOrders,
              child: const Text('Refresh'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    final date = DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.parse(order['createdAt']));
    final status = order['status'].toString().toUpperCase();
    final isDelivered = status == 'DELIVERED';
    final isCancelled = status == 'CANCELLED';

    Color statusColor = Colors.orange;
    if (isDelivered) statusColor = Colors.green;
    if (isCancelled) statusColor = Colors.red;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.l),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(
            orderId: order['id'].toString(),
            status: order['status'],
          )));
        },
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.l),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order #${order['id'].toString().substring(0, 8)}', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(date, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                  _buildStatusChip(status, statusColor),
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Amount', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                      Text('${AppConstants.currency}${order['totalPrice']}', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(
                        orderId: order['id'].toString(),
                        status: order['status'],
                      )));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: statusColor.withOpacity(0.1),
                      foregroundColor: statusColor,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      minimumSize: const Size(0, 0),
                    ),
                    child: Text(isDelivered ? 'View Details' : 'Track Order', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppRadius.s),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1),
      ),
    );
  }
}
