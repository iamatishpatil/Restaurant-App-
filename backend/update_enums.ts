import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating Database Enums ---');

  try {
    // 1. Add WAITER to Role enum if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'Role' AND e.enumlabel = 'WAITER') THEN
          ALTER TYPE "Role" ADD VALUE 'WAITER';
        END IF;
      END
      $$;
    `);
    console.log('Verified WAITER in Role enum.');

    // 2. Add new OrderStatus values if they don't exist
    const newStatuses = ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];
    for (const status of newStatuses) {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'OrderStatus' AND e.enumlabel = '${status}') THEN
            ALTER TYPE "OrderStatus" ADD VALUE '${status}';
          END IF;
        END
        $$;
      `).catch(err => {
        // Enums can't be added in a DO block in some PG versions easily if we need to use them immediately,
        // but ALTER TYPE ADD VALUE cannot be executed inside a transaction block in older PG.
        // Prisma runs this in a transaction. 
        console.log(`Note: Could not add ${status} via DO block, trying direct EXECUTE.`);
      });
      
      try {
          await prisma.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS '${status}'`);
      } catch (e) {
          // 'IF NOT EXISTS' for ADD VALUE is only PG 12+
          try {
              await prisma.$executeRawUnsafe(`ALTER TYPE "OrderStatus" ADD VALUE '${status}'`);
          } catch (inner) {
              // Probably already exists
          }
      }
    }
    console.log('Verified OrderStatus values.');

  } catch (err) {
    console.error('Error updating enums:', err);
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
