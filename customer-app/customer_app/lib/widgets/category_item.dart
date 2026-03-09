import 'package:flutter/material.dart';
import '../utils/constants.dart';

class CravyoCategoryItem extends StatelessWidget {
  final String id;
  final String name;
  final IconData icon;
  final String? imageUrl;
  final bool isSelected;
  final VoidCallback onTap;

  const CravyoCategoryItem({
    super.key,
    required this.id,
    required this.name,
    required this.icon,
    required this.isSelected,
    required this.onTap,
    this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.s, vertical: AppSpacing.s),
        child: Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.all(AppSpacing.m),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.white,
                shape: BoxShape.circle,
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        )
                      ]
                    : [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        )
                      ],
              ),
              child: imageUrl != null && imageUrl!.isNotEmpty
                  ? Image.network(
                      imageUrl!,
                      height: 32,
                      width: 32,
                      errorBuilder: (c, e, s) => Icon(
                        icon,
                        color: isSelected ? AppColors.white : AppColors.textSecondary,
                        size: 24,
                      ),
                    )
                  : Icon(
                      icon,
                      color: isSelected ? AppColors.white : AppColors.textSecondary,
                      size: 24,
                    ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? AppColors.primary : AppColors.text,
                    fontSize: 12,
                  ),
            )
          ],
        ),
      ),
    );
  }
}
