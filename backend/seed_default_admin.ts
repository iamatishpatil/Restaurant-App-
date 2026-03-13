import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {
      password: hash,
      role: Role.ADMIN,
      name: 'Admin User',
      phone: '9000000000'
    },
    create: {
      name: 'Admin User',
      email: 'admin@restaurant.com',
      phone: '9000000000',
      password: hash,
      role: Role.ADMIN
    }
  });

  console.log('Successfully created/updated admin user:', admin.email);

  const chef = await prisma.user.upsert({
    where: { email: 'chef@restaurant.com' },
    update: {
      password: hash,
      role: Role.CHEF,
      name: 'Chef User',
      phone: '9000000001'
    },
    create: {
      name: 'Chef User',
      email: 'chef@restaurant.com',
      phone: '9000000001',
      password: hash,
      role: Role.CHEF
    }
  });
  console.log('Successfully created/updated chef user:', chef.email);

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@restaurant.com' },
    update: {
      password: hash,
      role: Role.WAITER,
      name: 'Waiter User',
      phone: '9000000002'
    },
    create: {
      name: 'Waiter User',
      email: 'waiter@restaurant.com',
      phone: '9000000002',
      password: hash,
      role: Role.WAITER
    }
  });
  console.log('Successfully created/updated waiter user:', waiter.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
