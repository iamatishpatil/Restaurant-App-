import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const phone = '7676594276';
  const password = '123456';
  const name = 'Original Customer';

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { phone }
  });

  if (existingUser) {
    console.log(`User with phone ${phone} already exists.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      name,
      role: 'CUSTOMER'
    }
  });

  console.log(`Successfully created user: ${user.name} (${user.phone})`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
