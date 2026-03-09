import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  console.log('--- Starting Database Integrity Audit ---');
  
  try {
    // 1. Check MenuItems with non-existent Categories
    const menuItems = await prisma.menuItem.findMany();
    const categories = await prisma.category.findMany();
    const catIds = new Set(categories.map(c => c.id));
    
    for (const item of menuItems) {
      if (!catIds.has(item.categoryId)) {
        console.warn(`[WARNING] MenuItem "${item.name}" (ID: ${item.id}) points to non-existent Category ID: ${item.categoryId}`);
      }
    }

    // 2. Check OrderItems with non-existent MenuItems
    const orderItems = await prisma.orderItem.findMany();
    const menuItemIds = new Set(menuItems.map(m => m.id));
    
    for (const item of orderItems) {
      if (!menuItemIds.has(item.menuItemId)) {
        console.warn(`[WARNING] OrderItem (ID: ${item.id}) points to non-existent MenuItem ID: ${item.menuItemId}`);
      }
    }

    // 3. Check Orders with non-existent Users
    const orders = await prisma.order.findMany();
    const users = await prisma.user.findMany();
    const userIds = new Set(users.map(u => u.id));
    
    for (const order of orders) {
      if (order.userId && !userIds.has(order.userId)) {
        console.warn(`[WARNING] Order (ID: ${order.id}) points to non-existent User ID: ${order.userId}`);
      }
    }

    // 4. Check Addresses
    const addresses = await prisma.address.findMany();
    for (const addr of addresses) {
      if (!userIds.has(addr.userId)) {
        console.warn(`[WARNING] Address (ID: ${addr.id}) points to non-existent User ID: ${addr.userId}`);
      }
    }

    console.log('--- Audit Complete ---');
  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
