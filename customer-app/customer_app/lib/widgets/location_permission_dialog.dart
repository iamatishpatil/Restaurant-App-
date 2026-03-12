import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import '../utils/constants.dart';
import 'location_selector_sheet.dart';
import 'package:flutter_animate/flutter_animate.dart';

class LocationPermissionDialog extends StatelessWidget {
  const LocationPermissionDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardTheme.color,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 32),
            // Target Icon
            Container(
              padding: const EdgeInsets.only(top: 24, bottom: 16),
              child: Stack(
                alignment: Alignment.center,
                children: [
                   Icon(Icons.center_focus_strong_rounded, size: 72, color: const Color(0xFF1E293B)), // Dark outline
                   const Icon(Icons.my_location_rounded, size: 28, color: Color(0xFFE43A45)), // Red center
                ],
              ),
            ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
            
            const SizedBox(height: 16),
            
            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                'Location permission not enabled',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Subtitle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'Enable your location permission for a better delivery experience',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  height: 1.4,
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(0.5)),
            
            // Enable Device Location Button
            _buildActionButton(
              context,
              icon: Icons.my_location_rounded,
              label: 'Enable device location',
              color: const Color(0xFFE43A45), // Specific red from design
              onTap: () async {
                Navigator.pop(context); 
                await Geolocator.openAppSettings();
                await Geolocator.openLocationSettings();
              },
            ),
            
            Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(0.5)),
            
            // Enter Location Manually Button
            _buildActionButton(
              context,
              icon: Icons.search_rounded,
              label: 'Enter location manually',
              color: Theme.of(context).colorScheme.onSurface,
              onTap: () {
                Navigator.pop(context); 
                showModalBottomSheet(
                  context: context,
                  backgroundColor: Colors.transparent,
                  isScrollControlled: true,
                  builder: (context) => const LocationSelectorSheet(),
                );
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, {
    required IconData icon, 
    required String label, 
    required Color color, 
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        width: double.infinity,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w500, // Medium weight matching design
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
