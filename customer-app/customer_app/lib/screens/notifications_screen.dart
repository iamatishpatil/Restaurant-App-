import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
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
      _fetchNotifications();
    } else {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchNotifications() async {
    try {
      final response = await ApiService.get('/notifications');
      if (response.statusCode == 200) {
        setState(() {
          _notifications = jsonDecode(response.body);
          _isLoading = false;
        });
        // Mark all as read after viewing
        for (var n in _notifications) {
          if (!n['isRead']) {
            ApiService.put('/notifications/${n['id']}/read', {});
          }
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('Notifications', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 18)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : !auth.isAuthenticated
          ? _buildLoginPrompt()
          : _notifications.isEmpty
            ? _buildEmptyState()
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _notifications.length,
                itemBuilder: (ctx, i) {
                  final n = _notifications[i];
                  return _buildNotificationCard(n).animate().fadeIn(delay: (i * 50).ms).slideX(begin: 0.1, end: 0);
                }
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
              decoration: const BoxDecoration(
                color: Color(0xFFF9FAFB),
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
              'Please login to see your notifications\nand get updates on your orders.',
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

  Widget _buildNotificationCard(dynamic n) {
    final isRead = n['isRead'] ?? false;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isRead ? Theme.of(context).cardTheme.color : AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isRead ? Colors.grey.withOpacity(0.1) : AppColors.primary.withOpacity(0.1)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: _getIconColor(n['type']).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(_getIcon(n['type']), color: _getIconColor(n['type']), size: 20),
        ),
        title: Text(
          n['title'], 
          style: GoogleFonts.poppins(fontWeight: isRead ? FontWeight.w600 : FontWeight.w800, fontSize: 14)
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            n['message'], 
            style: GoogleFonts.poppins(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6))
          ),
        ),
        trailing: Text(
          _getTimeAgo(n['createdAt']),
          style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_none_rounded, size: 80, color: Colors.grey.withOpacity(0.3)),
          const SizedBox(height: 20),
          Text('All caught up!', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 8),
          Text('Check back later for updates.', style: GoogleFonts.poppins(color: Colors.grey.withOpacity(0.6))),
        ],
      ),
    );
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'RESERVATION': return Icons.table_restaurant_rounded;
      case 'ORDER': return Icons.receipt_long_rounded;
      default: return Icons.notifications_active_rounded;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'RESERVATION': return Colors.blue;
      case 'ORDER': return Colors.orange;
      default: return AppColors.primary;
    }
  }

  String _getTimeAgo(String dateStr) {
    final date = DateTime.parse(dateStr);
    final diff = DateTime.now().difference(date);
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }
}
