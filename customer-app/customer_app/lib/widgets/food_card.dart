import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../models/menu_item.dart';
import '../providers/cart_provider.dart';
import '../utils/constants.dart';
import '../screens/dish_detail_screen.dart';
import '../services/api_service.dart';

class CravyoFoodCard extends StatefulWidget {
  final MenuItem item;
  final String? heroTag; // Added for unique Hero transitions

  const CravyoFoodCard({super.key, required this.item, this.heroTag});

  @override
  State<CravyoFoodCard> createState() => _CravyoFoodCardState();
}

class _CravyoFoodCardState extends State<CravyoFoodCard> {
  double _scale = 1.0;

  void _onAddTension() async {
    setState(() => _scale = 1.2);
    await Future.delayed(100.ms);
    if (mounted) setState(() => _scale = 1.0);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(AppRadius.card),
        boxShadow: AppShadows.premiumShadow,
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.04), width: 1),
      ),
      child: GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => DishDetailScreen(item: widget.item)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Stack(
              children: [
                Hero(
                  tag: widget.heroTag ?? 'dish_${widget.item.id}',
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppRadius.card),
                    ),
                    child: Stack(
                      children: [
                        CachedNetworkImage(
                          imageUrl: ApiService.getImageUrl(widget.item.image),
                          fit: BoxFit.cover,
                          height: 220, 
                          width: double.infinity,
                          placeholder: (context, url) => Container(
                            height: 220,
                            color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
                          ),
                          errorWidget: (context, url, error) => Container(
                            height: 220,
                            color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
                            child: Icon(Icons.fastfood_rounded, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.1)),
                          ),
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.6),
                                ],
                                stops: const [0.6, 1.0],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.2), width: 0.5),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star_rounded, color: Color(0xFFFFD700), size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.item.rating} (1.2k+)',
                              style: GoogleFonts.poppins(
                                color: Colors.white, 
                                fontSize: 13, 
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                    ),
                    child: Icon(Icons.circle, color: widget.item.isVeg ? const Color(0xFF00C853) : AppColors.primary, size: 10),
                  ),
                ),
              ],
            ),
            
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.item.name,
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                            letterSpacing: -0.5,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (widget.item.description != null && widget.item.description!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            widget.item.description!,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w400,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.timer_outlined, size: 13, color: Colors.amber),
                            const SizedBox(width: 4),
                            Text(
                              '${widget.item.preparationTime ?? 15} MINS',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Colors.amber,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(width: 12),
                            if (widget.item.rating > 4.5) ...[
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: BackdropFilter(
                                  filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.amber.withOpacity(0.2), width: 0.5),
                                    ),
                                    child: Text(
                                      'BESTSELLER',
                                      style: GoogleFonts.poppins(
                                        fontSize: 8,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.amber[800],
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${AppConstants.currency}${widget.item.price % 1 == 0 ? widget.item.price.toInt() : widget.item.price}',
                          style: GoogleFonts.outfit(
                            color: const Color(0xFF00C853), // Deep Green
                            fontWeight: FontWeight.w900,
                            fontSize: 24,
                            letterSpacing: -1,
                          ),
                        ),
                        _buildAddButton(context),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.7, 0.7), end: const Offset(1, 1), curve: Curves.elasticOut, duration: 800.ms);
  }

  Widget _buildAddButton(BuildContext context) {
    return GestureDetector(
      onTap: () {
        _onAddTension();
        Provider.of<CartProvider>(context, listen: false).addItem(widget.item);
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.item.name} added to cart', style: TextStyle(color: Theme.of(context).scaffoldBackgroundColor)),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Theme.of(context).colorScheme.onSurface,
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 120),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 1),
          ),
        );
      },
      child: AnimatedScale(
        scale: _scale,
        duration: 300.ms,
        curve: Curves.elasticOut,
        child: Container(
          height: 36,
          width: 36,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.add_rounded,
            color: Colors.white,
            size: 22,
          ),
        ),
      ),
    );
  }
}
