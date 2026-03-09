import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('User@123', 10);
  
  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { phone: '7676594276' }
  });

  if (existing) {
    // update password
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: passwordHash, role: Role.CUSTOMER }
    });
    console.log('Updated existing user password and set role to CUSTOMER.');
  } else {
    // Create new customer
    await prisma.user.create({
      data: {
        name: 'Test Customer',
        phone: '7676594276',
        email: 'customer7676594276@restaurant.com', // Dummy fallback email
        password: passwordHash,
        role: Role.CUSTOMER
      }
    });
    console.log('Successfully created customer user with phone 7676594276');
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
