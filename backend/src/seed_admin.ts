import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Admin Modules...');

  // 1. Settings
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      restaurantName: 'The Royal Bistro',
      contactPhone: '+1 800 123 4567',
      businessEmail: 'contact@royalbistro.com',
      storeAddress: '456 Gourmet Lane, Food District',
      acceptingOrders: true,
      pushNotifications: true
    }
  });

  // 2. Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Spring Special: 20% OFF Everything',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
        link: '/menu',
        isActive: true
      },
      {
        title: 'New Gourmet Dessert Arrival',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=1000',
        link: '/menu/desserts',
        isActive: true
      }
    ]
  });

  // 3. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME50',
        discount: 50,
        type: 'PERCENTAGE',
        minOrderAmount: 100,
        expiryDate: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'FOODE10',
        discount: 10,
        type: 'PERCENTAGE',
        minOrderAmount: 50,
        expiryDate: new Date('2026-06-30'),
        isActive: true
      }
    ]
  });

  // 4. Inventory
  await prisma.inventory.createMany({
    data: [
      { itemName: 'Tomato', quantity: 15, unit: 'kg' },
      { itemName: 'Onion', quantity: 5, unit: 'kg' }, // Low stock
      { itemName: 'Cooking Oil', quantity: 20, unit: 'L' },
      { itemName: 'Chicken Breast', quantity: 8, unit: 'kg' } // Low stock
    ]
  });

  // 5. Reviews (Need a menu item first)
  const menuItem = await prisma.menuItem.findFirst();
  const user = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

  if (menuItem && user) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Absolutely delicious! Will order again.',
        userId: user.id,
        menuItemId: menuItem.id
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
