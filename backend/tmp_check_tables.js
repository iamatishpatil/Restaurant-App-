const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.table.findMany().then(tables => {
  console.log('Tables found:', tables.length);
  tables.forEach(t => console.log(`Table ${t.tableNumber}: ID ${t.id}, Capacity ${t.capacity}, Status ${t.status}`));
}).finally(() => prisma.$disconnect());
