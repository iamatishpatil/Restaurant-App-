import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'login_screen.dart';
import 'orders_screen.dart';
import 'address_screen.dart';
import 'support_screen.dart';
import '../providers/theme_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Profile',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface, fontSize: 20),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: user == null 
            ? _buildLoginPrompt(context)
            : Column(
                children: [
                  const SizedBox(height: 32),
                  _buildProfileHeader(context, auth, user).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
                  const SizedBox(height: 48),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: [
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.location_on_rounded, 'Delivery Addresses', () {
                            if (auth.isAuthenticated) {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressScreen()));
                            } else {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                            }
                          }),
                          _buildProfileTile(context, Icons.history_rounded, 'Order History', () {
                            if (auth.isAuthenticated) {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
                            } else {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                            }
                          }),
                        ]),
                        const SizedBox(height: 16),
                        _buildProfileCard([
                          _buildThemeToggle(context),
                        ]),
                        const SizedBox(height: 16),
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.support_agent_rounded, 'Help & Support', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()))),
                          _buildProfileTile(context, Icons.security_rounded, 'Privacy & Safety', () {}),
                        ]),
                        const SizedBox(height: 16),
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.logout_rounded, 'Logout Account', () => _showLogoutConfirmation(context, auth), color: AppColors.primary),
                        ]),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1, end: 0),
                  const SizedBox(height: 120),
                ],
              ),
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          children: [
            const SizedBox(height: 100),
            Container(
              height: 140,
              width: 140,
              decoration: BoxDecoration(
                color: AppColors.surface1,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.person_3_outlined, size: 60, color: AppColors.primary.withOpacity(0.3)),
            ).animate().scale(duration: 600.ms, curve: Curves.bounceOut),
            const SizedBox(height: 40),
            Text(
              'Join the Culinary Community',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w900, color: Theme.of(context).colorScheme.onSurface),
            ),
            const SizedBox(height: 16),
            Text(
              'Login to manage your orders, save addresses\nand unlock exclusive dining rewards.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6), height: 1.5),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('LOGIN TO YOUR ACCOUNT'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, AuthProvider auth, dynamic user) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary.withOpacity(0.12), width: 4),
              ),
              child: CircleAvatar(
                radius: 56,
                backgroundColor: Theme.of(context).colorScheme.surfaceVariant,
                child: const Icon(Icons.person_rounded, size: 60, color: AppColors.primary),
              ),
            ),
            GestureDetector(
              onTap: () => _showEditDialog(context, auth, user),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.onSurface, 
                  shape: BoxShape.circle,
                  border: Border.all(color: Theme.of(context).scaffoldBackgroundColor, width: 3),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Icon(Icons.edit_rounded, size: 16, color: Theme.of(context).scaffoldBackgroundColor),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          user.name, 
          style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w900, color: Theme.of(context).colorScheme.onSurface),
        ),
        const SizedBox(height: 4),
        Text(
          user.email ?? user.phone ?? 'Member since 2024', 
          style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
        ),
      ],
    );
  }

  Widget _buildThemeToggle(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.08), 
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(
          themeProvider.isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded, 
          color: AppColors.primary, 
          size: 22
        ),
      ),
      title: Text(
        'Appearance', 
        style: GoogleFonts.poppins(
          color: Theme.of(context).colorScheme.onSurface, 
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
      ),
      subtitle: Text(
        themeProvider.isDarkMode ? 'Dark Mode Active' : 'Light Mode Active',
        style: GoogleFonts.poppins(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5)),
      ),
      trailing: Switch.adaptive(
        value: themeProvider.isDarkMode, 
        onChanged: (val) => themeProvider.toggleTheme(val),
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildProfileCard(List<Widget> children) {
    return Builder(
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.2 : 0.04),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(children: children),
        );
      }
    );
  }

  Widget _buildProfileTile(BuildContext context, IconData icon, String title, VoidCallback onTap, {Color? color}) {
    final textColor = color ?? Theme.of(context).colorScheme.onSurface;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: textColor.withOpacity(0.08), 
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: textColor, size: 22),
      ),
      title: Text(
        title, 
        style: GoogleFonts.poppins(
          color: textColor, 
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPlaceholder),
      onTap: onTap,
    );
  }

  void _showLogoutConfirmation(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Text('Logout', style: GoogleFonts.poppins(fontWeight: FontWeight.w900)),
        content: Text('Are you sure you want to end your session?', style: GoogleFonts.poppins()),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: GoogleFonts.poppins(color: AppColors.textSecondary))),
          ElevatedButton(
            onPressed: () {
              auth.logout();
              Navigator.pop(ctx);
            }, 
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF5252),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, AuthProvider auth, dynamic user) {
    final nameController = TextEditingController(text: user.name);
    final emailController = TextEditingController(text: user.email);
    final phoneController = TextEditingController(text: user.phone);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Text('Edit Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.w900)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildEditField(ctx, nameController, 'Full Name', Icons.person_rounded),
              const SizedBox(height: 16),
              _buildEditField(ctx, emailController, 'Email Address', Icons.email_rounded),
              const SizedBox(height: 16),
              _buildEditField(ctx, phoneController, 'Phone Number', Icons.phone_rounded),
            ],
          ),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: GoogleFonts.poppins(color: AppColors.textSecondary))),
          SizedBox(
            width: 120,
            height: 48,
            child: ElevatedButton(
              onPressed: () async {
                final success = await auth.updateProfile(nameController.text, emailController.text, phoneController.text);
                if (success) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Profile updated'),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    )
                  );
                }
              }, 
              child: const Text('Save'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditField(BuildContext context, TextEditingController controller, String label, IconData icon) {
    return TextField(
      controller: controller,
      style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
        prefixIcon: Icon(icon, size: 20, color: AppColors.primary),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
        filled: true,
        fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
