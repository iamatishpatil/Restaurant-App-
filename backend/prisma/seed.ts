import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── PREMIUM INDIAN CUSTOMER DATA ──────────────────────────────────────────────
const indianNames = [
  'Arnav Malhotra', 'Ishaan Singhania', 'Kabir Mehra', 'Advait Khurana', 'Rohan Oberoi',
  'Aavya Reddy', 'Saanvi Iyer', 'Myra Kapoor', 'Kiara Mittal', 'Ananya Goel',
  'Vikram Rathore', 'Sameer Deshmukh', 'Aditya Vardhan', 'Rahul Bhatia', 'Siddharth Jain',
  'Priya Sharma', 'Neha Gupta', 'Riddhi Shah', 'Tanvi Joshi', 'Sanya Verma',
  'Armaan Malik', 'Zoya Khan', 'Rehan Ahmed', 'Sara Ali', 'Ayaan Qureshi'
];

const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Gurgaon', 'Chandigarh'];
const indianStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra', 'Haryana', 'Punjab'];
const highEndAreas = [
  'Altamount Road', 'Jubilee Hills', 'Golf Links', 'Koramangala 4th Block', 'Boat Club Road',
  'Koregaon Park', 'DLF Phase 5', 'Sector 17', 'Banjara Hills', 'Indiranagar'
];

// ─── PREMIUM CATEGORIES ────────────────────────────────────────────────────────
const categories = [
  { 
    name: 'Artisan Starters', 
    description: 'A curated selection of small plates to ignite your palate.',
    image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=800&q=80' 
  },
  { 
    name: 'Signature Mains', 
    description: 'Heritage recipes reimagined with modern culinary techniques.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80' 
  },
  { 
    name: 'Royal Biryani', 
    description: 'Fragrant long-grain basmati rice slow-cooked in sealed clay pots.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80' 
  },
  { 
    name: 'Gourmet Pizzas', 
    description: 'Hand-stretched sourdough crusts with premium artisanal toppings.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' 
  },
  { 
    name: 'Chef Specialty Burgers', 
    description: 'Prime cuts of meat and house-made sauces in brioche buns.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' 
  },
  { 
    name: 'Decadent Desserts', 
    description: 'Exquisite sweet creations for the perfect finale.',
    image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=800&q=80' 
  },
  { 
    name: 'Revitalizing Beverages', 
    description: 'From botanical mocktails to traditional spiced elixirs.',
    image: 'https://images.unsplash.com/photo-1544252890-c3e35b4891f5?w=800&q=80' 
  },
];

