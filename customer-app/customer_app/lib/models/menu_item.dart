class MenuItem {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final bool isVeg;
  final double rating;
  final String categoryId;
  final bool isAvailable;

  MenuItem({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.image,
    required this.isVeg,
    required this.rating,
    required this.categoryId,
    required this.isAvailable,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      image: json['image'],
      isVeg: json['isVeg'] ?? true,
      rating: double.parse((json['rating'] ?? 0.0).toString()),
      categoryId: json['categoryId'],
      isAvailable: json['isAvailable'] ?? true,
    );
  }
}
