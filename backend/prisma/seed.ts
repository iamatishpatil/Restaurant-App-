import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Clean up existing data to prevent unique constraint errors during massive seeding
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
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Generate Users (50+)
  console.log('Generating Users...');
  const users = [];
  // Add a specific admin account for testing just in case
  users.push(await prisma.user.create({
      data: { name: 'Admin User', email: 'admin@restaurant.com', phone: '0000000000', password: passwordHash, role: Role.ADMIN }
  }));
  for (let i = 0; i < 55; i++) {
    users.push(
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number({ style: 'national' }),
          password: passwordHash,
          role: Role.CUSTOMER,
        },
      })
    );
  }

  // 2. Generate Staff (10)
  console.log('Generating Staff...');
  for (let i = 0; i < 15; i++) {
    await prisma.staff.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: faker.helpers.arrayElement([Role.MANAGER, Role.CHEF, Role.DELIVERY]),
      },
    });
  }

  // 3. Generate Categories (10)
  console.log('Generating Categories...');
  const categoriesList = [
    { name: 'Starters', image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Main Course', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Beverages', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Soups', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Breads', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Breakfast', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop' }
  ];

  const categories = [];
  for (const cat of categoriesList) {
    categories.push(
      await prisma.category.create({
        data: {
          name: cat.name,
          image: cat.image,
        },
      })
    );
  }

  // 4. Generate Menu Items (60)
  console.log('Generating Menu Items...');
  const menuItems = [];
  for (let i = 0; i < 60; i++) {
    const isVeg = faker.datatype.boolean();
    menuItems.push(
      await prisma.menuItem.create({
        data: {
          name: faker.food.dish(),
          description: faker.food.description(),
          price: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
          image: faker.image.urlLoremFlickr({ category: 'food' }),
          isVeg,
          rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
          categoryId: faker.helpers.arrayElement(categories).id,
          isAvailable: faker.datatype.boolean({ probability: 0.9 }),
        },
      })
    );
  }

  // 5. Generate Addresses (60)
  console.log('Generating Addresses...');
  for (let i = 0; i < 60; i++) {
    await prisma.address.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        type: faker.helpers.arrayElement(['Home', 'Office', 'Other']),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        isDefault: faker.datatype.boolean({ probability: 0.5 }),
      },
    });
  }

  // 6. Generate Inventory (50+)
  console.log('Generating Inventory...');
  for (let i = 0; i < 55; i++) {
    await prisma.inventory.create({
      data: {
        itemName: faker.food.ingredient() + ' ' + faker.string.alphanumeric(4),
        quantity: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
        unit: faker.helpers.arrayElement(['kg', 'l', 'pcs', 'boxes']),
      },
    });
  }

  // 7. Generate Coupons (50)
  console.log('Generating Coupons...');
  for (let i = 0; i < 50; i++) {
    const isPercentage = faker.datatype.boolean();
    await prisma.coupon.create({
      data: {
        code: faker.string.alphanumeric({ length: { min: 6, max: 10 }, casing: 'upper' }),
        discount: isPercentage ? faker.number.int({ min: 10, max: 50 }) : faker.number.int({ min: 5, max: 20 }),
        type: isPercentage ? 'PERCENTAGE' : 'FLAT',
        expiryDate: faker.date.future({ years: 1 }),
        isActive: faker.datatype.boolean({ probability: 0.8 }),
      },
    });
  }

  // 8. Generate Banners (15)
  console.log('Generating Banners...');
  const bannerTitles = [
    'Freshly Brewed Coffee - Morning Special',
    'Authentic Wood-Fired Pizzas',
    'Weekend Brunch: Bottomless Mimosas',
    'Buy 1 Get 1 Free on All Burgers',
    'Delicious Homemade Pasta',
    'Experience Fine Dining Like Never Before',
    'Fresh Healthy Salads - Order Now',
    'Delicious Desserts to Sweeten Your Day',
    'The Best Steaks in Town',
    'Order Your Favorite Meal Online!',
    'Chef\'s Special: Lobster Thermidor',
    'Hot & Spicy Chicken Wings Weekend',
    'Organic Ingredients, Gourmet Taste',
    'New Beverage Menu: Try Our Mocktails',
    'Freshly Baked Breads Daily'
  ];

  const bannerImages = [
    'https://images.unsplash.com/photo-1544333346-64e4fe1fdeb2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508485272164-c23170d8f397?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop'
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.banner.create({
      data: {
        title: bannerTitles[i],
        image: bannerImages[i],
        link: `/menu/category/${faker.helpers.arrayElement(categories).id}`,
        isActive: faker.datatype.boolean({ probability: 0.9 }),
      },
    });
  }

  // 9. Generate Orders, OrderItems
  console.log('Generating Orders and Payments (60+)...');
  const statuses = [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
  
  for (let i = 0; i < 65; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const orderItemsCount = faker.number.int({ min: 1, max: 5 });
    let totalPrice = 0;
    
    const itemsToCreate = [];
    for (let j = 0; j < orderItemsCount; j++) {
      const menuItem = faker.helpers.arrayElement(menuItems);
      const quantity = faker.number.int({ min: 1, max: 4 });
      const price = Number(menuItem.price);
      totalPrice += price * quantity;
      
      itemsToCreate.push({
        menuItemId: menuItem.id,
        quantity,
        price,
      });
    }

    const orderStatus = faker.helpers.arrayElement(statuses);

    const order = await prisma.order.create({
      data: {
        userId: randomUser.id,
        status: orderStatus,
        totalPrice,
        totalItems: orderItemsCount,
        deliveryType: faker.helpers.arrayElement(['DELIVERY', 'PICKUP']),
        createdAt: faker.date.recent({ days: 30 }),
        orderItems: {
          create: itemsToCreate
        }
      },
    });

    // Create corresponding payment if not cancelled/pending
    if (orderStatus !== 'PENDING' && orderStatus !== 'CANCELLED') {
       const payment = await prisma.payment.create({
         data: {
           method: faker.helpers.arrayElement(['UPI', 'CARD', 'COD']),
           status: 'COMPLETED',
           amount: totalPrice,
           transactionId: faker.string.uuid(),
         }
       });
       await prisma.order.update({ where: { id: order.id }, data: { paymentId: payment.id }});
    }
  }

  // 10. Generate Reviews (60)
  console.log('Generating Reviews...');
  for (let i = 0; i < 65; i++) {
    await prisma.review.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        menuItemId: faker.helpers.arrayElement(menuItems).id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.datatype.boolean() ? faker.lorem.sentences(2) : null,
        createdAt: faker.date.recent({ days: 60 })
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
