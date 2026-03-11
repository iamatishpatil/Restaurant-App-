import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';
import '../utils/constants.dart';
import '../services/api_service.dart';
import 'dart:convert';

class LocationSelectorSheet extends StatefulWidget {
  const LocationSelectorSheet({super.key});

  @override
  State<LocationSelectorSheet> createState() => _LocationSelectorSheetState();
}

class _LocationSelectorSheetState extends State<LocationSelectorSheet> {
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _savedAddresses = [];
  bool _isLoadingSaved = true;

  @override
  void initState() {
    super.initState();
    _fetchSavedAddresses();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchSavedAddresses() async {
    try {
      final response = await ApiService.get('/address');
      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _savedAddresses = jsonDecode(response.body);
            _isLoadingSaved = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingSaved = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final location = Provider.of<LocationProvider>(context);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xxl)),
      ),
      padding: EdgeInsets.only(
        top: 16,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: _buildDragHandle()),
          const SizedBox(height: 20),
          Text(
            'Select delivery location',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          
          // Search Bar
          _buildSearchBar(location),
          const SizedBox(height: 16),
          
          // Current Location Button
          _buildActionItem(
            icon: Icons.my_location_rounded,
            iconColor: Colors.blue,
            title: 'Use Current Location',
            subtitle: 'Detect your location using GPS',
            isLoading: location.isLoading,
            onTap: () async {
              await location.determinePosition();
              location.finalizeLocation();
              if (mounted) Navigator.pop(context);
            },
          ),
          
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Divider(),
          ),
          
          // Saved Addresses Section
          Row(
            children: [
              Text(
                'SAVED ADDRESSES', 
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 1.2)
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          if (_isLoadingSaved)
            const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator(color: AppColors.primary)))
          else if (_savedAddresses.isEmpty)
            _buildEmptyState()
          else
            _buildSavedList(location),
          
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildDragHandle() {
    return Container(
      width: 40,
      height: 4,
      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
    );
  }

  Widget _buildSearchBar(LocationProvider location) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: _searchController,
        onSubmitted: (value) {
          if (value.trim().isNotEmpty) {
            location.setManualAddress(value.trim());
            location.finalizeLocation();
            Navigator.pop(context);
          }
        },
        decoration: InputDecoration(
          hintText: 'Search area, street name...',
          hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
          prefixIcon: const Icon(Icons.search, color: AppColors.primary),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon, 
    required Color iconColor, 
    required String title, 
    required String subtitle, 
    required VoidCallback onTap,
    bool isLoading = false,
  }) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: iconColor.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  Text(subtitle, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                ],
              ),
            ),
            if (isLoading)
              const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedList(LocationProvider location) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.3),
      child: ListView.builder(
        shrinkWrap: true,
        itemCount: _savedAddresses.length,
        itemBuilder: (ctx, index) {
          final addr = _savedAddresses[index];
          final isSelected = location.selectedAddressId == addr['id'];
          
          IconData icon = Icons.location_on_rounded;
          if (addr['type'] == 'HOME') icon = Icons.home_rounded;
          if (addr['type'] == 'WORK') icon = Icons.work_rounded;

          return ListTile(
            onTap: () {
              location.setManualAddress('${addr['type']}: ${addr['addressLine1']}', id: addr['id']);
              location.finalizeLocation();
              Navigator.pop(context);
            },
            contentPadding: EdgeInsets.zero,
            leading: Icon(icon, color: isSelected ? AppColors.primary : Colors.grey.shade400, size: 20),
            title: Text(addr['type'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isSelected ? AppColors.primary : AppColors.text)),
            subtitle: Text('${addr['addressLine1']}, ${addr['city']}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
            trailing: isSelected ? const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 18) : null,
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off_rounded, size: 16, color: Colors.grey.shade300),
          const SizedBox(width: 8),
          Text('No saved addresses yet', style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
        ],
      ),
    );
  }
}
