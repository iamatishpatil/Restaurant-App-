import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
    // Generate a soft background color based on ID for a playful look
    final List<Color> softColors = [
      const Color(0xFFFF5252).withOpacity(0.12), // Vibrant Red
      const Color(0xFFFF9100).withOpacity(0.12), // Vibrant Orange
      const Color(0xFF00C853).withOpacity(0.12), // Vibrant Green
      const Color(0xFF2979FF).withOpacity(0.12), // Vibrant Blue
      const Color(0xFFD500F9).withOpacity(0.12), // Vibrant Purple
    ];
    final Color bgColor = softColors[id.hashCode % softColors.length];
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80, // Slightly wider
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            AnimatedContainer(
              duration: AppAnimations.normal,
              curve: Curves.easeOutQuart,
              height: 68,
              width: 68,
              padding: const EdgeInsets.all(AppSpacing.small),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : bgColor,
                borderRadius: BorderRadius.circular(22), // Premium squircle look
                boxShadow: isSelected ? AppShadows.premiumShadow : [],
              ),
              child: Center(
                child: imageUrl != null && imageUrl!.isNotEmpty
                    ? Image.network(
                        imageUrl!,
                        height: 38,
                        width: 38,
                        fit: BoxFit.contain,
                        errorBuilder: (c, e, s) => Icon(
                          icon,
                          color: isSelected ? AppColors.white : AppColors.primary,
                          size: 30,
                        ),
                      )
                    : Icon(
                        icon,
                        color: isSelected ? AppColors.white : AppColors.primary,
                        size: 30,
                      ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                fontSize: 12.5,
                letterSpacing: -0.1,
              ),
            )
          ],
        ),
      ),
    );
  }
}
