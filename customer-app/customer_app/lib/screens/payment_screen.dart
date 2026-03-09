import 'package:flutter/material.dart';
import '../utils/constants.dart';

class PaymentScreen extends StatefulWidget {
  final double amount;
  const PaymentScreen({super.key, required this.amount});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = 'UPI';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select Payment Method', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            _buildMethod(Icons.account_balance_wallet, 'UPI (PhonePe, Google Pay)', 'UPI'),
            _buildMethod(Icons.credit_card, 'Credit / Debit Card', 'CARD'),
            _buildMethod(Icons.money, 'Cash on Delivery', 'COD'),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Amount', style: TextStyle(color: Colors.grey)),
                  const Spacer(),
                  Text('${AppConstants.currency}${widget.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFFF4D4D))),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                   showDialog(
                     context: context,
                     barrierDismissible: false,
                     builder: (ctx) => const Center(child: CircularProgressIndicator(color: Color(0xFFFF4D4D))),
                   );
                   Future.delayed(const Duration(seconds: 2), () {
                     Navigator.pop(context); // Close loading
                     ScaffoldMessenger.of(context).showSnackBar(
                       const SnackBar(
                         content: Text('Payment Successful!'),
                         backgroundColor: Colors.green,
                       )
                     );
                     Navigator.pop(context, true); // Return success
                   });
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4D4D)),
                child: const Text('Pay Now', style: TextStyle(fontSize: 18)),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildMethod(IconData icon, String title, String value) {
    return RadioListTile(
      value: value,
      groupValue: _selectedMethod,
      onChanged: (val) => setState(() => _selectedMethod = val.toString()),
      secondary: Icon(icon, color: const Color(0xFFFF4D4D)),
      title: Text(title),
      contentPadding: EdgeInsets.zero,
    );
  }
}
