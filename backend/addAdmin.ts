import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('passAdmin@123', 10);
  
  // Check if admin already exists
  const existing = await prisma.user.findFirst({
    where: { phone: '7676594276' }
  });

  if (existing) {
    if (existing.role !== Role.ADMIN) {
      // update role and password
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN, password: passwordHash }
      });
      console.log('Updated existing user to ADMIN with new password.');
    } else {
      console.log('Admin already exists.');
    }
  } else {
    // Create new admin
    await prisma.user.create({
      data: {
        name: 'Primary Admin',
        phone: '7676594276',
        email: 'admin7676594276@restaurant.com', // Dummy fallback email
        password: passwordHash,
        role: Role.ADMIN
      }
    });
    console.log('Successfully created admin user with phone 7676594276');
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
