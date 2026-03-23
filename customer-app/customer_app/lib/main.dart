import 'package:flutter/material.dart';
import 'dart:ui';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/navigation_provider.dart';
import 'providers/mode_provider.dart';
import 'providers/table_provider.dart';
import 'providers/order_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/reservations_screen.dart';
import 'screens/order_tracking_screen.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';

import 'services/cache_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await CacheService.init();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => NavigationProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => ModeProvider()),
        ChangeNotifierProvider(create: (_) => TableProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
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
      title: 'The Grand Maharaja Cuisine',
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
  Timer? _orderTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchInitialData();
    });
    // Poll for active orders every 60 seconds
    _orderTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        Provider.of<OrderProvider>(context, listen: false).fetchActiveOrder();
      }
    });
  }

  void _fetchInitialData() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.tryAutoLogin();
    if (auth.isAuthenticated) {
      if (mounted) {
        Provider.of<OrderProvider>(context, listen: false).fetchActiveOrder();
      }
    }
  }

  @override
  void dispose() {
    _orderTimer?.cancel();
    super.dispose();
  }

  final List<Widget> _screens = [
    const HomeScreen(),
    const ReservationsScreen(),
    const CartScreen(),
    const OrdersScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final nav = Provider.of<NavigationProvider>(context);

    return Scaffold(
      extendBody: true, // Allows content to be visible behind the bottom bar
      body: Stack(
        children: [
          _screens[nav.selectedIndex],
          
          // Floating Bottom Components Layer
          Align(
            alignment: Alignment.bottomCenter,
            child: SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;
                  return Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: isWide ? constraints.maxWidth * 0.2 : 16,
                      vertical: 16,
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildActiveOrderWidget(),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _buildBottomBar(nav)),
                            const SizedBox(width: 8),
                            _buildModeToggle(),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveOrderWidget() {
    return Consumer2<OrderProvider, AuthProvider>(
      builder: (context, orderProv, auth, _) {
        final activeOrder = orderProv.activeOrder;
        
        if (!auth.isAuthenticated || activeOrder == null) return const SizedBox.shrink();

        final status = (activeOrder['status'] ?? '').toString().toUpperCase();
        
        return GestureDetector(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(
              orderId: activeOrder['id'].toString(),
              status: activeOrder['status'],
            )));
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(25),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.slateMidnight.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(25),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 4))
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.restaurant_rounded, color: AppColors.primary, size: 18),
                    ).animate(onPlay: (controller) => controller.repeat())
                     .shimmer(duration: 2.seconds, color: Colors.white24),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Order Status: $status',
                            style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                          Text(
                            'Tap to track your delicious meal',
                            style: GoogleFonts.poppins(color: Colors.white.withOpacity(0.6), fontWeight: FontWeight.w500, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.4), size: 14),
                  ],
                ),
              ),
            ),
          ),
        ).animate().fadeIn().slideY(begin: 1, end: 0);
      },
    );
  }

  Widget _buildModeToggle() {
    return Consumer<ModeProvider>(
      builder: (context, mode, _) {
        final isVeg = mode.isVegMode;
        return GestureDetector(
          onTap: () => mode.toggleMode(),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(35),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isVeg ? const Color(0xFF2D4B1F).withOpacity(0.8) : AppColors.primary.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(35),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isVeg ? Icons.spa_rounded : Icons.kebab_dining_rounded,
                      color: Colors.white,
                      size: 18,
                    ).animate(target: isVeg ? 1 : 0).rotate(begin: 0, end: 0.1).scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), curve: Curves.elasticOut),
                    const SizedBox(width: 6),
                    Text(
                      isVeg ? 'VEG' : 'NON-VEG',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 10,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar(NavigationProvider nav) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(40),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color!.withOpacity(0.7),
            borderRadius: BorderRadius.circular(40),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround, // Better distribution
            children: [
              _navItem(0, Icons.home_outlined, Icons.home_rounded, 'HOME', nav),
              _navItem(1, Icons.event_available_outlined, Icons.event_available_rounded, 'BOOKINGS', nav),
              _navItem(2, Icons.shopping_bag_outlined, Icons.shopping_bag_rounded, 'CART', nav),
              _navItem(3, Icons.receipt_long_outlined, Icons.receipt_long_rounded, 'ORDERS', nav),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem(int index, IconData icon, IconData activeIcon, String label, NavigationProvider nav) {
    final isSelected = nav.selectedIndex == index;
    
    Widget iconWidget = Icon(
      isSelected ? activeIcon : icon,
      color: isSelected ? AppColors.primary : Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
      size: 24,
    ).animate(target: isSelected ? 1 : 0)
     .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 200.ms, curve: Curves.easeOutBack)
     .shake(hz: 2, offset: const Offset(1, 0));

    if (index == 2) {
      iconWidget = Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) return child!;
          return Badge(
            backgroundColor: AppColors.primary,
            label: Text(cart.items.length.toString(), style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold)),
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
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(height: 4),
            Text(
              isSelected ? label : '',
              style: GoogleFonts.poppins(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
                fontSize: 9,
                letterSpacing: 0.5,
              ),
            ).animate(target: isSelected ? 1 : 0)
             .fadeIn()
             .scale(begin: const Offset(0.5, 0.5), end: const Offset(1.1, 1.1), curve: Curves.elasticOut, duration: 600.ms),
          ],
        ).animate(
          target: isSelected ? 1 : 0,
          onPlay: (controller) => controller.repeat(reverse: true),
        )
         .shimmer(duration: 1200.ms, color: AppColors.primary.withOpacity(0.2))
         .moveY(begin: 0, end: -4, curve: Curves.easeInOutQuad, duration: 1.seconds)
         .moveY(begin: 0, end: 2, curve: Curves.easeInOut, duration: 2.seconds),
      ),
    );
  }
}
