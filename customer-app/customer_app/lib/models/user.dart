class User {
  final String id;
  final String? email;
  final String? phone;
  final String name;
  final String role;

  User({
    required this.id,
    this.email,
    this.phone,
    required this.name,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      phone: json['phone'],
      name: json['name'] ?? 'User',
      role: json['role'] ?? 'CUSTOMER',
    );
  }
}
