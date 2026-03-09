import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class AddressScreen extends StatefulWidget {
  const AddressScreen({super.key});

  @override
  State<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends State<AddressScreen> {
  List<dynamic> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    try {
      final response = await ApiService.get('/address');
      if (response.statusCode == 200) {
        setState(() {
          _addresses = jsonDecode(response.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching addresses: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _addAddress() async {
    final nameController = TextEditingController();
    final line1Controller = TextEditingController();
    final cityController = TextEditingController();
    bool isSaving = false;

    showDialog(
      context: context,
      barrierDismissible: !isSaving,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Add New Address', style: TextStyle(fontWeight: FontWeight.bold)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController, 
                decoration: const InputDecoration(labelText: 'Type (e.g. Home, Office)', prefixIcon: Icon(Icons.label_outline, size: 20)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: line1Controller, 
                decoration: const InputDecoration(labelText: 'Address Line 1', prefixIcon: Icon(Icons.map_outlined, size: 20)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: cityController, 
                decoration: const InputDecoration(labelText: 'City', prefixIcon: Icon(Icons.location_city_outlined, size: 20)),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isSaving ? null : () => Navigator.pop(ctx), 
              child: const Text('Cancel', style: TextStyle(color: Colors.grey))
            ),
            ElevatedButton(
              onPressed: isSaving ? null : () async {
                if (nameController.text.isEmpty || line1Controller.text.isEmpty || cityController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
                  return;
                }
                setModalState(() => isSaving = true);
                final body = {
                  'type': nameController.text,
                  'addressLine1': line1Controller.text,
                  'city': cityController.text,
                  'state': 'NA',
                  'zipCode': '000000',
                };
                try {
                  final resp = await ApiService.post('/address', body);
                  if (resp.statusCode == 201) {
                    Navigator.pop(ctx);
                    _fetchAddresses();
                  }
                } catch (e) {
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to add address')));
                } finally {
                  setModalState(() => isSaving = false);
                }
              }, 
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF4D4D), foregroundColor: Colors.white),
              child: isSaving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Add Address')
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Addresses')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF4D4D)))
        : _addresses.isEmpty 
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   Icon(Icons.location_off_outlined, size: 80, color: Colors.grey.shade200),
                   const SizedBox(height: 16),
                   const Text('No addresses found', style: TextStyle(color: Colors.grey, fontSize: 16)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _addresses.length,
              itemBuilder: (ctx, i) {
                final addr = _addresses[i];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade100)),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: const Color(0xFFFF4D4D).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.location_on, color: Color(0xFFFF4D4D)),
                    ),
                    title: Text(addr['type'], style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${addr['addressLine1']}, ${addr['city']}', style: const TextStyle(color: Colors.grey)),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.grey),
                      onPressed: () async {
                        final confirm = await showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Delete Address'),
                            content: const Text('Are you sure you want to remove this address?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          await ApiService.delete('/address/${addr['id']}');
                          _fetchAddresses();
                        }
                      },
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addAddress,
        backgroundColor: const Color(0xFFFF4D4D),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