// ─── GOURMET MENU ITEMS ────────────────────────────────────────────────────────
const menuItemsData = [
  // Artisan Starters
  { 
    name: 'Truffle Scented Paneer Tikka', 
    cat: 'Artisan Starters', 
    price: 450, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80', 
    description: 'Premium Malai Paneer cold-smoked and infused with white truffle oil, served with mint foam.' 
  },
  { 
    name: 'Saffron Galouti Kebab', 
    cat: 'Artisan Starters', 
    price: 520, 
    isVeg: false, 
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80', 
    description: 'Finely minced lamb smoked with cloves and infused with saffron, melt-in-mouth texture.' 
  },
  { 
    name: 'Peri-Peri Prawn Skewers', 
    cat: 'Artisan Starters', 
    price: 650, 
    isVeg: false, 
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80', 
    description: 'Jumbo prawns marinated in a house-made African bird’s eye chili sauce, grilled over charcoal.' 
  },
  
  // Signature Mains
  { 
    name: 'The Grand Nihari', 
    cat: 'Signature Mains', 
    price: 780, 
    isVeg: false, 
    image: 'https://images.apache.org/photo-1577219491135-ce391730fb2c?w=600&q=80', 
    description: 'Slow-cooked shank of lamb in an aromatic stew, simmered for 12 hours with secret royal spices.' 
  },
  { 
    name: 'Dal Maharaja (Smoked)', 
    cat: 'Signature Mains', 
    price: 390, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', 
    description: 'Black whole lentils slow-cooked with white butter and vine-ripened tomatoes in a clay oven.' 
  },
  { 
    name: 'Wild Mushroom Stroganoff', 
    cat: 'Signature Mains', 
    price: 550, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', 
    description: 'A medley of porcini, shiitake, and button mushrooms in a cognac-infused sour cream sauce.' 
  },

  // Royal Biryani
  { 
    name: 'Nizami Dum Biryani', 
    cat: 'Royal Biryani', 
    price: 620, 
    isVeg: false, 
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&q=80', 
    description: 'The King of Biryanis. Long grain basmati and tender chicken steam-cooked with 32 secret herbs.' 
  },
  { 
    name: 'Subz-e-Zaffran Biryani', 
    cat: 'Royal Biryani', 
    price: 480, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96debb?w=600&q=80', 
    description: 'Seasonal vegetables and premium nuts layered with saffron-infused rice and rose water.' 
  },

  // Gourmet Pizzas
  { 
    name: 'Truffle & Burrata Pizza', 
    cat: 'Gourmet Pizzas', 
    price: 850, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', 
    description: 'Puglian burrata cheese, black truffle shavings, and fresh basil on a 48-hour fermented crust.' 
  },
  { 
    name: 'Bresaola & Arugula', 
    cat: 'Gourmet Pizzas', 
    price: 920, 
    isVeg: false, 
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80', 
    description: 'Air-dried salted beef, wild arugula, Parmesan reggiano flakes, and extra virgin olive oil.' 
  },

  // Desserts
  { 
    name: 'Deconstructed Rasmalai', 
    cat: 'Decadent Desserts', 
    price: 320, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=600&q=80', 
    description: 'Saffron milk spheres served with pistachio soil, edible flowers, and white chocolate foam.' 
  },
  { 
    name: 'Molten Belgian Ganache', 
    cat: 'Decadent Desserts', 
    price: 380, 
    isVeg: true, 
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80', 
    description: 'Warm dark chocolate cake with a 70% cocoa core, served with Madagascar vanilla bean gelato.' 
  },
];

// ─── PREMIUM BANNERS ───────────────────────────────────────────────────────────
const bannersData = [
  { title: 'The Royal Feast: Authentic Nizami Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=1200&q=80', link: '/category/Royal+Biryani' },
  { title: 'New Arrival: Artisan Truffle Burrata Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', link: '/category/Gourmet+Pizzas' },
  { title: 'Weekend Special: Saffron Dessert Platter', image: 'https://images.unsplash.com/photo-1557925923-33b27df83bda?w=1200&q=80', link: '/category/Decadent+Desserts' },
];

