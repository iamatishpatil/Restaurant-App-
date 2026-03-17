import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
  List<dynamic> _reservations = [];
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
      _fetchReservations();
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchReservations() async {
    try {
      final response = await ApiService.get('/reservations/me');
      if (response.statusCode == 200) {
        setState(() {
          _reservations = jsonDecode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _payDeposit(String id) async {
    try {
      final response = await ApiService.put('/reservations/$id/pay', {});
      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payment Successful! Deposit received.')),
          );
          _fetchReservations();
        }
      }
    } catch (e) {
      debugPrint('Payment failed: $e');
    }
  }

  void _showBookingModal() {
    String date = DateTime.now().add(const Duration(days: 1)).toString().split(' ')[0];
    String time = "19:00";
    String partySize = "2";
    String notes = "";

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (BuildContext context, StateSetter setModalState) {
          return Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Book a Table', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                TextField(
                  decoration: const InputDecoration(labelText: 'Date (YYYY-MM-DD)', border: OutlineInputBorder()),
                  controller: TextEditingController(text: date),
                  onChanged: (v) => date = v,
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(labelText: 'Time (HH:MM)', border: OutlineInputBorder()),
                  controller: TextEditingController(text: time),
                  onChanged: (v) => time = v,
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(labelText: 'Party Size', border: OutlineInputBorder()),
                  keyboardType: TextInputType.number,
                  controller: TextEditingController(text: partySize),
                  onChanged: (v) => partySize = v,
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(labelText: 'Special Request (Optional)', border: OutlineInputBorder()),
                  onChanged: (v) => notes = v,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () async {
                      try {
                        await ApiService.post('/reservations', {
                          'date': date,
                          'time': time,
                          'partySize': int.tryParse(partySize) ?? 2,
                          'specialRequest': notes
                        });
                        if (mounted) {
                          Navigator.pop(ctx);
                          _fetchReservations();
                        }
                      } catch (e) {
                         debugPrint('Failed to book table: $e');
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                    child: const Text('Confirm Booking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        }
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('My Reservations', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : !auth.isAuthenticated
          ? _buildLoginPrompt()
          : _reservations.isEmpty
            ? Center(child: Text('No reservations yet.', style: GoogleFonts.poppins(color: Colors.grey)))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _reservations.length + 1,
                itemBuilder: (ctx, i) {
                  if (i == _reservations.length) {
                    return const SizedBox(height: 160);
                  }
                  final r = _reservations[i];
                  return Card(
                    color: Theme.of(context).cardTheme.color,
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.withOpacity(0.1))),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${r['date'].toString().split('T')[0]} at ${r['time']}', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
                              Container(
                                 padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                 decoration: BoxDecoration(color: r['status'] == 'CONFIRMED' ? Colors.green.shade50 : Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                                 child: Text(r['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: r['status'] == 'CONFIRMED' ? Colors.green : Colors.grey.shade700)),
                              )
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('Party of ${r['partySize']}', style: GoogleFonts.poppins(color: Colors.grey.shade600, fontSize: 14)),
                          if (r['table'] != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text('Table: ${r['table']['tableNumber']}', style: GoogleFonts.poppins(color: Colors.green, fontWeight: FontWeight.bold)),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text('Reason: ${r['rejectionReason']}', style: GoogleFonts.poppins(color: Colors.red.shade400, fontSize: 13, fontWeight: FontWeight.w500)),
                            ),
                          if (r['status'] == 'AWAITING_PAYMENT')
                            Padding(
                              padding: const EdgeInsets.only(top: 12),
                              child: SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: () => _payDeposit(r['id']),
                                  icon: const Icon(Icons.payment_rounded, size: 18),
                                  label: Text('Pay Deposit (₹${r['depositAmount']})'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.primary,
                                    side: const BorderSide(color: AppColors.primary),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                            ),
                        ]
                      )
                    )
                  );
                }
              ),
       floatingActionButton: auth.isAuthenticated ? Padding(
         padding: const EdgeInsets.only(bottom: 110),
         child: FloatingActionButton.extended(
           onPressed: _showBookingModal,
           backgroundColor: AppColors.primary,
           icon: const Icon(Icons.table_restaurant_rounded, color: Colors.white),
           label: const Text('Book Table', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
         ),
       ) : null,
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
              decoration: const BoxDecoration(
                color: Color(0xFFF9FAFB),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.lock_person_rounded, size: 60, color: AppColors.primary.withOpacity(0.3)),
            ).animate().scale(duration: 600.ms, curve: Curves.bounceOut),
            const SizedBox(height: 32),
            Text(
              'Login Required',
              style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface),
            ),
            const SizedBox(height: 12),
            Text(
              'Please login to manage your table bookings\nand view your reservation status.',
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
                  backgroundColor: AppColors.primary,
                ),
                child: const Text('Login Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
