import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/location_provider.dart';
import 'providers/navigation_provider.dart';
import 'providers/mode_provider.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/location_setup_screen.dart';
import 'providers/theme_provider.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
        ChangeNotifierProvider(create: (_) => NavigationProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => ModeProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    return MaterialApp(
      title: 'Cravyo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {

  @override
  void initState() {
    super.initState();
  }

  final List<Widget> _screens = [
    const HomeScreen(),
    const CartScreen(),
    const OrdersScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final nav = Provider.of<NavigationProvider>(context);

    return Scaffold(
      body: Stack(
        children: [
          _screens[nav.selectedIndex],
          Positioned(
            left: 16,
            right: 16,
            bottom: 30, // Elevated for floating feel
            child: Row(
              children: [
                Expanded(child: _buildBottomBar(nav)),
                const SizedBox(width: 8),
                _buildModeToggle(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModeToggle() {
    return Consumer<ModeProvider>(
      builder: (context, mode, _) {
        final isVeg = mode.isVegMode;
        return GestureDetector(
          onTap: () => mode.toggleMode(),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: isVeg ? const Color(0xFF2D4B1F) : const Color(0xFFC62828), // Dark forest green or deep red
              borderRadius: BorderRadius.circular(35),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isVeg ? Icons.volunteer_activism_rounded : Icons.flash_on_rounded, // Heart sparkle feel or non-veg icon
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  isVeg ? 'Non-Veg' : 'Veg',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar(NavigationProvider nav) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(40),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(Theme.of(context).brightness == Brightness.dark ? 0.3 : 0.08),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.06)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _navItem(0, Icons.home_outlined, Icons.home_rounded, 'Home', nav),
          _navItem(1, Icons.shopping_cart_outlined, Icons.shopping_cart_rounded, 'Cart', nav),
          _navItem(2, Icons.receipt_long_outlined, Icons.receipt_long_rounded, 'Orders', nav),
        ],
      ),
    );
  }

  Widget _navItem(int index, IconData icon, IconData activeIcon, String label, NavigationProvider nav) {
    final isSelected = nav.selectedIndex == index;
    
    Widget iconWidget = Icon(
      isSelected ? activeIcon : icon,
      color: isSelected ? AppColors.primary : Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
      size: 22,
    );

    // Apply badge conditionally on Cart (index 1)
    if (index == 1) {
      iconWidget = Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) return child!;
          return Badge(
            backgroundColor: AppColors.primary,
            smallSize: 8,
            child: child,
          );
        },
        child: iconWidget,
      );
    }

    return GestureDetector(
      onTap: () => nav.setIndex(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 400),
        curve: Curves.fastOutSlowIn,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(25),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.poppins(
                color: isSelected ? AppColors.primary : Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
