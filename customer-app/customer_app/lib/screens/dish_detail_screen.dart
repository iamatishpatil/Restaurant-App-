import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../models/menu_item.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import '../services/api_service.dart';
import '../services/review_service.dart';
import 'package:cached_network_image/cached_network_image.dart';

class DishDetailScreen extends StatefulWidget {
  final MenuItem item;

  const DishDetailScreen({super.key, required this.item});

  @override
  State<DishDetailScreen> createState() => _DishDetailScreenState();
}

class _DishDetailScreenState extends State<DishDetailScreen> {
  int _quantity = 1;
  List<dynamic> _reviews = [];
  bool _isLoadingReviews = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() => _isLoadingReviews = true);
    final reviews = await ReviewService.fetchReviews(widget.item.id);
    if (mounted) {
      setState(() {
        _reviews = reviews;
        _isLoadingReviews = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: 420,
            pinned: true,
            stretch: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(15),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                      ),
                      child: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Hero(
                    tag: 'dish_${widget.item.id}',
                    child: CachedNetworkImage(
                      imageUrl: ApiService.getImageUrl(widget.item.image),
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withOpacity(0.3),
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                          stops: const [0.0, 0.4, 1.0],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 30,
                    left: 20,
                    right: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'CHEFS SPECIAL',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                            ),
                          ),
                        ).animate().fadeIn(duration: 600.ms).slideX(begin: -0.2, end: 0),
                        const SizedBox(height: 8),
                        Text(
                          widget.item.name,
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                          ),
                        ).animate().fadeIn(delay: 200.ms, duration: 600.ms).slideX(begin: -0.1, end: 0),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildInfoChip(Icons.timer_outlined, '${widget.item.preparationTime ?? 25} min'),
                      _buildInfoChip(Icons.local_fire_department_outlined, '450 kcal'),
                      _buildInfoChip(Icons.star_rounded, '${widget.item.rating} Rating', color: Colors.amber),
                    ],
                  ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
                  const SizedBox(height: 32),
                  Text(
                    'Description',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.item.description ?? 'Experience the perfect harmony of fresh ingredients and traditional recipes. Our master chefs bring you a dish that is as beautiful to look at as it is to taste.',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      height: 1.8,
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ).animate().fadeIn(delay: 400.ms),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Quantity',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      _buildQuantitySelector(),
                    ],
                  ).animate().fadeIn(delay: 500.ms),
                  const SizedBox(height: 32),
                  _buildReviewsSection(),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: _buildPremiumActionBar(),
    );
  }

  Widget _buildReviewsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Reviews (${_reviews.length})',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            TextButton(
              onPressed: _showReviewSheet,
              child: Text(
                'Write a Review',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_isLoadingReviews)
          const Center(child: CircularProgressIndicator())
        else if (_reviews.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.chat_bubble_outline_rounded, color: AppColors.primary.withOpacity(0.5)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'No reviews yet. Be the first to share your experience!',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _reviews.length > 3 ? 3 : _reviews.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final review = _reviews[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.05)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          review['user']['name'] ?? 'Guest',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Row(
                          children: List.generate(5, (i) => Icon(
                            Icons.star_rounded,
                            size: 14,
                            color: i < review['rating'] ? Colors.amber : Colors.grey.withOpacity(0.3),
                          )),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      review['comment'] ?? '',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  void _showReviewSheet() {
    int selectedRating = 5;
    bool isPosting = false;
    final commentController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 32,
            top: 32,
            left: 24,
            right: 24,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Rate this dish',
                style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Text(
                'How was your experience with ${widget.item.name}?',
                style: GoogleFonts.poppins(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) => GestureDetector(
                  onTap: () => setModalState(() => selectedRating = index + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(
                      Icons.star_rounded,
                      size: 42,
                      color: index < selectedRating ? Colors.amber : Colors.grey.withOpacity(0.3),
                    ),
                  ),
                )),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: commentController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Share your thoughts...',
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              GestureDetector(
                onTap: isPosting ? null : () async {
                  if (commentController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter a comment')),
                    );
                    return;
                  }

                  final auth = Provider.of<AuthProvider>(context, listen: false);
                  if (!auth.isAuthenticated) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please login to post a review')),
                    );
                    return;
                  }

                  setModalState(() => isPosting = true);
                  final ok = await ReviewService.addReview(
                    menuItemId: widget.item.id,
                    rating: selectedRating,
                    comment: commentController.text,
                  );
                  
                  if (ok) {
                    if (mounted) Navigator.pop(context);
                    _loadReviews();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Review shared! Thank you.')),
                    );
                  } else {
                    setModalState(() => isPosting = false);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Failed to post review. Please try again.')),
                    );
                  }
                },
                child: Container(
                  height: 60,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: isPosting ? null : AppColors.primaryGradient,
                    color: isPosting ? Colors.grey : null,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  alignment: Alignment.center,
                  child: isPosting 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        'Post Review',
                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w800),
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, {Color? color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color ?? AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuantitySelector() {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _qBtn(Icons.remove_rounded, () { if (_quantity > 1) setState(() => _quantity--); }),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              _quantity.toString(),
              style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w900),
            ),
          ),
          _qBtn(Icons.add_rounded, () { setState(() => _quantity++); }, fill: true),
        ],
      ),
    );
  }

  Widget _qBtn(IconData icon, VoidCallback onTap, {bool fill = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: fill ? AppColors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(15),
          boxShadow: fill ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)] : [],
        ),
        child: Icon(icon, size: 20, color: AppColors.primary),
      ),
    );
  }

  Widget _buildPremiumActionBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Price per person',
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 2),
              Text(
                '${AppConstants.currency}${(widget.item.price * _quantity).toStringAsFixed(0)}',
                style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(width: 24),
          Expanded(
            child: GestureDetector(
              onTap: _handleAddToCart,
              child: Container(
                height: 64,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      'Add to Bag',
                      style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ).animate().shimmer(delay: 1.seconds, duration: 2.seconds),
          ),
        ],
      ),
    );
  }

  void _handleAddToCart() {
    final cart = Provider.of<CartProvider>(context, listen: false);
    for (int i = 0; i < _quantity; i++) {
      cart.addItem(widget.item);
    }
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Delight added to bag!'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.slateMidnight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        margin: const EdgeInsets.all(20),
      ),
    );
  }
}
