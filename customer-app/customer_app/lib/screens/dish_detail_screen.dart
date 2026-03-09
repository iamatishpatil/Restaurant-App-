import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/menu_item.dart';
import '../providers/cart_provider.dart';
import '../utils/constants.dart';
import '../services/api_service.dart';
import 'package:cached_network_image/cached_network_image.dart';

class DishDetailScreen extends StatefulWidget {
  final MenuItem item;

  const DishDetailScreen({super.key, required this.item});

  @override
  State<DishDetailScreen> createState() => _DishDetailScreenState();
}

class _DishDetailScreenState extends State<DishDetailScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: 350,
            pinned: true,
            stretch: true,
            backgroundColor: AppColors.white,
            leading: Padding(
              padding: const EdgeInsets.only(left: 16),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: BackButton(color: AppColors.text, onPressed: () => Navigator.pop(context)),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground],
              background: Hero(
                tag: 'dish_${widget.item.id}',
                child: CachedNetworkImage(
                      imageUrl: ApiService.getImageUrl(widget.item.image),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    widget.item.isVeg ? Icons.circle : Icons.stop,
                                    color: widget.item.isVeg ? Colors.green : Colors.red,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    widget.item.isVeg ? 'PURE VEG' : 'NON-VEG',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                          letterSpacing: 1.2,
                                          fontWeight: FontWeight.bold,
                                          color: widget.item.isVeg ? Colors.green : Colors.red,
                                        ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(widget.item.name, style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(AppRadius.s),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star_rounded, color: Colors.green, size: 20),
                              const SizedBox(width: 4),
                              Text(
                                widget.item.rating.toString(),
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.l),
                    const Divider(height: 32),
                    Text('Description', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Text(
                      widget.item.description ?? 'A delicious dish prepared with the finest ingredients and authentic recipes to satisfy your cravings.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.6,
                          ),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Select Quantity', style: Theme.of(context).textTheme.titleLarge),
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(AppRadius.l),
                          ),
                          child: Row(
                            children: [
                              _quantityButton(Icons.remove_rounded, () {
                                if (_quantity > 1) setState(() => _quantity--);
                              }),
                              Container(
                                constraints: const BoxConstraints(minWidth: 40),
                                alignment: Alignment.center,
                                child: Text(
                                  _quantity.toString(),
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                ),
                              ),
                              _quantityButton(Icons.add_rounded, () {
                                setState(() => _quantity++);
                              }),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        height: 100,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: AppSpacing.l),
        decoration: BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total Price', style: Theme.of(context).textTheme.bodyMedium),
                  Text(
                    '${AppConstants.currency}${(widget.item.price * _quantity).toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  final cart = Provider.of<CartProvider>(context, listen: false);
                  for (int i = 0; i < _quantity; i++) {
                    cart.addItem(widget.item);
                  }
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, color: Colors.white),
                          const SizedBox(width: 12),
                          Text('$_quantity ${widget.item.name} added to cart'),
                        ],
                      ),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: AppColors.text,
                    ),
                  );
                },
                child: const Text('Add to Cart'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _quantityButton(IconData icon, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.l),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Icon(icon, size: 20, color: AppColors.primary),
        ),
      ),
    );
  }
}
