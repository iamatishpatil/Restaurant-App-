import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../models/menu_item.dart';
import '../providers/cart_provider.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../widgets/food_card.dart';
import '../widgets/category_item.dart';
import '../widgets/search_bar.dart';
import '../widgets/banner_widget.dart';
import '../widgets/shimmer_widget.dart';
import '../utils/constants.dart';
import '../providers/mode_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'profile_screen.dart';
import 'notifications_screen.dart';
import '../providers/table_provider.dart';
import 'qr_scanner_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<MenuItem> _items = [];
  List<MenuItem> _allItems = [];
  List<dynamic> _categories = [];
  List<dynamic> _banners = [];
  String _selectedCategoryId = 'ALL';
  bool _isLoading = true;
  int _bannerIndex = 0;
  List<MenuItem> _buyAgainItems = [];
  List<MenuItem> _suggestionItems = [];
  int _waitTime = 15;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    try {
      final responses = await Future.wait([
        ApiService.get('/menu/categories'),
        ApiService.get('/menu/items'),
        ApiService.get('/admin/banners'),
        ApiService.get('/orders/recommendations'),
        ApiService.get('/orders/wait-time'),
      ]);

      if (responses[0].statusCode == 200) {
        _categories = jsonDecode(responses[0].body);
      }
      if (responses[1].statusCode == 200) {
        final List<dynamic> data = jsonDecode(responses[1].body);
        _items = data.map((item) => MenuItem.fromJson(item)).toList();
        _allItems = List.from(_items);
      }
      if (responses[2].statusCode == 200) {
        _banners = jsonDecode(responses[2].body);
      }
      if (responses[3].statusCode == 200) {
        final recData = jsonDecode(responses[3].body);
        _buyAgainItems = (recData['buyAgain'] as List).map((i) => MenuItem.fromJson(i)).toList();
        _suggestionItems = (recData['suggestions'] as List).map((i) => MenuItem.fromJson(i)).toList();
      }
      if (responses[4].statusCode == 200) {
        _waitTime = jsonDecode(responses[4].body)['estimatedWait'] ?? 15;
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching home data: $e');
      setState(() => _isLoading = false);
    }
  }

  List<MenuItem> _getFilteredItems(bool isVegMode) {
    return _items.where((item) => item.isVeg == isVegMode).toList();
  }

  Future<void> _fetchFilteredItems(String categoryId) async {
    setState(() => _isLoading = true);
    try {
      final endpoint = categoryId == 'ALL' ? '/menu/items' : '/menu/items?categoryId=$categoryId';
      final response = await ApiService.get(endpoint);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _items = data.map((item) => MenuItem.fromJson(item)).toList();
          _allItems = List.from(_items);
          _selectedCategoryId = categoryId;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error filtering menu: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CRAVYO',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: AppColors.primary,
                letterSpacing: 2,
              ),
            ),
            Text(
              'Premium Dining',
              style: GoogleFonts.poppins(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
          ],
        ),
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        actions: [
          Consumer<ModeProvider>(
            builder: (context, mode, _) {
              return GestureDetector(
                onTap: () => mode.toggleMode(),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: mode.isVegMode ? const Color(0xFF00C853).withOpacity(0.1) : AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: mode.isVegMode ? const Color(0xFF00C853).withOpacity(0.3) : AppColors.primary.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        mode.isVegMode ? Icons.spa_rounded : Icons.kebab_dining_rounded,
                        color: mode.isVegMode ? const Color(0xFF00C853) : AppColors.primary,
                        size: 14,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        mode.isVegMode ? 'VEG' : 'NON-VEG',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: mode.isVegMode ? const Color(0xFF00C853) : AppColors.primary,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
            child: Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: Icon(Icons.notifications_none_rounded, color: Theme.of(context).colorScheme.onSurface, size: 22),
            ),
          ),
          Consumer<TableProvider>(
            builder: (context, table, _) {
              if (!table.hasTable) return const SizedBox.shrink();
              return FutureBuilder(
                future: ApiService.get('/tables/${table.activeTableId}/bill'),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
                    final response = snapshot.data as dynamic;
                    if (response.statusCode == 200) {
                      final data = jsonDecode(response.body);
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.receipt_long_rounded, color: AppColors.primary, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '₹${data['totalAmount']}',
                              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primary),
                            ),
                          ],
                        ),
                      );
                    }
                  }
                  return const SizedBox.shrink();
                },
              );
            }
          ),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QRScannerScreen())),
            child: Consumer<TableProvider>(
              builder: (context, table, _) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: table.hasTable ? const Color(0xFF2D4B1F).withOpacity(0.1) : Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: table.hasTable ? const Color(0xFF2D4B1F).withOpacity(0.3) : Theme.of(context).dividerColor),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        table.hasTable ? Icons.table_restaurant_rounded : Icons.qr_code_scanner_rounded, 
                        color: table.hasTable ? const Color(0xFF2D4B1F) : Theme.of(context).colorScheme.onSurface, 
                        size: 20
                      ),
                      if (table.hasTable) ...[
                        const SizedBox(width: 6),
                        Text(
                          '#${table.activeTableNumber}',
                          style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF2D4B1F)),
                        ),
                      ],
                    ],
                  ),
                );
              }
            ),
          ),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
            child: Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: Icon(Icons.person_outline_rounded, color: Theme.of(context).colorScheme.onSurface, size: 22),
            ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
        ),
        child: RefreshIndicator(
          onRefresh: _fetchInitialData,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Bar Section
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: CravyoSearchBar(
                    onChanged: (val) {
                      setState(() {
                        _items = _allItems.where((item) => item.name.toLowerCase().contains(val.toLowerCase())).toList();
                      });
                    },
                  ),
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0, curve: Curves.easeOutBack),
  
                if (_isLoading) _buildShimmerLoading() else ...[
                  ...[
                    CarouselSlider.builder(
                      itemCount: _banners.length,
                      itemBuilder: (context, index, realIndex) {
                        final banner = _banners[index];
                        return CravyoBanner(title: banner['title'], imageUrl: banner['image']);
                      },
                      options: CarouselOptions(
                        height: 220, // Taller for premium
                        viewportFraction: 1.0,
                        autoPlay: true,
                        autoPlayCurve: Curves.fastOutSlowIn,
                        autoPlayAnimationDuration: const Duration(milliseconds: 800),
                        onPageChanged: (index, reason) => setState(() => _bannerIndex = index),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: AnimatedIndicator(
                        activeIndex: _bannerIndex,
                        count: _banners.length,
                      ),
                    ),
                  ],
  
                  // Categories
                  const SizedBox(height: 8),
                  _buildSectionHeader('Explore Menu', icon: Icons.explore_rounded, onSeeAll: () {}),
                  SizedBox(
                    height: 110,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _categories.length + 1,
                      itemBuilder: (ctx, i) {
                        if (i == 0) {
                          return CravyoCategoryItem(
                            id: 'ALL',
                            name: 'All',
                            icon: Icons.restaurant_menu_rounded,
                            isSelected: _selectedCategoryId == 'ALL',
                            onTap: () => _fetchFilteredItems('ALL'),
                          );
                        }
                        final cat = _categories[i - 1];
                        return CravyoCategoryItem(
                          id: cat['id'],
                          name: cat['name'],
                          icon: _getCategoryIcon(cat['name']),
                          imageUrl: cat['image'],
                          isSelected: _selectedCategoryId == cat['id'],
                          onTap: () => _fetchFilteredItems(cat['id']),
                        );
                      },
                    ),
                  ).animate().fadeIn(delay: 100.ms, duration: 400.ms).slideX(begin: 0.2, end: 0, curve: Curves.easeOutCubic),
  
                  if (_buyAgainItems.isNotEmpty) ...[
                    _buildSectionHeader('Buy it again', icon: Icons.history_rounded),
                    SizedBox(
                      height: 340,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: _buyAgainItems.length,
                        itemBuilder: (ctx, i) => SizedBox(
                          width: 170,
                          child: CravyoFoodCard(item: _buyAgainItems[i]),
                        ),
                      ),
                    ).animate().fadeIn(delay: 300.ms),
                  ],

                  if (_suggestionItems.isNotEmpty) ...[
                    _buildSectionHeader('Recommended for You', icon: Icons.auto_awesome_rounded),
                    SizedBox(
                      height: 340,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: _suggestionItems.length,
                        itemBuilder: (ctx, i) => SizedBox(
                          width: 170,
                          child: CravyoFoodCard(item: _suggestionItems[i]),
                        ),
                      ),
                    ).animate().fadeIn(delay: 400.ms),
                  ],

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 15,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.timer_outlined, color: Colors.white, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Current Prep Time: $_waitTime mins',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  'Freshly cooked for you by our master chefs',
                                  style: GoogleFonts.poppins(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 500.ms).slideX(),
                  _buildSectionHeader('Popular Dishes', icon: Icons.star_rounded),
  
                  Consumer<ModeProvider>(
                    builder: (context, mode, _) {
                      final filteredItems = _items.where((item) {
                        return item.isVeg == mode.isVegMode;
                      }).toList();

                      if (filteredItems.isEmpty) return _buildEmptyState();

                      return GridView.builder(
                        shrinkWrap: true,
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 1,
                          childAspectRatio: 1.05,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 24,
                        ),
                        itemCount: filteredItems.length,
                        itemBuilder: (ctx, i) {
                          return CravyoFoodCard(item: filteredItems[i])
                            .animate()
                            .fadeIn(delay: (i * 100).ms, duration: 400.ms)
                            .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1), curve: Curves.easeOutBack);
                        },
                      );
                    },
                  ),
                ],
                const SizedBox(height: 120),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String? name) {
    if (name == null || name.isEmpty) return Icons.fastfood_rounded;
    final n = name.trim().toLowerCase();
    
    // Beverage & Drinks
    if (n.contains('beverage') || n.contains('drink') || n.contains('juice') || n.contains('tea') || n.contains('coffee') || n.contains('shake')) {
      return Icons.local_drink_rounded;
    }
    
    // Main Course, Rice & Biryani
    if (n.contains('biryani') || n.contains('rice') || n.contains('pulao') || n.contains('thali')) {
      return Icons.rice_bowl_rounded;
    }
    
    // Breads
    if (n.contains('bread') || n.contains('roti') || n.contains('naan') || n.contains('kulcha') || n.contains('paratha')) {
      return Icons.bakery_dining_rounded;
    }
    
    // Fast Food
    if (n.contains('burger')) return Icons.lunch_dining_rounded;
    if (n.contains('pizza')) return Icons.local_pizza_rounded;
    if (n.contains('sandwich')) return Icons.lunch_dining_rounded;
    
    // Deserts & Sweets
    if (n.contains('dessert') || n.contains('sweet') || n.contains('cake') || n.contains('ice cream') || n.contains('pudding')) {
      return Icons.icecream_rounded;
    }
    
    // Non-Veg
    if (n.contains('chicken') || n.contains('meat') || n.contains('fish') || n.contains('mutton') || n.contains('kebab')) {
      return Icons.kebab_dining_rounded;
    }
    
    // Veg & Starters
    if (n.contains('salad') || n.contains('veg') || n.contains('starter') || n.contains('paneer')) {
      return Icons.spa_rounded;
    }
    
    // Regional & Others
    if (n.contains('south indian') || n.contains('dosa') || n.contains('idli')) return Icons.dinner_dining_rounded;
    if (n.contains('chinese') || n.contains('noodle') || n.contains('soup')) return Icons.ramen_dining_rounded;
    
    return Icons.restaurant_rounded;
  }

  Widget _buildSectionHeader(String title, {IconData? icon, VoidCallback? onSeeAll}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20, color: AppColors.primary),
                const SizedBox(width: 8),
              ],
              Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          if (onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll,
              child: Text(
                'See All',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1), alignment: Alignment.centerLeft);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3), shape: BoxShape.circle),
              child: Icon(Icons.search_off_rounded, size: 48, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3)),
            ),
            const SizedBox(height: 20),
            Text('No dishes found', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Try adjusting your search or category', style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return Column(
      children: [
        const SizedBox(height: 16),
        const CravyoShimmer(width: double.infinity, height: 180, borderRadius: AppRadius.xl),
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: List.generate(4, (i) => const Expanded(child: Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: CravyoShimmer(width: 80, height: 80, borderRadius: 40)))),
          ),
        ),
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.62, crossAxisSpacing: 16, mainAxisSpacing: 16),
            itemCount: 4,
            itemBuilder: (_, __) => const CravyoShimmer(width: double.infinity, height: 210, borderRadius: AppRadius.xl),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 800.ms);
  }
}

class AnimatedIndicator extends StatelessWidget {
  final int activeIndex;
  final int count;

  const AnimatedIndicator({
    super.key,
    required this.activeIndex,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSmoothIndicator(
      activeIndex: activeIndex,
      count: count,
      effect: ExpandingDotsEffect(
        dotHeight: 6,
        dotWidth: 6,
        activeDotColor: AppColors.primary,
        dotColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.1),
        expansionFactor: 4,
        spacing: 4,
      ),
    );
  }
}
