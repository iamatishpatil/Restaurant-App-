import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:lottie/lottie.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;
  final String status;

  const OrderTrackingScreen({super.key, required this.orderId, required this.status});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  late String currentStatus;
  Timer? _timer;
  dynamic _orderDetails;

  @override
  void initState() {
    super.initState();
    currentStatus = widget.status;
    _startPolling();
  }

  void _startPolling() {
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) async {
       try {
         final resp = await ApiService.get('/orders/${widget.orderId}');
         if (resp.statusCode == 200) {
           final data = jsonDecode(resp.body);
           if (mounted) {
             setState(() {
               currentStatus = data['status'];
               _orderDetails = data;
             });
             if (currentStatus == 'DELIVERED' || currentStatus == 'CANCELLED') {
               _timer?.cancel();
             }
           }
         }
       } catch (e) {
         print(e);
       }
    });
    // Initial fetch
    ApiService.get('/orders/${widget.orderId}').then((resp) {
      if (resp.statusCode == 200 && mounted) {
        setState(() => _orderDetails = jsonDecode(resp.body));
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text('Track Order', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            children: [
              _buildLottieHeader(),
              if (currentStatus == 'CANCELLED' && _orderDetails != null && _orderDetails['cancelReason'] != null)
                _buildCancellationReason(_orderDetails['cancelReason']),
              const SizedBox(height: 32),
              _buildOrderInfo(),
              const SizedBox(height: 48),
              _buildStepper(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLottieHeader() {
    String lottieUrl = 'https://assets9.lottiefiles.com/packages/lf20_jmejebmv.json'; // Cooking/Packing
    if (currentStatus == 'READY') {
      lottieUrl = 'https://assets10.lottiefiles.com/packages/lf20_pqnfmone.json'; // Ready/Check
    } else if (currentStatus == 'SERVED' || currentStatus == 'COMPLETED') {
      lottieUrl = 'https://assets10.lottiefiles.com/packages/lf20_pqnfmone.json'; // Success
    }

    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.xxl),
      ),
      child: Lottie.network(
        lottieUrl,
        errorBuilder: (context, error, stackTrace) => const Icon(Icons.restaurant_rounded, size: 80, color: AppColors.primary),
      ),
    );
  }

  Widget _buildCancellationReason(String reason) {
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.l),
      padding: const EdgeInsets.all(AppSpacing.l),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.05),
        borderRadius: BorderRadius.circular(AppRadius.l),
        border: Border.all(color: Colors.red.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: Colors.red, size: 20),
              const SizedBox(width: 8),
              Text(
                'Order Declined by Chef',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            reason,
            style: GoogleFonts.poppins(
              fontSize: 13,
              color: Colors.red.withOpacity(0.8),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderInfo() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(Icons.receipt_long_rounded, color: AppColors.primary, size: 30),
          ),
          const SizedBox(width: AppSpacing.l),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Order #${widget.orderId.substring(0, 8).toUpperCase()}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
                const SizedBox(height: 4),
                Text(
                  'Current Status: ${currentStatus.replaceAll('_', ' ')}',
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepper() {
    return Column(
      children: [
        _buildStep('Order Placed', 'We have received your order', true, isFirst: true),
        _buildStep('Preparing', 'Our chef is preparing your meal', _isStepActive('PREPARING')),
        _buildStep('Ready to Serve', 'Your meal is ready to be served', _isStepActive('READY')),
        _buildStep('Served', 'Enjoy your delicious meal!', _isStepActive('SERVED'), isLast: true),
      ],
    );
  }

  bool _isStepActive(String step) {
    List<String> statuses = ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];
    int currentIndex = statuses.indexOf(currentStatus);
    int stepIndex = statuses.indexOf(step);
    return currentIndex >= stepIndex;
  }

  Widget _buildStep(String title, String subtitle, bool isCompleted, {bool isFirst = false, bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isCompleted ? AppColors.primary : AppColors.background,
                shape: BoxShape.circle,
                border: isCompleted ? null : Border.all(color: Colors.black12),
              ),
              child: isCompleted 
                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 20) 
                  : Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.black12, shape: BoxShape.circle)),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 50,
                color: isCompleted ? AppColors.primary : AppColors.background,
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isCompleted ? AppColors.text : AppColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ],
    );
  }
}
