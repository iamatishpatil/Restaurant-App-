import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import 'login_screen.dart';
import 'orders_screen.dart';
import 'address_screen.dart';
import 'support_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Profile', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: user == null 
            ? _buildLoginPrompt(context)
            : Column(
                children: [
                  const SizedBox(height: AppSpacing.xl),
                  _buildProfileHeader(context, auth, user),
                  const SizedBox(height: 32),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                    child: Column(
                      children: [
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.location_on_rounded, 'My Addresses', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressScreen()))),
                          _buildProfileTile(context, Icons.history_rounded, 'Order History', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()))),
                        ]),
                        const SizedBox(height: AppSpacing.l),
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.help_outline_rounded, 'Help & Support', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()))),
                          _buildProfileTile(context, Icons.privacy_tip_outlined, 'Privacy Policy', () {}),
                        ]),
                        const SizedBox(height: AppSpacing.l),
                        _buildProfileCard([
                          _buildProfileTile(context, Icons.logout_rounded, 'Logout', () => _showLogoutConfirmation(context, auth), color: Colors.red),
                        ]),
                      ],
                    ),
                  ),
                  const SizedBox(height: 120),
                ],
              ),
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          children: [
            const SizedBox(height: 60),
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(color: AppColors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
              child: Icon(Icons.person_outline_rounded, size: 64, color: AppColors.primary.withOpacity(0.2)),
            ),
            const SizedBox(height: 32),
            Text('Join Cravyo Today', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 12),
            Text('Login to save your addresses and track orders', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
              child: const Text('LOGIN TO YOUR ACCOUNT'),
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
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary.withOpacity(0.1), width: 4),
              ),
              child: CircleAvatar(
                radius: 60,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: const Icon(Icons.person_rounded, size: 60, color: AppColors.primary),
              ),
            ),
            GestureDetector(
              onTap: () => _showEditDialog(context, auth, user),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: AppColors.text, shape: BoxShape.circle),
                child: const Icon(Icons.edit_rounded, size: 18, color: Colors.white),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(user.name, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontSize: 24)),
        Text(user.email ?? user.phone ?? '', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _buildProfileCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildProfileTile(BuildContext context, IconData icon, String title, VoidCallback onTap, {Color? color}) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: (color ?? AppColors.text).withOpacity(0.05), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color ?? AppColors.text, size: 22),
      ),
      title: Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: color ?? AppColors.text, fontWeight: FontWeight.bold)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppColors.textSecondary),
      onTap: onTap,
    );
  }

  void _showLogoutConfirmation(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              auth.logout();
              Navigator.pop(ctx);
            }, 
            child: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
        title: const Text('Edit Profile'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildEditField(nameController, 'Full Name', Icons.person_rounded),
              const SizedBox(height: 16),
              _buildEditField(emailController, 'Email Address', Icons.email_rounded),
              const SizedBox(height: 16),
              _buildEditField(phoneController, 'Phone Number', Icons.phone_rounded),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final success = await auth.updateProfile(nameController.text, emailController.text, phoneController.text);
              if (success) {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated successfully')));
              }
            }, 
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Widget _buildEditField(TextEditingController controller, String label, IconData icon) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.m)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}