// ─── PREMIUM REVIEWS ───────────────────────────────────────────────────────────
const reviews = [
  "The truffle paneer is a revelation. I've never tasted anything so refined in a casual dining setting.",
  "Truly the best Nihari in the city. The flavor depth is incredible, reminds me of old Delhi but cleaner.",
  "The Burrata pizza was worth every rupee. High-quality ingredients and perfect crust.",
  "Beautiful presentation! The Deconstructed Rasmalai is a must-try for dessert lovers.",
  "Excellent service and the Biryani was exceptionally fragrant. Will definitely bring my parents here.",
  "Sophisticated flavors. The Peri-Peri prawns had the perfect kick. Highly recommend for foodies.",
  "A culinary masterpiece. Each dish tells a story of heritage and passion.",
  "The ambiance and the food quality made our anniversary dinner very special. Thank you!",
  "Stunning food! The mushroom stroganoff was so creamy and flavorful.",
  "Never thought a veg biryani could be this good. Saffron makes all the difference."
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌟 Initializing Premium Restaurant Experience Build...\n');

  // CLEAN
  console.log('🧹 Purging legacy data...');
  const tablenames = ['OrderItem', 'Payment', 'Review', 'Favorite', 'Address', 'Order', 'Coupon', 'Banner', 'Inventory', 'Staff', 'MenuItem', 'MenuCategory', 'User', 'Settings', 'Reservation', 'Notification', 'OTP', 'Table'];
  for (const table of tablenames) {
    try {
      await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany();
    } catch (e) {}
  }

  const hash = await bcrypt.hash('123456', 10);

  // 1. SETTINGS
  console.log('⚙️  Configuring Global Brand Identity...');
  await prisma.settings.create({
    data: {
      id: 'global',
      restaurantName: 'The Grand Maharaja Cuisine',
      contactPhone: '+91 98765 43210',
      businessEmail: 'concierge@grandmaharaja.com',
      storeAddress: 'Empire Heights, 1st Floor, High Street Road, Mumbai 400001',
      latitude: 19.0760,
      longitude: 72.8777,
      currency: 'INR',
      taxRate: 5.0,
      isOpen: true,
      acceptingOrders: true
    }
  });

  // 2. USERS
  console.log('👥 Onboarding Premium Customers & Admins...');
  const admin = await prisma.user.create({
    data: { name: 'Executive Admin', email: 'admin@grandmaharaja.com', phone: '9876543210', password: hash, role: Role.ADMIN }
  });

  console.log('🧑‍🍳 Recruiting Kitchen & Floor Staff...');
  await prisma.staff.create({
    data: { name: 'Master Chef Arjun', email: 'chef@grandmaharaja.com', password: hash, role: Role.CHEF }
  });

  await prisma.staff.create({
    data: { name: 'Senior Waiter Rohan', email: 'waiter@grandmaharaja.com', password: hash, role: Role.WAITER }
  });

  const createdUsers = [];
  for (const name of indianNames) {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `9${randInt(100000000, 999999999)}`,
        password: hash,
        role: Role.CUSTOMER
      }
    });
    createdUsers.push(user);
    
    // Add realistic address
    await prisma.address.create({
      data: {
        userId: user.id,
        type: pick(['Home', 'Office']),
        addressLine1: `${pick(highEndAreas)}, Tower ${randInt(1, 15)}`,
        addressLine2: `Flat ${randInt(101, 1505)}`,
        city: pick(indianCities),
        state: pick(indianStates),
        zipCode: `${randInt(110001, 800001)}`,
        isDefault: true
      }
    });
  }

  // 3. CATEGORIES & MENU
  console.log('🍽️  Curating the Master Menu...');
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.menuCategory.create({ data: cat });
    catMap[cat.name] = c.id;
  }

  const items = [];
  for (const m of menuItemsData) {
    const item = await prisma.menuItem.create({
      data: {
        name: m.name,
        description: m.description,
        price: m.price,
        image: m.image,
        isVeg: m.isVeg,
        categoryId: catMap[m.cat]
      }
    });
    items.push(item);
  }

  // 4. BANNERS & COUPONS
  console.log('🏷️  Enabling Marketing Campaigns...');
  for (const b of bannersData) {
    await prisma.banner.create({ data: b });
  }

  const coupons = [
    { code: 'MAHARAJA20', discount: 20, minAmount: 1000 },
    { code: 'WELCOME500', discount: 500, minAmount: 2000 },
    { code: 'GOURMET10', discount: 10, minAmount: 0 }
  ];

  for (const c of coupons) {
    await prisma.coupon.create({
      data: {
        code: c.code,
        discount: c.discount,
        minOrderAmount: c.minAmount,
        expiryDate: new Date(Date.now() + 30 * 86400000),
        isActive: true
      }
    });
  }

  // 5. REVIEWS
  console.log('⭐ Generating Authentic Guest Feedback...');
  for (let i = 0; i < 40; i++) {
    const user = pick(createdUsers);
    const item = pick(items);
    await prisma.review.create({
      data: {
        userId: user.id,
        menuItemId: item.id,
        rating: pick([4, 5, 5, 5]), // Mostly high ratings for premium feel
        comment: pick(reviews),
        createdAt: new Date(Date.now() - randInt(1, 60) * 86400000)
      }
    });
  }

  // 6. TABLES
  console.log('🪑 Arranging the Dining Floor...');
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: {
        tableNumber: i.toString(),
        capacity: pick([2, 4, 4, 6, 8]),
        status: 'AVAILABLE'
      }
    });
  }

  console.log(`
  🚀  BUILD COMPLETE! Your Restaurant is Demo Ready.
  --------------------------------------------------
  🏪 Brand: The Grand Maharaja Cuisine
  👥 Users: ${createdUsers.length} Premium Profiles
  🍛 Menu:  ${items.length} Gourmet Dishes
  🏷️ Coupons: MAHARAJA20, WELCOME500
  ⭐ Reviews: 40+ Certified Guest Testimonials
  --------------------------------------------------
  🔑 Admin Login: admin@grandmaharaja.com / 123456
  `);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
