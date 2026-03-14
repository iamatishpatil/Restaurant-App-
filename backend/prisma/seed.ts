import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── INDIAN CUSTOMER DATA ─────────────────────────────────────────────────────
const indianNames = [
  'Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Vihaan Singh', 'Arjun Mehta',
  'Sai Krishnan', 'Reyansh Gupta', 'Ayaan Khan', 'Dhruv Verma', 'Kabir Joshi',
  'Priya Agarwal', 'Ananya Nair', 'Diya Iyer', 'Saanvi Reddy', 'Anika Bose',
  'Riya Chatterjee', 'Pari Desai', 'Navya Rao', 'Kiara Malhotra', 'Myra Pillai',
  'Rohit Pandey', 'Amit Tiwari', 'Suresh Mishra', 'Ramesh Yadav', 'Deepak Srivastava',
  'Sunita Misra', 'Pooja Saxena', 'Geeta Kapoor', 'Meera Bhat', 'Neha Chauhan',
  'Rahul Das', 'Nikhil Bhatt', 'Karan Thakur', 'Ankit Dubey', 'Varun Shukla',
  'Ravi Naidu', 'Manoj Tripathi', 'Sanjay Kulkarni', 'Vijay Patil', 'Arun Menon',
  'Tanvi Seth', 'Shreya Ghosh', 'Anjali Sinha', 'Kavya Rajput', 'Divya Chandra',
  'Ishaan Mathur', 'Kartik Bansal', 'Pranav Ahuja', 'Yash Mittal', 'Harsh Rajan',
  'Ritika Bhagat', 'Simran Oberoi', 'Pallavi Hegde', 'Swati Naik', 'Ashish Jain',
];

