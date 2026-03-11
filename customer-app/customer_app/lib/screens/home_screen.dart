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
import '../providers/location_provider.dart';
import '../widgets/location_selector_sheet.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final location = Provider.of<LocationProvider>(context, listen: false);
      
      // Auto-detect live location on first load
      if (!location.isLocationSet) {
        location.determinePosition().then((_) {
          // If after detection it's still not set (e.g. failed), show picker
          if (!location.isLocationSet && mounted) {
            showModalBottomSheet(
              context: context,
              backgroundColor: Colors.transparent,
              isScrollControlled: true,
              builder: (context) => const LocationSelectorSheet(),
            );
          }
        });
      }
    });
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    try {
      final responses = await Future.wait([
        ApiService.get('/menu/categories'),
        ApiService.get('/menu/items'),
        ApiService.get('/admin/banners'),
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

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching home data: $e');
      setState(() => _isLoading = false);
    }
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
        title: Consumer<LocationProvider>(
          builder: (context, location, _) => GestureDetector(
            onTap: () {
              showModalBottomSheet(
                context: context,
                backgroundColor: Colors.transparent,
                isScrollControlled: true,
                builder: (context) => const LocationSelectorSheet(),
              );
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'DELIVERING TO',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 16),
                  ],
                ),
                Text(
                  location.currentAddress, 
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        surfaceTintColor: Theme.of(context).scaffoldBackgroundColor,
        actions: [
          GestureDetector(
            onTap: () {},
            child: Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(
                color: AppColors.surface1,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.surface3.withOpacity(0.5)),
              ),
              child: const Icon(Icons.notifications_none_rounded, color: AppColors.text, size: 22),
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
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0),
  
                if (_isLoading) _buildShimmerLoading() else ...[
                  // Banners Carousel
                  if (_banners.isNotEmpty) ...[
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
                    const SizedBox(height: 8),
                    Center(
                      child: AnimatedIndicator(
                        activeIndex: _bannerIndex,
                        count: _banners.length,
                      ),
                    ),
                  ],
  
                  // Categories
                  const SizedBox(height: 8),
                  _buildSectionHeader('What\'s on your mind?', onSeeAll: () {}),
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
                          icon: Icons.fastfood_rounded,
                          imageUrl: cat['image'],
                          isSelected: _selectedCategoryId == cat['id'],
                          onTap: () => _fetchFilteredItems(cat['id']),
                        );
                      },
                    ),
                  ).animate().fadeIn(delay: 200.ms),
  
                  _buildSectionHeader('Popular Dishes'),
  
                  _items.isEmpty 
                  ? _buildEmptyState()
                  : GridView.builder(
                        shrinkWrap: true,
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.68,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: _items.length,
                        itemBuilder: (ctx, i) {
                          return CravyoFoodCard(item: _items[i]);
                        },
                      ),
                ],
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onSeeAll}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
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
    );
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
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.68, crossAxisSpacing: 16, mainAxisSpacing: 16),
            itemCount: 4,
            itemBuilder: (_, __) => const CravyoShimmer(width: double.infinity, height: 200, borderRadius: AppRadius.xl),
          ),
        ),
      ],
    );
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
