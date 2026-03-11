import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true }, take: 4 });
  const categories = await prisma.category.findMany({ select: { id: true, name: true, image: true } });
  console.log('=== BANNER IMAGES ===');
  banners.forEach(b => console.log(`  [${b.title}] => ${b.image}`));
  console.log('\n=== CATEGORY IMAGES ===');
  categories.forEach(c => console.log(`  [${c.name}] => ${c.image}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
