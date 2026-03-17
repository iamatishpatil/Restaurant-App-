import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'signup_screen.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../main.dart';
import 'name_setup_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _otpSent = false;

  void _sendOTP() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    final success = await Provider.of<AuthProvider>(context, listen: false)
        .sendOTP(_phoneController.text.trim());
    
    setState(() => _isLoading = false);
    if (success) {
      setState(() => _otpSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification code sent!'), behavior: SnackBarBehavior.floating)
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send OTP. Please try again.'), behavior: SnackBarBehavior.floating)
      );
    }
  }

  void _verifyOTP() async {
    if (_otpController.text.length < 4) return;
    
    setState(() => _isLoading = true);
    final success = await Provider.of<AuthProvider>(context, listen: false)
        .verifyOTP(_phoneController.text.trim(), _otpController.text.trim());
    
    setState(() => _isLoading = false);
    if (success) {
      if (mounted) {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        final name = auth.user?.name ?? '';
        if (name.startsWith('User ') && name.length > 5) { // Check if it's the auto-generated name
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const NameSetupScreen()));
        } else {
          Navigator.pop(context);
        }
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid OTP. Please check and try again.'), behavior: SnackBarBehavior.floating)
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(_otpSent ? 'Verification' : 'Welcome', style: GoogleFonts.poppins(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(_otpSent ? Icons.verified_user_rounded : Icons.smartphone_rounded, size: 60, color: AppColors.primary),
              ),
              const SizedBox(height: 48),
              if (!_otpSent) ...[
                Text('Mobile Login', style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text('Enter your mobile number to receive a verification code', 
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(color: AppColors.textSecondary)
                ),
                const SizedBox(height: 40),
                Form(
                  key: _formKey,
                  child: _buildTextField(_phoneController, 'Phone Number', Icons.phone_rounded, keyboardType: TextInputType.phone),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOTP,
                    child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white) 
                      : const Text('GET OTP', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  ),
                ),
              ] else ...[
                Text('Enter OTP', style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text('A 6-digit code has been sent to ${_phoneController.text}', 
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(color: AppColors.textSecondary)
                ),
                const SizedBox(height: 40),
                _buildTextField(_otpController, 'Verification Code', Icons.lock_clock_rounded, keyboardType: TextInputType.number, letterSpacing: 8.0),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOTP,
                    child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white) 
                      : const Text('VERIFY & LOGIN', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _otpSent = false),
                  child: const Text('Change Phone Number', style: TextStyle(color: AppColors.textSecondary)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboardType, double? letterSpacing}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface1,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surface3),
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        style: GoogleFonts.poppins(fontWeight: FontWeight.w600, letterSpacing: letterSpacing),
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: AppColors.primary),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        validator: (val) => val == null || val.isEmpty ? 'Required' : null,
      ),
    );
  }
}