const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const indianStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Western Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Kerala'];
const streetNames = [
  '14 MG Road', '7 Brigade Road', '23 FC Road', '5 Linking Road', '11 Anna Salai',
  '3 Park Street', '19 Jubilee Hills', '8 Banjara Hills', '21 Indiranagar', '6 Koregaon Park',
  'Flat 4B, Orchid Towers', 'Shop 12, Phoenix Mall Road', '9 Sector 17', '33 Civil Lines', '1 Salt Lake',
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const categories = [
  { name: 'Starters',    image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=600&q=80&fit=crop' },
  { name: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&fit=crop' },
  { name: 'Biryani',     image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&q=80&fit=crop' },
  { name: 'Desserts',    image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=600&q=80&fit=crop' },
  { name: 'Beverages',   image: 'https://images.unsplash.com/photo-1544252890-c3e35b4891f5?w=600&q=80&fit=crop' },
  { name: 'Pizzas',      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&fit=crop' },
  { name: 'Burgers',     image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&fit=crop' },
  { name: 'Breads',      image: 'https://images.unsplash.com/photo-1574101948203-0d3f5e46e5df?w=600&q=80&fit=crop' },
  { name: 'Rolls & Wraps', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80&fit=crop' },
  { name: 'Soups & Salads', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&fit=crop' },
];

// ─── MENU ITEMS (with real Indian & fusion dishes + food images) ───────────────
const menuItemsData = [
  // Starters
  { name: 'Paneer Tikka',         cat: 'Starters',    price: 280, isVeg: true,  rating: 4.7, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop', description: 'Soft paneer cubes marinated in spiced yogurt, grilled to perfection in a tandoor.' },
  { name: 'Chicken 65',           cat: 'Starters',    price: 320, isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80&fit=crop', description: 'Crispy fried chicken tossed in a fiery red chilli sauce with curry leaves.' },
  { name: 'Hara Bhara Kebab',     cat: 'Starters',    price: 220, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&fit=crop', description: 'Green patties made from spinach, peas, and paneer, shallow fried until golden.' },
  { name: 'Seekh Kebab',          cat: 'Starters',    price: 360, isVeg: false, rating: 4.6, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80&fit=crop', description: 'Minced lamb mixed with aromatic spices and herbs, skewered and grilled.' },
  { name: 'Soup of the Day',      cat: 'Starters',    price: 150, isVeg: true,  rating: 4.3, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80&fit=crop', description: "Chef's special soup made fresh daily with seasonal vegetables and herbs." },
  // Main Course
  { name: 'Butter Chicken',       cat: 'Main Course', price: 380, isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&q=80&fit=crop', description: 'Tender chicken cooked in a rich, creamy tomato-based sauce. A classic favourite.' },
  { name: 'Palak Paneer',         cat: 'Main Course', price: 300, isVeg: true,  rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80&fit=crop', description: 'Fresh cottage cheese cubes in a smooth, spiced spinach gravy.' },
  { name: 'Dal Makhani',          cat: 'Main Course', price: 260, isVeg: true,  rating: 4.6, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80&fit=crop', description: 'Black lentils slow-cooked overnight with butter, cream, and spices.' },
  { name: 'Mutton Rogan Josh',    cat: 'Main Course', price: 480, isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80&fit=crop', description: 'Aromatic Kashmiri-style lamb curry cooked with whole spices and Kashmiri chillies.' },
  { name: 'Kadhai Paneer',        cat: 'Main Course', price: 320, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80&fit=crop', description: 'Paneer cooked with bell peppers and onions in a kadhai with bold Indian spices.' },
  { name: 'Chicken Tikka Masala', cat: 'Main Course', price: 400, isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80&fit=crop', description: 'Marinated chicken chunks in a luscious masala sauce with a tomato-cream base.' },
  { name: 'Shahi Paneer',         cat: 'Main Course', price: 340, isVeg: true,  rating: 4.4, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80&fit=crop', description: 'Paneer in a rich, cashew-based royal Mughlai gravy garnished with saffron.' },
  // Biryani
  { name: 'Hyderabadi Chicken Dum Biryani', cat: 'Biryani', price: 420, isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80&fit=crop', description: 'Authentic dum-cooked basmati rice layered with spiced chicken, saffron, and caramelised onions.' },
  { name: 'Veg Dum Biryani',      cat: 'Biryani',     price: 320, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96debb?w=500&q=80&fit=crop', description: 'Fragrant basmati rice cooked with seasonal vegetables, herbs, and whole spices.' },
  { name: 'Mutton Biryani',       cat: 'Biryani',     price: 520, isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80&fit=crop', description: 'Slow-cooked aged mutton pieces with long-grain basmati and hand-ground spices.' },
  { name: 'Egg Biryani',          cat: 'Biryani',     price: 280, isVeg: false, rating: 4.4, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80&fit=crop', description: 'Boiled eggs in spiced basmati rice, flavoured with biryani masala and rose water.' },
  // Desserts
  { name: 'Gulab Jamun',          cat: 'Desserts',    price: 120, isVeg: true,  rating: 4.8, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&fit=crop', description: 'Soft, spongy milk-solid balls soaked in a rose-flavoured sugar syrup.' },
  { name: 'Rasmalai',             cat: 'Desserts',    price: 140, isVeg: true,  rating: 4.9, image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=500&q=80&fit=crop', description: 'Chenna dumplings soaked in sweetened, thickened milk flavoured with cardamom and saffron.' },
  { name: 'Kulfi Falooda',        cat: 'Desserts',    price: 160, isVeg: true,  rating: 4.7, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80&fit=crop', description: 'Dense Indian ice cream served with vermicelli, rose syrup, and basil seeds.' },
  { name: 'Chocolate Lava Cake',  cat: 'Desserts',    price: 200, isVeg: true,  rating: 4.6, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80&fit=crop', description: 'Warm chocolate cake with a molten dark chocolate centre, served with vanilla ice cream.' },
  { name: 'Phirni',               cat: 'Desserts',    price: 130, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80&fit=crop', description: 'A creamy, thick rice pudding flavoured with saffron, cardamom, and topped with pistachios.' },
  // Beverages
  { name: 'Mango Lassi',          cat: 'Beverages',   price: 120, isVeg: true,  rating: 4.8, image: 'https://images.unsplash.com/photo-1517448931760-9bf4a42b9c49?w=500&q=80&fit=crop', description: 'Thick and creamy yoghurt drink blended with Alphonso mangoes and a hint of cardamom.' },
  { name: 'Masala Chai',          cat: 'Beverages',   price: 80,  isVeg: true,  rating: 4.9, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80&fit=crop', description: 'Traditional Indian spiced tea brewed with ginger, cardamom, cinnamon, and cloves.' },
  { name: 'Fresh Lime Soda',      cat: 'Beverages',   price: 90,  isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80&fit=crop', description: 'Freshly squeezed lime juice with sparkling water, black salt, and mint.' },
  { name: 'Badam Milk',           cat: 'Beverages',   price: 110, isVeg: true,  rating: 4.6, image: 'https://images.unsplash.com/photo-1520568887893-2c73bffa23ed?w=500&q=80&fit=crop', description: 'Warm or chilled milk blended with almond paste, saffron, and cardamom.' },
  { name: 'Rose Sherbet',         cat: 'Beverages',   price: 100, isVeg: true,  rating: 4.4, image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80&fit=crop', description: 'Chilled rose-flavoured drink with basil seeds and a squeeze of lemon.' },
  // Pizzas
  { name: 'Margherita Pizza',     cat: 'Pizzas',      price: 299, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80&fit=crop', description: 'Classic pizza with fresh tomato sauce, mozzarella, and fragrant basil leaves.' },
  { name: 'Chicken BBQ Pizza',    cat: 'Pizzas',      price: 399, isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80&fit=crop', description: 'Smoky BBQ chicken topped with onions, peppers, and mozzarella on a crisp base.' },
  { name: 'Paneer Tikka Pizza',   cat: 'Pizzas',      price: 349, isVeg: true,  rating: 4.8, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80&fit=crop', description: 'Indian fusion pizza with tandoor-grilled paneer, capsicum, and tikka sauce.' },
  // Burgers
  { name: 'Aloo Tikki Burger',    cat: 'Burgers',     price: 179, isVeg: true,  rating: 4.6, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fit=crop', description: 'Crispy spiced potato patty with mint chutney and pickled onions in a toasted bun.' },
  { name: 'Chicken Zinger Burger',cat: 'Burgers',     price: 249, isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&q=80&fit=crop', description: 'Crispy fried chicken fillet with coleslaw, jalapeños, and spicy mayo.' },
  { name: 'Double Patty Smash',   cat: 'Burgers',     price: 349, isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80&fit=crop', description: 'Two smash-style beef patties with melted cheese, caramelised onions, and pickles.' },
  // Breads
  { name: 'Butter Naan',          cat: 'Breads',      price: 60,  isVeg: true,  rating: 4.6, image: 'https://images.unsplash.com/photo-1574101948203-0d3f5e46e5df?w=500&q=80&fit=crop', description: 'Soft, fluffy leavened bread from the tandoor, brushed generously with butter.' },
  { name: 'Garlic Naan',          cat: 'Breads',      price: 70,  isVeg: true,  rating: 4.8, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80&fit=crop', description: 'Tandoor naan topped with minced garlic and fresh coriander, finished with butter.' },
  { name: 'Lachha Paratha',       cat: 'Breads',      price: 80,  isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80&fit=crop', description: 'Whole-wheat layered flatbread with beautiful flaky layers, pan-roasted with ghee.' },
  { name: 'Stuffed Kulcha',       cat: 'Breads',      price: 100, isVeg: true,  rating: 4.4, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80&fit=crop', description: 'Tandoor bread stuffed with spiced potatoes and onions, served with chole.' },
  // Rolls & Wraps
  { name: 'Chicken Kathi Roll',   cat: 'Rolls & Wraps', price: 199, isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=80&fit=crop', description: 'Paratha rolled with egg and stuffed with spiced chicken, onions, and green chutney.' },
  { name: 'Paneer Frankie',       cat: 'Rolls & Wraps', price: 169, isVeg: true,  rating: 4.5, image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500&q=80&fit=crop', description: 'Soft roti rolled with spiced paneer filling, peppers, and tangy masala sauce.' },
  // Soups & Salads
  { name: 'Cream of Tomato Soup', cat: 'Soups & Salads', price: 140, isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80&fit=crop', description: 'Velvety smooth tomato soup with fresh cream, basil oil, and garlic croutons.' },
  { name: 'Garden Fresh Salad',   cat: 'Soups & Salads', price: 180, isVeg: true, rating: 4.3, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80&fit=crop', description: 'Seasonal vegetables, olives, feta, and a light lemon-herb vinaigrette dressing.' },
  { name: 'Sweet Corn Soup',      cat: 'Soups & Salads', price: 130, isVeg: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500&q=80&fit=crop', description: 'Thick Chinese-style sweet corn soup with vegetables and a hint of soy.' },
];

// ─── BANNERS ──────────────────────────────────────────────────────────────────
const bannersData = [
  { title: '🔥 Try Our Hyderabadi Dum Biryani!',     image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80&fit=crop', link: '/menu?category=Biryani' },
  { title: '🍕 Buy 1 Get 1 Free on All Pizzas',       image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop', link: '/menu?category=Pizzas' },
  { title: '🥗 New Salad Menu — Fresh & Healthy!',    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop', link: '/menu?category=Soups+%26+Salads' },
  { title: '🧁 Sweet Endings — Desserts 20% OFF',     image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=800&q=80&fit=crop', link: '/menu?category=Desserts' },
  { title: '🍔 Smash Burgers Are Here!',              image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&fit=crop', link: '/menu?category=Burgers' },
  { title: '🍗 Weekend Special: Butter Chicken Night', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80&fit=crop', link: '/menu?category=Main+Course' },
  { title: '☕ Mornings Are Better With Masala Chai', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&fit=crop', link: '/menu?category=Beverages' },
  { title: '🥘 Starters Night — Free Starters on Orders ₹799+', image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=800&q=80&fit=crop', link: '/menu?category=Starters' },
  { title: '🫓 Fresh Naan From the Tandoor',          image: 'https://images.unsplash.com/photo-1574101948203-0d3f5e46e5df?w=800&q=80&fit=crop', link: '/menu?category=Breads' },
  { title: '🌯 Kathi Rolls — A Street Food Classic',  image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80&fit=crop', link: '/menu?category=Rolls+%26+Wraps' },
];

// ─── INVENTORY ────────────────────────────────────────────────────────────────
const inventoryData = [
  { itemName: 'Basmati Rice',         quantity: 150, unit: 'kg' },
  { itemName: 'Whole Wheat Flour (Atta)', quantity: 80, unit: 'kg' },
  { itemName: 'Maida (All Purpose Flour)', quantity: 60, unit: 'kg' },
  { itemName: 'Chicken (Fresh)',       quantity: 50, unit: 'kg' },
  { itemName: 'Mutton (Bone-in)',      quantity: 30, unit: 'kg' },
  { itemName: 'Paneer',               quantity: 25, unit: 'kg' },
  { itemName: 'Tomatoes',             quantity: 40, unit: 'kg' },
  { itemName: 'Onions',               quantity: 60, unit: 'kg' },
  { itemName: 'Garlic',               quantity: 10, unit: 'kg' },
  { itemName: 'Ginger',               quantity: 8,  unit: 'kg' },
  { itemName: 'Green Chillies',       quantity: 5,  unit: 'kg' },
  { itemName: 'Butter',               quantity: 20, unit: 'kg' },
  { itemName: 'Fresh Cream',          quantity: 15, unit: 'l' },
  { itemName: 'Curd (Yoghurt)',        quantity: 20, unit: 'kg' },
  { itemName: 'Cooking Oil (Sunflower)', quantity: 50, unit: 'l' },
  { itemName: 'Ghee',                 quantity: 10, unit: 'kg' },
  { itemName: 'Mozzarella Cheese',    quantity: 8,  unit: 'kg' },
  { itemName: 'Milk',                 quantity: 40, unit: 'l' },
  { itemName: 'Eggs',                 quantity: 200, unit: 'pcs' },
  { itemName: 'Turmeric Powder',      quantity: 2,  unit: 'kg' },
  { itemName: 'Red Chilli Powder',    quantity: 3,  unit: 'kg' },
  { itemName: 'Garam Masala',         quantity: 2,  unit: 'kg' },
  { itemName: 'Coriander Powder',     quantity: 2,  unit: 'kg' },
  { itemName: 'Cumin Seeds',          quantity: 1.5, unit: 'kg' },
  { itemName: 'Saffron',              quantity: 0.1, unit: 'kg' },
  { itemName: 'Cardamom (Elaichi)',    quantity: 0.5, unit: 'kg' },
  { itemName: 'Bay Leaves',           quantity: 0.2, unit: 'kg' },
  { itemName: 'Tomato Puree',         quantity: 20, unit: 'l' },
  { itemName: 'Sugar',                quantity: 15, unit: 'kg' },
  { itemName: 'Salt',                 quantity: 10, unit: 'kg' },
  { itemName: 'Cashew Nuts',          quantity: 5,  unit: 'kg' },
  { itemName: 'Almonds',              quantity: 3,  unit: 'kg' },
  { itemName: 'Capsicum (Bell Pepper)', quantity: 15, unit: 'kg' },
  { itemName: 'Spinach (Palak)',       quantity: 10, unit: 'kg' },
  { itemName: 'Lemon',                quantity: 5,  unit: 'kg' },
  { itemName: 'Coriander Leaves',     quantity: 3,  unit: 'kg' },
  { itemName: 'Mint Leaves',          quantity: 2,  unit: 'kg' },
  { itemName: 'Pizza Dough Balls',    quantity: 50, unit: 'pcs' },
  { itemName: 'Burger Buns',          quantity: 80, unit: 'pcs' },
  { itemName: 'Sweet Corn',           quantity: 8,  unit: 'kg' },
  { itemName: 'Potatoes',             quantity: 30, unit: 'kg' },
  { itemName: 'Black Lentils (Urad Dal)', quantity: 12, unit: 'kg' },
  { itemName: 'Charcoal (Tandoor)',   quantity: 50, unit: 'kg' },
  { itemName: 'Wood (Tandoor)',       quantity: 100, unit: 'kg' },
  { itemName: 'Disposable Containers', quantity: 500, unit: 'pcs' },
  { itemName: 'Paper Bags',           quantity: 300, unit: 'pcs' },
];

// ─── COUPONS ──────────────────────────────────────────────────────────────────
const couponsData = [
  { code: 'WELCOME20',  discount: 20, type: 'PERCENTAGE', expiryDays: 30, isActive: true },
  { code: 'FIRSTORDER', discount: 50, type: 'FLAT',       expiryDays: 15, isActive: true },
  { code: 'BIRYANI10',  discount: 10, type: 'PERCENTAGE', expiryDays: 20, isActive: true },
  { code: 'SAVE100',    discount: 100, type: 'FLAT',      expiryDays: 7,  isActive: true },
  { code: 'WEEKEND30',  discount: 30, type: 'PERCENTAGE', expiryDays: 60, isActive: true },
  { code: 'PARTYPACK',  discount: 15, type: 'PERCENTAGE', expiryDays: 45, isActive: true },
  { code: 'LUNCHTIME',  discount: 25, type: 'FLAT',       expiryDays: 30, isActive: true },
  { code: 'FESTIVE50',  discount: 50, type: 'PERCENTAGE', expiryDays: 90, isActive: false },
  { code: 'HAPPYHOUR',  discount: 20, type: 'FLAT',       expiryDays: 10, isActive: true },
  { code: 'VEGDEAL15',  discount: 15, type: 'PERCENTAGE', expiryDays: 25, isActive: true },
];

// ─── STAFF ────────────────────────────────────────────────────────────────────
const staffData = [
  { name: 'Chef Ramesh Kumar',   email: 'ramesh.chef@restaurant.com',   role: Role.CHEF },
  { name: 'Chef Priya Nair',     email: 'priya.chef@restaurant.com',    role: Role.CHEF },
  { name: 'Chef Arun Pillai',    email: 'arun.chef@restaurant.com',     role: Role.CHEF },
  { name: 'Chef Meena Sundaram', email: 'meena.chef@restaurant.com',    role: Role.CHEF },
  { name: 'Manager Rohit Shah',  email: 'rohit.manager@restaurant.com', role: Role.MANAGER },
  { name: 'Manager Anjali Singh', email: 'anjali.manager@restaurant.com', role: Role.MANAGER },
  { name: 'Delivery Raj Arora',  email: 'raj.del@restaurant.com',       role: Role.DELIVERY },
  { name: 'Delivery Deepak Rana', email: 'deepak.del@restaurant.com',   role: Role.DELIVERY },
  { name: 'Delivery Suresh Babu', email: 'suresh.del@restaurant.com',   role: Role.DELIVERY },
  { name: 'Delivery Kiran Lal',  email: 'kiran.del@restaurant.com',     role: Role.DELIVERY },
];

// ─── REVIEWS (Comments) ────────────────────────────────────────────────────────
const positiveReviews = [
  'Absolutely delicious! The biryani was packed with flavours.',
  'Best butter chicken I have ever had. 10/10!',
  'Very authentic taste, reminded me of home.',
  'Portion size was generous and food arrived hot.',
  'The paneer tikka was perfectly charred. Amazing!',
  'Great food, great packaging. Will order again.',
  'Delivery was super fast and everything was fresh.',
  'The gulab jamun was melt-in-your-mouth perfection.',
  'Loved the naan — so soft and fluffy!',
  'Masala chai was the perfect end to a great meal.',
];
const mixedReviews = [
  'Good food but delivery took a bit longer than expected.',
  'Taste was great but portion could be slightly bigger.',
  'Nice flavours. Packaging could be improved.',
  'Enjoyed the meal overall. Rice was slightly overcooked.',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const futureDays = (days: number) => new Date(Date.now() + days * 86400000);
const pastDays = (days: number) => new Date(Date.now() - days * 86400000);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🍽️  Starting Restaurant Seed...\n');

  // CLEAN
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('123456', 10);

  // 1. USERS
  console.log('👥 Creating users...');
  const users = [];
  users.push(await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@restaurant.com', phone: '9000000000', password: hash, role: Role.ADMIN }
  }));
  for (const uname of indianNames) {
    const [fname, lname] = uname.split(' ');
    users.push(await prisma.user.create({
      data: {
        name: uname,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${randInt(1, 99)}@gmail.com`,
        phone: `${pick(['6','7','8','9'])}${Array.from({length:9}, () => randInt(0,9)).join('')}`,
        password: hash,
        role: Role.CUSTOMER,
      }
    }));
  }
  console.log(`   ✓ ${users.length} users`);

  // 2. STAFF
  console.log('👔 Creating staff...');
  for (const s of staffData) {
    await prisma.staff.create({ data: { ...s, password: hash } });
  }
  console.log(`   ✓ ${staffData.length} staff members`);

  // 3. CATEGORIES
  console.log('🏷️  Creating categories...');
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.menuCategory.create({ data: cat });
    catMap[cat.name] = created.id;
  }
  console.log(`   ✓ ${categories.length} categories`);

  // 4. MENU ITEMS
  console.log('🍛 Creating menu items...');
  const menuItems = [];
  for (const dish of menuItemsData) {
    const item = await prisma.menuItem.create({
      data: {
        name: dish.name,
        description: dish.description,
        price: dish.price,
        image: dish.image,
        isVeg: dish.isVeg,
        availability: true,
        categoryId: catMap[dish.cat],
      }
    });
    menuItems.push(item);
  }
  console.log(`   ✓ ${menuItems.length} menu items`);

  // 5. BANNERS
  console.log('🖼️  Creating banners...');
  for (let i = 0; i < bannersData.length; i++) {
    await prisma.banner.create({
      data: { ...bannersData[i], isActive: true }
    });
  }
  console.log(`   ✓ ${bannersData.length} banners`);

  // 6. INVENTORY
  console.log('📦 Creating inventory...');
  for (const inv of inventoryData) {
    await prisma.inventory.create({ data: inv });
  }
  console.log(`   ✓ ${inventoryData.length} inventory items`);

  // 7. COUPONS
  console.log('🏷️  Creating coupons...');
  for (const c of couponsData) {
    await prisma.coupon.create({
      data: {
        code: c.code,
        discount: c.discount,
        expiryDate: futureDays(c.expiryDays),
        isActive: c.isActive,
      }
    });
  }
  console.log(`   ✓ ${couponsData.length} coupons`);

  // 8. ADDRESSES
  console.log('📍 Creating addresses...');
  const customerUsers = users.filter(u => u.role === Role.CUSTOMER);
  const addressMap: Record<string, string[]> = {};
  for (const user of customerUsers) {
    const count = randInt(1, 3);
    const addrs = [];
    for (let i = 0; i < count; i++) {
      const cityIdx = randInt(0, indianCities.length - 1);
      const addr = await prisma.address.create({
        data: {
          userId: user.id,
          type: i === 0 ? 'Home' : pick(['Office', 'Other']),
          addressLine1: pick(streetNames),
          city: indianCities[cityIdx],
          state: indianStates[cityIdx],
          zipCode: `${randInt(100000, 999999)}`,
          isDefault: i === 0,
        }
      });
      addrs.push(addr.id);
    }
    addressMap[user.id] = addrs;
  }
  console.log(`   ✓ Addresses for ${customerUsers.length} users`);

  // 9. ORDERS + PAYMENTS
  console.log('🛒 Creating orders...');
  const statuses = [
    OrderStatus.NEW_ORDER, OrderStatus.PREPARING, OrderStatus.READY,
    OrderStatus.COMPLETED, OrderStatus.CANCELLED
  ];
  let orderCount = 0;
  for (let i = 0; i < 60; i++) {
    const user = pick(customerUsers);
    const userAddrs = addressMap[user.id] || [];
    const deliveryType = Math.random() > 0.35 ? 'DELIVERY' : 'PICKUP';
    const itemCount = randInt(1, 5);
    const pickedItems = pickN(menuItems, itemCount);

    const orderItemsData2 = pickedItems.map(m => ({
      menuItemId: m.id,
      quantity: randInt(1, 3),
      price: Number(m.price),
    }));

    const subtotal = orderItemsData2.reduce((s, it) => s + it.price * it.quantity, 0);
    const taxAmount = subtotal * 0.05;
    const grandTotal = subtotal + taxAmount;
    const status = pick(statuses);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status,
        subtotal,
        taxAmount,
        grandTotal,
        deliveryType,
        addressId: deliveryType === 'DELIVERY' && userAddrs.length ? pick(userAddrs) : undefined,
        createdAt: pastDays(randInt(0, 30)),
        orderItems: { create: orderItemsData2 }
      }
    });

    if (status !== OrderStatus.NEW_ORDER && status !== OrderStatus.CANCELLED) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: pick(['UPI', 'CARD', 'COD', 'NETBANKING']),
          status: 'COMPLETED',
          amount: grandTotal,
          transactionId: `TXN${Date.now()}${randInt(1000, 9999)}`,
        }
      });
    }
    orderCount++;
  }
  console.log(`   ✓ ${orderCount} orders`);

  // 10. REVIEWS
  console.log('⭐ Creating reviews...');
  let reviewCount = 0;
  for (let i = 0; i < 55; i++) {
    const user = pick(customerUsers);
    const item = pick(menuItems);
    const rating = randInt(3, 5);
    const comment = rating >= 4 ? pick(positiveReviews) : pick(mixedReviews);
    await prisma.review.create({
      data: {
        userId: user.id,
        menuItemId: item.id,
        rating,
        comment,
        createdAt: pastDays(randInt(0, 45)),
      }
    });
    reviewCount++;
  }
  console.log(`   ✓ ${reviewCount} reviews`);

  // 11. FAVORITES
  console.log('❤️  Creating favorites...');
  let favCount = 0;
  for (const user of pickN(customerUsers, 30)) {
    const favItems = pickN(menuItems, randInt(1, 5));
    for (const item of favItems) {
      try {
        await prisma.favorite.create({ data: { userId: user.id, menuItemId: item.id } });
        favCount++;
      } catch {}
    }
  }
  console.log(`   ✓ ${favCount} favorites`);

  console.log(`
╔══════════════════════════════════════════╗
║   ✅ RESTAURANT SEED COMPLETE!           ║
╠══════════════════════════════════════════╣
║  👥 Users:       ${String(users.length).padEnd(24)}║
║  👔 Staff:       ${String(staffData.length).padEnd(24)}║
║  🏷️  Categories:  ${String(categories.length).padEnd(24)}║
║  🍛 Menu Items:  ${String(menuItems.length).padEnd(24)}║
║  🖼️  Banners:     ${String(bannersData.length).padEnd(24)}║
║  📦 Inventory:   ${String(inventoryData.length).padEnd(24)}║
║  🏷️  Coupons:     ${String(couponsData.length).padEnd(24)}║
║  🛒 Orders:      ${String(orderCount).padEnd(24)}║
║  ⭐ Reviews:     ${String(reviewCount).padEnd(24)}║
║  ❤️  Favorites:   ${String(favCount).padEnd(24)}║
╠══════════════════════════════════════════╣
║  🔐 Admin Login:                         ║
║     Email: admin@restaurant.com          ║
║     Pass:  123456                        ║
╚══════════════════════════════════════════╝
`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
