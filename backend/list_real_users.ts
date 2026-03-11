import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- DATABASE USERS ---');
  users.forEach(u => {
    console.log(`Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone} | Role: ${u.role} | Created: ${u.createdAt}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
