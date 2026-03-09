import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({
    where: { phone: '7676594276' }
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: 'Test Customer',
        email: 'customer7676594276@restaurant.com'
      }
    });
    console.log('Fixed the name and email of the user to look like a customer.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
