import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFFFF4F5A); // Vibrant food delivery red
  static const Color primaryDark = Color(0xE63E4A);
  static const Color accent = Color(0xFFFF8A65); // Soft orange highlight
  
  // Neutral Colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF8F8F8);
  static const Color surfaceLight = Color(0xFFF3F4F6);
  static const Color divider = Color(0xFFEAEAEA);
  static const Color white = Colors.white;

  // Text Colors
  static const Color text = Color(0xFF1C1C1C);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textPlaceholder = Color(0xFF9CA3AF);
  static const Color textDisabled = Color(0xFFC4C4C4);
  
  // Surface Colors for Premium Layering
  static const Color surface1 = Color(0xFFF9FAFB);
  static const Color surface2 = Color(0xFFF3F4F6);
  static const Color surface3 = Color(0xFFE5E7EB);
  
  // Gradients for high-end feel
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFF4F5A), Color(0xFFFF7E87)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient surfaceGradient = LinearGradient(
    colors: [Colors.white, Color(0xFFF9FAFB)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Status Colors
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color ratingGreen = Color(0xFF22C55E);
  
  static const Color shimmerBase = Color(0xFFE5E7EB);
  static const Color shimmerHighlight = Color(0xFFF3F4F6);
}

class DarkColors {
  // Brand Colors (Vibrant variants for dark)
  static const Color primary = Color(0xFFFF5F6A); 
  static const Color accent = Color(0xFFFF9E80);

  // Neutral Colors
  static const Color background = Color(0xFF0F0F0F); // Near black
  static const Color surface = Color(0xFF1A1A1A);
  static const Color surface1 = Color(0xFF222222);
  static const Color surface2 = Color(0xFF2C2C2C);
  static const Color surface3 = Color(0xFF383838);
  static const Color divider = Color(0xFF262626);
  static const Color white = Colors.white;

  // Text Colors
  static const Color text = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFA0A0A0);
  static const Color textPlaceholder = Color(0xFF666666);
  static const Color textDisabled = Color(0xFF444444);

  // Status Colors
  static const Color error = Color(0xFFFB7185);
  static const Color success = Color(0xFF34D399);
  static const Color warning = Color(0xFFFBBF24);
  
  static const Color shimmerBase = Color(0xFF262626);
  static const Color shimmerHighlight = Color(0xFF333333);
}

class AppSpacing {
  static const double micro = 4.0;
  static const double small = 8.0;
  static const double normal = 16.0;
  static const double section = 24.0;
  static const double large = 32.0;
  static const double hero = 40.0;
  
  // Aliases for compatibility
  static const double m = 16.0;
  static const double l = 24.0;
  static const double xl = 32.0;
  static const double xxl = 40.0;
}

class AppRadius {
  static const double small = 8.0;
  static const double button = 12.0;
  static const double card = 20.0; // Increased for premium feel
  static const double container = 24.0;
  static const double modal = 32.0;
  
  // Aliases for compatibility
  static const double m = 12.0;
  static const double l = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
}

class AppShadows {
  static List<BoxShadow> premiumShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.04),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> glassShadow = [
    BoxShadow(
      color: Colors.white.withOpacity(0.4),
      blurRadius: 10,
      spreadRadius: -2,
      offset: const Offset(0, 2),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 15,
      offset: const Offset(0, 5),
    ),
  ];
}

class AppAnimations {
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 400);
  static const Duration slow = Duration(milliseconds: 600);
}

class AppConstants {
  static const String currency = '₹';
}
