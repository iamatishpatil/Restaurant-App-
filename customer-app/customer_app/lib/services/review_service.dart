import 'dart:convert';
import '../services/api_service.dart';

class ReviewService {
  static Future<List<dynamic>> fetchReviews(String menuItemId) async {
    try {
      final response = await ApiService.get('/reviews/$menuItemId');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error fetching reviews: $e');
    }
    return [];
  }

  static Future<bool> addReview({
    required String menuItemId,
    required int rating,
    required String comment,
  }) async {
    try {
      final response = await ApiService.post('/reviews', {
        'menuItemId': menuItemId,
        'rating': rating,
        'comment': comment,
      });
      return response.statusCode == 201;
    } catch (e) {
      print('Error adding review: $e');
      return false;
    }
  }
}
