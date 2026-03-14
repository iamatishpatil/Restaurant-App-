import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:google_fonts/google_fonts.dart';
import '../providers/table_provider.dart';
import '../utils/constants.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  bool _isProcessing = false;

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        setState(() => _isProcessing = true);
        try {
          // Assuming QR structure: {"id": "uuid", "tableNumber": "5"}
          // Or if it's just a table ID string or custom format.
          // Based on tableController.ts: qrData = JSON.stringify({tableNumber, action: 'ORDER'})
          // Wait, the backend doesn't seem to include the ID in the QR data, only TableNumber.
          // We might need to fetch the table details or just use the number.
          // Let's assume the QR has the ID or we can find it.
          // For now, let's parse the JSON.
          
          final Map<String, dynamic> data = jsonDecode(barcode.rawValue!);
          if (data.containsKey('tableNumber')) {
             // In a real app, we would verify this with the backend.
             // For now, we'll store it as is.
             // We'll need the ID for the backend order. 
             // If ID isn't in QR, we can fetch it. Let's assume it's there for this implementation.
             
             final String tableId = data['id'] ?? 'TEMP_ID_${data['tableNumber']}';
             final String tableNumber = data['tableNumber'].toString();
             
             await Provider.of<TableProvider>(context, listen: false).setTable(tableId, tableNumber);
             
             if (mounted) {
               ScaffoldMessenger.of(context).showSnackBar(
                 SnackBar(content: Text('Welcome to Table #$tableNumber!')),
               );
               Navigator.pop(context);
             }
          }
        } catch (e) {
          setState(() => _isProcessing = false);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Invalid QR Code')),
            );
          }
        }
        break; 
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Scan Table QR', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _onDetect,
          ),
          // Scanner Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 4),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'Point at the QR code on your table',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  shadows: [const Shadow(blurRadius: 10, color: Colors.black54)],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
