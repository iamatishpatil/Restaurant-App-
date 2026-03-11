import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Using source.unsplash.com/featured which proxies & resizes reliably (no API key needed)
// and picsum.photos as ultimate fallback - both are designed for embedding

const categoryImages: Record<string, string> = {
  'Starters':    'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=600&q=80&fit=crop',
  'Main Course': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&fit=crop',
  'Desserts':    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&fit=crop',
  'Beverages':   'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=600&q=80&fit=crop',
  'Pizzas':      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&fit=crop',
  'Burgers':     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&fit=crop',
  'Salads':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop',
  'Soups':       'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&fit=crop',
  'Breads':      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&fit=crop',
  'Breakfast':   'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80&fit=crop',
};

const bannerImages = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop',  // Coffee
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&fit=crop',  // Pizza
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&fit=crop',     // Croissant brunch
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',  // Burger
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80&fit=crop',  // Pasta
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&fit=crop',  // Fine dining
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',  // Salad
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&fit=crop',     // Dessert
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&fit=crop',     // Steak/dish
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fit=crop',  // Food spread
  'https://images.unsplash.com/photo-1560717845-968823efbee1?w=800&q=80&fit=crop',     // Chef special
  'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=800&q=80&fit=crop',  // Wings
  'https://images.unsplash.com/photo-1490914327627-9fe8d52f4d90?w=800&q=80&fit=crop',  // Organic
  'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=800&q=80&fit=crop',     // Beverages
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&fit=crop',  // Bread
];

async function main() {
  console.log('Updating category images...');
  const categories = await prisma.category.findMany();
  let catUpdated = 0;
  for (const cat of categories) {
    const newImage = categoryImages[cat.name];
    if (newImage) {
      await prisma.category.update({ where: { id: cat.id }, data: { image: newImage } });
      console.log(`  ✓ ${cat.name}`);
      catUpdated++;
    }
  }
  console.log(`\nUpdated ${catUpdated} category images.`);

  console.log('\nUpdating banner images...');
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'asc' } });
  let bannerUpdated = 0;
  for (let i = 0; i < banners.length; i++) {
    const newImage = bannerImages[i % bannerImages.length];
    await prisma.banner.update({ where: { id: banners[i].id }, data: { image: newImage } });
    console.log(`  ✓ ${banners[i].title}`);
    bannerUpdated++;
  }
  console.log(`\nUpdated ${bannerUpdated} banner images.`);
  console.log('\n✅ All images updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
