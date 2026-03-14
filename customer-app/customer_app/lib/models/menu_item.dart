class MenuItem {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final bool isVeg;
  final bool isVegan;
  final bool isGlutenFree;
  final bool isSpicy;
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
    this.isVegan = false,
    this.isGlutenFree = false,
    this.isSpicy = false,
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
      isVegan: json['isVegan'] ?? false,
      isGlutenFree: json['isGlutenFree'] ?? false,
      isSpicy: json['isSpicy'] ?? false,
      rating: double.parse((json['rating'] ?? 0.0).toString()),
      categoryId: json['categoryId'],
      isAvailable: json['isAvailable'] ?? true,
    );
  }
}
