const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    { tableNumber: '1', capacity: 2 },
    { tableNumber: '2', capacity: 2 },
    { tableNumber: '3', capacity: 4 },
    { tableNumber: '4', capacity: 4 },
    { tableNumber: '5', capacity: 6 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { tableNumber: t.tableNumber },
      update: {},
      create: t,
    });
  }
  console.log('Seeded 5 tables.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
