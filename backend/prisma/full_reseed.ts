import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── CURATED CATEGORIES (16) ───────────────────────────────────────────────────
const categories = [
  { id: 'cat-1', name: 'Artisan Starters', description: 'Hand-crafted small plates using premium local and imported ingredients.', image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?w=800&q=80' },
  { id: 'cat-2', name: 'Soups & Veloutés', description: 'Silky smooth soups prepared with slow-simmered broths.', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },
  { id: 'cat-3', name: 'Global Salads', description: 'Fresh, vibrant greens with gourmet dressings and superfoods.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
  { id: 'cat-4', name: 'Signature Veg Mains', description: 'Vegetarian excellence inspired by global culinary heritage.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  { id: 'cat-5', name: 'Signature Non-Veg Mains', description: 'Prime cuts of meat cooked to perfection with house-made spice blends.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80' },
  { id: 'cat-6', name: 'Catch of the Day', description: 'Sustainable seafood sourced daily and prepared with coastal flair.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80' },
  { id: 'cat-7', name: 'Oriental Wok Specials', description: 'Flash-cooked Asian flavors with a modern fusion twist.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80' },
  { id: 'cat-8', name: 'From the Tandoor', description: 'Traditional clay oven specialties smoked over charcoal.', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80' },
  { id: 'cat-9', name: 'Royal Biryanis', description: 'The pinnacle of rice-based delicacies, slow-cooked in sealed pots.', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80' },
  { id: 'cat-10', name: 'Artisanal Breads', description: 'Freshly baked leavened and unleavened breads.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80' },
  { id: 'cat-11', name: 'Wood-Fired Pizzas', description: 'Authentic sourdough pizzas with premium buffalo mozzarella.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' },
  { id: 'cat-12', name: 'Gourmet Burgers', description: 'Juicy patties on house-made brioche buns with artisanal cheeses.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { id: 'cat-13', name: 'Classic Pasta & Risotto', description: 'Italian comfort food reimagined with premium produce.', image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80' },
  { id: 'cat-14', name: 'Decadent Desserts', description: 'Exquisite sweet creations for a memorable finale.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80' },
  { id: 'cat-15', name: 'Signature Mocktails', description: 'Refreshing botanical infusions and fresh fruit blends.', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80' },
  { id: 'cat-16', name: 'Craft Coffees & Teas', description: 'Single-origin beans and premium tea leaves from around the world.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
];

const menuItems = [
  // 1. Artisan Starters
  { categoryId: 'cat-1', name: 'Truffle Edamame Mousse', price: 350, isVeg: true, image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?w=400&q=80', description: 'Silky edamame mousse topped with shaved black truffle on a lotus root crisp.' },
  { categoryId: 'cat-1', name: 'Balsamic Glazed Burrata', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1560611580-b2580dafa4ba?w=400&q=80', description: 'Fresh Puglian burrata with heirloom tomato jam and aged balsamic reduction.' },
  { categoryId: 'cat-1', name: 'Charcoal Smoked Lamb Galouti', price: 550, isVeg: false, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', description: 'Melt-in-mouth lamb mince enhanced with royal spices and smoked with cloves.' },
  { categoryId: 'cat-1', name: 'Wasabi Prawn Tempura', price: 620, isVeg: false, image: 'https://images.unsplash.com/photo-1581447100512-675677943d68?w=400&q=80', description: 'Lightly battered prawns served with a fiery wasabi-infused citrus aioli.' },
  { categoryId: 'cat-1', name: 'Baked Beetroot Carpaccio', price: 320, isVeg: true, image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&q=80', description: 'Thin slices of oven-roasted beets with goat cheese crumble and toasted walnuts.' },
  { categoryId: 'cat-1', name: 'Cumin Scented Corn Ribs', price: 280, isVeg: true, image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80', description: 'Sweet corn ribs dusted with smoked paprika and cumin, finished with lime crema.' },
  { categoryId: 'cat-1', name: 'Avocado Tartar w/ Crispy Tofu', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1525203135335-74d292fb8d5c?w=400&q=80', description: 'Creamy Hass avocado tossed with capers and shallots, served with golden panko tofu.' },

  // 2. Soups & Veloutés
  { categoryId: 'cat-2', name: 'Forest Mushroom Cappuccino', price: 290, isVeg: true, image: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=400&q=80', description: 'A light, frothy porcini broth infused with thyme and white onion essence.' },
  { categoryId: 'cat-2', name: 'Spiced Tomato & Basil Bisque', price: 250, isVeg: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', description: 'Slow-roasted vine tomatoes blended with fresh basil and a hint of smoked chili.' },
  { categoryId: 'cat-2', name: 'Lemongrass Chicken Noodle Soup', price: 320, isVeg: false, image: 'https://images.unsplash.com/photo-1548039911-c5ad0a14986c?w=400&q=80', description: 'A fragrant Thai-inspired clear broth with tender chicken, bok choy, and thin vermicelli.' },
  { categoryId: 'cat-2', name: 'Creamy Smoked Bell Pepper', price: 270, isVeg: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', description: 'Velvety roasted red pepper soup with a hint of chipotle and garlic croutons.' },
  { categoryId: 'cat-2', name: 'Lobster & Cognac Velouté', price: 580, isVeg: false, image: 'https://images.unsplash.com/photo-1559847844-53156821aba1?w=400&q=80', description: 'A decadent seafood reduction flambéed with cognac and served with buttered lobster bits.' },
  { categoryId: 'cat-2', name: 'Yellow Lentil & Cumin Shorba', price: 210, isVeg: true, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80', description: 'Traditional clarified lentil soup tempered with toasted cumin and fresh coriander.' },
  { categoryId: 'cat-2', name: 'Roasted Almond & Broccoli', price: 310, isVeg: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', description: 'Smooth broccoli soup enriched with toasted almond flakes and a dollop of fresh cream.' },

  // 3. Global Salads
  { categoryId: 'cat-3', name: 'Classic Caesar w/ Quinoa', price: 450, isVeg: true, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80', description: 'Crisp romaine, puffed quinoa, sourdough croutons, and house-made nutritional yeast dressing.' },
  { categoryId: 'cat-3', name: 'Watermelon & Feta Medley', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1563503200-d86280498ebc?w=400&q=80', description: 'Chilled watermelon cubes, barrel-aged feta, baby arugula, and a lime-pomegranate drizzle.' },
  { categoryId: 'cat-3', name: 'Ahi Tuna Poke Bowl', price: 680, isVeg: false, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', description: 'Fresh tuna chunks, edamame, pickled ginger, sea grape, and spicy mayo on jasmine rice.' },
  { categoryId: 'cat-3', name: 'The Superfood Green Bowl', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', description: 'Kale, spinach, avocado, hemp seeds, blueberries, and a tahini-lemon vinaigrette.' },
  { categoryId: 'cat-3', name: 'Burrata & Peach Panzanella', price: 490, isVeg: true, image: 'https://images.unsplash.com/photo-1608897013039-887f39eb28fe?w=400&q=80', description: 'Charred peaches, warm sourdough bits, heirloom tomatoes, and creamy burrata cheese.' },
  { categoryId: 'cat-3', name: 'Honey Glazed Tofu & Nut Salad', price: 360, isVeg: true, image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&q=80', description: 'Silk tofu cubes, toasted almonds, walnuts, and seasonal berries on a bed of mixed leaf greens.' },
  { categoryId: 'cat-3', name: 'Grilled Chicken & Mango Fiesta', price: 480, isVeg: false, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80', description: 'Cajun spiced chicken strips, sweet Alphonso mango layers, and a chili-lime dressing.' },

  // 4. Signature Veg Mains
  { categoryId: 'cat-4', name: 'Saffron Infused Paneer Lababdar', price: 580, isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', description: 'Cubes of malai paneer simmered in a rich tomato-cashew gravy with hint of saffron.' },
  { categoryId: 'cat-4', name: 'Exotic Vegetable Thai Green Curry', price: 520, isVeg: true, image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80', description: 'Bok choy, asparagus, and snap peas in a creamy coconut and kaffir lime broth.' },
  { categoryId: 'cat-4', name: 'Sundried Tomato & Pesto Risotto', price: 650, isVeg: true, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80', description: 'Aromatic Arborio rice slow-cooked with fresh basil pesto and sun-matured tomatoes.' },
  { categoryId: 'cat-4', name: 'The Ultimate Vegetable Moussaka', price: 490, isVeg: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', description: 'Layers of roasted eggplant, potato, and zucchini with a rich lentil ragu and béchamel.' },
  { categoryId: 'cat-4', name: 'Truffle Mac & 4-Cheese Melt', price: 540, isVeg: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Gourmet macaroni in a blend of Gruyère, Fontina, White Cheddar, and Parmesan with truffle.' },
  { categoryId: 'cat-4', name: 'Smoked Eggplant Bharta (Fusion)', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Traditional chargrilled eggplant puree with a modern olive oil and feta garnish.' },
  { categoryId: 'cat-4', name: 'Dum-Cooked Peshawari Chole', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80', description: 'White chickpeas simmered for hours with tea leaves and a secret 14-spice blend.' },

  // 5. Signature Non-Veg Mains
  { categoryId: 'cat-5', name: 'The Grand Nihari (Lamb)', price: 880, isVeg: false, image: 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=400&q=80', description: 'Braised lamb shanks in a silken aromatic stock, slow-cooked for 12 hours.' },
  { categoryId: 'cat-5', name: 'Butter Chicken Royale', price: 650, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', description: 'Boneless charcoal-grilled chicken in a creamy tomato sauce finished with white butter.' },
  { categoryId: 'cat-5', name: 'Argentine Rib-Eye Steak', price: 1450, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', description: '300g Grass-fed beef cooked to your choice, served with chimichurri and garlic mash.' },
  { categoryId: 'cat-5', name: 'Slow-Roasted Duck Breast', price: 1120, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', description: 'Tender honey-clover duck with a cherry reduction and celeriac puree.' },
  { categoryId: 'cat-5', name: 'Country Style Shepherd’s Pie', price: 720, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', description: 'Traditional minced lamb and vegetable bake with a crispy Parmesan-potato crust.' },
  { categoryId: 'cat-5', name: 'Classic Chicken Cordon Bleu', price: 690, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', description: 'Breaded chicken breast stuffed with premium ham and melted Swiss cheese.' },
  { categoryId: 'cat-5', name: 'Lamb Rogan Josh (Heritage)', price: 780, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', description: 'A Kashmiri classic prepared with dried ginger, fennel, and Maval lamb chops.' },

  // 6. Catch of the Day
  { categoryId: 'cat-6', name: 'Pan-Seared Atlantic Salmon', price: 1350, isVeg: false, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', description: 'Fresh salmon fillet with a lemon-dill caper butter sauce and roasted asparagus.' },
  { categoryId: 'cat-6', name: 'Butter-Garlic Jumbo Prawns', price: 920, isVeg: false, image: 'https://images.unsplash.com/photo-1559740038-046641663162?w=400&q=80', description: 'Flame-seared fresh catch tiger prawns in a rich French butter and garlic emulsion.' },
  { categoryId: 'cat-6', name: 'Steamed Seabass in Ginger', price: 1180, isVeg: false, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', description: 'Delicate seabass fillets steamed with light Cantonese soy, scallions, and fresh ginger.' },
  { categoryId: 'cat-6', name: 'Caribbean Lobster Tail', price: 1850, isVeg: false, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', description: 'Large cold-water lobster tail grilled with herb butter and served with saffron rice.' },
  { categoryId: 'cat-6', name: 'Goan Fish Curry w/ Cocum', price: 750, isVeg: false, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', description: 'Traditional coastal fish preparation with fresh coconut milk and tangy cocum extract.' },
  { categoryId: 'cat-6', name: 'Grilled Mediterranean Octopus', price: 1450, isVeg: false, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', description: 'Tender octopus tentacles charred over woodfire, served with paprika potatoes.' },
  { categoryId: 'cat-6', name: 'Crispy Soft Shell Crabs', price: 980, isVeg: false, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', description: 'Golden-fried soft shell crabs with a spicy Sichuan peppercorn dip.' },

  // 7. Oriental Wok Specials
  { categoryId: 'cat-7', name: 'Szechuan Chili Paneer', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Golden fried paneer tossed in home-made Szechuan paste with colored peppers.' },
  { categoryId: 'cat-7', name: 'Cantonese Stir-Fry Veggies', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Bok choy, broccoli, water chestnuts, and baby corn in a light sesame soy broth.' },
  { categoryId: 'cat-7', name: 'Kung Pao Chicken w/ Cashews', price: 540, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80', description: 'Classic wok-tossed chicken with spicy dried chilies and honey-toasted cashews.' },
  { categoryId: 'cat-7', name: 'Black Pepper Beef Sizzler', price: 750, isVeg: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Prime beef strips wok-seared with crushed Sarawak black peppercorns and spring onions.' },
  { categoryId: 'cat-7', name: 'Hakka Noodles (Premium Heritage)', price: 350, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Hand-pulled wheat noodles tossed with julienned vegetables and superior light soy.' },
  { categoryId: 'cat-7', name: 'Burnt Garlic Fried Rice', price: 320, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Aromatic long-grain rice tossed with deeply browned garlic bits and farm-fresh peas.' },
  { categoryId: 'cat-7', name: 'General Tso’s Cauliflower', price: 390, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', description: 'Crispy cauliflower florets in a sweet-and-spicy tangy glaze with sesame seeds.' },

  // 8. From the Tandoor
  { categoryId: 'cat-8', name: 'The Original Tandoori Chicken', price: 680, isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Whole spring chicken marinated overnight in Greek yogurt and 18 spices, smoked to perfection.' },
  { categoryId: 'cat-8', name: 'Saffron Malai Tikka', price: 520, isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Creamy chicken morsels infused with green cardamom and first-press saffron.' },
  { categoryId: 'cat-8', name: 'Kasundi Mustard Fish Tikka', price: 720, isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Sole fish cubes marinated in sharp Bengali mustard oil and yellow chili powder.' },
  { categoryId: 'cat-8', name: 'Bharwan Mushroom Tikka', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Button mushrooms stuffed with minced vegetables and cheese, grilled golden.' },
  { categoryId: 'cat-8', name: 'Smoked Broccoli w/ Cheese', price: 390, isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Crunchy broccoli florets marinated in a cream-cheese and nutmeg marinade.' },
  { categoryId: 'cat-8', name: 'Mutton Seekh Kebab (Lucknowi)', price: 650, isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Aromatic minced mutton skewers mixed with mint, green chilies, and hand-ground spices.' },
  { categoryId: 'cat-8', name: 'Hariyali Paneer Tikka', price: 480, isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', description: 'Garden-fresh spinach and mint marinated paneer chunks grilled in a clay oven.' },

  // 9. Royal Biryanis
  { categoryId: 'cat-9', name: 'Nizami Hyderabadi Dum Biryani', price: 580, isVeg: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Layers of premium basmati and goat meat slow-cooked in a sealed dough-pot.' },
  { categoryId: 'cat-9', name: 'Lucknowi Awadhi Biryani', price: 550, isVeg: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Fragrant "Yakhni" cooked rice with tender chicken, infused with rose and kewra water.' },
  { categoryId: 'cat-9', name: 'Wild Mushroom & Truffle Biryani', price: 620, isVeg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'A gourmet fusion of shitake, porcini, and Indian spices in long-grain basmati.' },
  { categoryId: 'cat-9', name: 'Kerala Prawn Kuzhimanthi', price: 790, isVeg: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Arabic-style smoked rice with juicy jumbo prawns and a special Malabar fat blend.' },
  { categoryId: 'cat-9', name: 'Egg Dum Biryani (Classic)', price: 450, isVeg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Sturdy basmati paired with whole hard-boiled eggs and a tangy caramelized onion masala.' },
  { categoryId: 'cat-9', name: 'The Vegetable Navratan Pulav', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Rich biryani with nine different vegetables, nuts, and hand-picked fruits.' },
  { categoryId: 'cat-9', name: 'Spicy Fish Keema Biryani', price: 680, isVeg: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', description: 'Minced Sole fish tossed with fiery spices and layered with aromatic Sona Masuri rice.' },

  // 10. Artisanal Breads
  { categoryId: 'cat-10', name: 'Butter Garlic Naan (Leavened)', price: 110, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Classic refined flour bread with fresh garlic and melted white butter.' },
  { categoryId: 'cat-10', name: 'Tandoori Roti w/ Flaxseeds', price: 60, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Whole wheat bread with a healthy flaxseed nuttiness, baked in tandoor.' },
  { categoryId: 'cat-10', name: 'Cheese & Jalapeño Kulcha', price: 180, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Stuffed bread with mozzarella, cheddar, and finely chopped spicy jalapeños.' },
  { categoryId: 'cat-10', name: 'Lachedar Paratha (Flaky)', price: 90, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Layered whole wheat bread with a crispy outer and soft inner fold.' },
  { categoryId: 'cat-10', name: 'Kashmiri Peshawari Naan', price: 220, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Sweet and savory naan stuffed with dried fruits, nuts, and a hint of honey.' },
  { categoryId: 'cat-10', name: 'Oliver & Herb focaccia', price: 250, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'House-baked Italian bread infused with rosemary, sea salt, and Kalamata olives.' },
  { categoryId: 'cat-10', name: 'Turkish Pide Flatbread', price: 280, isVeg: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Boat-shaped traditional bread with a sesame and cumin crust.' },

  // 11. Wood-Fired Pizzas
  { categoryId: 'cat-11', name: 'Margherita Artisanal Style', price: 480, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'San Marzano tomatoes, fresh buffalo mozzarella, and hydroponic basil.' },
  { categoryId: 'cat-11', name: 'Pepperoni & Hot Honey', price: 750, isVeg: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'Spicy pepperoni slices drizzled with our signature chili-infused honey.' },
  { categoryId: 'cat-11', name: 'Quattro Formaggi (4-Cheese)', price: 680, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'A blend of Mozzarella, Gorgonzola, Parmesan, and Scamorza cheeses.' },
  { categoryId: 'cat-11', name: 'Garden Veggie Supreme', price: 540, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'Zucchini, bell peppers, broccoli, corn, and black olives on pesto base.' },
  { categoryId: 'cat-11', name: 'Smoked Chicken & BBQ Pizza', price: 620, isVeg: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'Oak-smoked chicken strips, red onions, and house barbecue sauce.' },
  { categoryId: 'cat-11', name: 'Fig & Prosciutto Flatbread', price: 890, isVeg: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'Fresh mission figs, air-dried prosciutto, and a balsamic balsamic reduction.' },
  { categoryId: 'cat-11', name: 'Wild Mushroom & Garlic Pizza', price: 590, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', description: 'A medley of Forest mushrooms with white garlic oil and fresh parsley.' },

  // 12. Gourmet Burgers
  { categoryId: 'cat-12', name: 'The Black Truffle Lamb Burger', price: 720, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Juicy 200g lamb patty, truffle aioli, Gruyère, and caramelized onions.' },
  { categoryId: 'cat-12', name: 'Smoky Portobello Shroom Burger', price: 580, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Large grilled portobello mushroom, arugula, house-made pesto, and provolone.' },
  { categoryId: 'cat-12', name: 'Nashville Hot Fried Chicken', price: 650, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Crispy double-fried chicken with a spicy ghost chili glaze and cool slaw.' },
  { categoryId: 'cat-12', name: 'Guacamole & Bean Craft Burger', price: 490, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Hand-pressed kidney bean and corn patty with fresh guacamole and tortilla crunch.' },
  { categoryId: 'cat-12', name: 'Classic NYC Beef Burger', price: 1100, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Two 150g prime Angus beef patties, double cheddar, and McClure’s pickles.' },
  { categoryId: 'cat-12', name: 'Crispy Soft Shell Crab Bun', price: 920, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'A whole tempura-fried soft shell crab in a charcoal bun with mango chutney.' },
  { categoryId: 'cat-12', name: 'Vegan Falafel Fusion Sliders', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', description: 'Set of 3 mini sliders with chickpea falafel, tahini dressing, and pickled turnip.' },

  // 13. Classic Pasta & Risotto
  { categoryId: 'cat-13', name: 'Fettuccine w/ Porcini & Cream', price: 620, isVeg: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Freshly made fettuccine in a buttery porcini mushroom and white wine reduction.' },
  { categoryId: 'cat-13', name: 'Spaghetti Carbonara (Classic)', price: 750, isVeg: false, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Traditional recipe with egg yolk, pecorino romano, and crispy pancetta chips.' },
  { categoryId: 'cat-13', name: 'Shrimp & Scallop Seafood Linguine', price: 980, isVeg: false, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Handmade linguine with jumbo shrimp and seared sea scallops in a chili-garlic oil.' },
  { categoryId: 'cat-13', name: 'Asparagus & Lemon Zest Risotto', price: 580, isVeg: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Creamy Arborio with fresh green asparagus, lemon zest, and toasted pine nuts.' },
  { categoryId: 'cat-13', name: 'Beef Short-Rib Lasagne', price: 820, isVeg: false, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Slow-braised short rib meat layered with silk pasta and our house marinara.' },
  { categoryId: 'cat-13', name: 'Sun-dried Tomato Pesto Penne', price: 490, isVeg: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Penne tossed in a vibrant sun-matured tomato pesto and topped with pine nuts.' },
  { categoryId: 'cat-13', name: 'Gnocchi in Gorgonzola Sauce', price: 540, isVeg: true, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&q=80', description: 'Soft potato dumplings in a powerful blue cheese sauce with toasted walnuts.' },

  // 14. Decadent Desserts
  { categoryId: 'cat-14', name: 'Molten Belgian Chocolate Ganache', price: 420, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Hot dark chocolate lava cake served with Madagascar vanilla bean gelato.' },
  { categoryId: 'cat-14', name: 'Deconstructed Saffron Rasmalai', price: 380, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Modern take on the classic Rasmalai with pistachio soil and rose petal foam.' },
  { categoryId: 'cat-14', name: 'Classic Tiramisu (Amaretto)', price: 450, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Espresso-soaked savoiardi layers with whipped mascarpone and Amaretto infusion.' },
  { categoryId: 'cat-14', name: 'New York Cheesecake w/ Berries', price: 490, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Velvety smooth cream cheese cake served with a tart wild berry reduction.' },
  { categoryId: 'cat-14', name: 'Warm Apple Tarte Tatin', price: 410, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Caramelized buttery apples on an upside-down puff pastry with cinnamon cream.' },
  { categoryId: 'cat-14', name: 'Mango Sticky Rice (Thai Fusion)', price: 350, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Sweet glutinous rice cooked in coconut cream, served with fresh Alphonso slices.' },
  { categoryId: 'cat-14', name: 'Hazelnut & Coffee Praline Cake', price: 520, isVeg: true, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'A delicate coffee sponge with hazelnut praline sheets and a shiny chocolate glaze.' },

  // 15. Signature Mocktails
  { categoryId: 'cat-15', name: 'Virgin Hibiscus & Rose Martini', price: 280, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Chilled hibiscus tea with rose syrup and a hint of elderflower, served up.' },
  { categoryId: 'cat-15', name: 'Spicy Guava Mary', price: 250, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Fresh guava juice with a salt-and-chili rim, finished with a dash of Worcestershire.' },
  { categoryId: 'cat-15', name: 'The Golden Mango Basil Seltzer', price: 290, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Ripe mango puree muddled with fresh basil leaves and sparkling soda.' },
  { categoryId: 'cat-15', name: 'Cool Cucumber & Mint Cooler', price: 220, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Slices of crisp English cucumber and fresh mint leaves in a zesty lime base.' },
  { categoryId: 'cat-15', name: 'Passion Fruit & Orange Sunrise', price: 260, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Layers of tangy passion fruit pulp and fresh orange juice over crushed ice.' },
  { categoryId: 'cat-15', name: 'Berry Blast Virgin Mojito', price: 240, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Muddled blueberries, raspberries, and mint with a splash of sweet lime juice.' },
  { categoryId: 'cat-15', name: 'Detox Charcoal & Lemon Tonic', price: 310, isVeg: true, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&q=80', description: 'Activated charcoal, fresh lemon juice, agave nectar, and pure mountain water.' },

  // 16. Craft Coffees & Teas
  { categoryId: 'cat-16', name: 'Single-Origin Ethiopian Pour Over', price: 280, isVeg: true, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', description: 'Hand-poured coffee with bright acidity and floral notes of jasmine.' },
  { categoryId: 'cat-16', name: 'Vietnamese Iced Coffee w/ Condensed Milk', price: 220, isVeg: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', description: 'Strong drip-filtered dark roast served over ice with creamy condensed milk.' },
  { categoryId: 'cat-16', name: 'Authentic Matcha Green Tea Latte', price: 350, isVeg: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', description: 'Ceremonial grade Uji Matcha whisked with your choice of almond or soy milk.' },
  { categoryId: 'cat-16', name: 'Spiced Indian Masala Chai', price: 150, isVeg: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', description: 'Assam black tea boiled with fresh ginger, cardamom, and whole milk.' },
  { categoryId: 'cat-16', name: 'The Caramel Sea-Salt Cold Brew', price: 320, isVeg: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', description: '18-hour steeped cold brew coffee with house-made salted caramel foam.' },
  { categoryId: 'cat-16', name: 'Rose & Lychee White Tea', price: 290, isVeg: true, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', description: 'Delicate white tea leaves infused with the scent of wild roses and fresh lychee.' },
  { categoryId: 'cat-16', name: 'Classic Flat White (Oat Milk)', price: 260, isVeg: true, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80', description: 'Double espresso shot with silky micro-foam of organic oat milk.' },
];

async function main() {
  console.log('🚀 Starting Senior Developer Database Reseed Protocol...');

  // 1. Identify non-preservable tables in correct deletion order (children first)
  const tablesToClear = [
    'orderItem', 'orderStatusLog', 'payment', 'order',
    'favorite', 'review', 'recipeIngredient', 'addon',
    'inventory', 'menuItem', 'menuCategory',
    'reservation', 'notification', 'address', 'banner',
    'coupon', 'table', 'oTP', 'printer'
  ];

  console.log('🧹 Clearing operational data while preserving core identities (Users & Staff)...');
  
  // Explicit ordered deletion to satisfy foreign key constraints
  for (const table of tablesToClear) {
    try {
      const count = await (prisma as any)[table].deleteMany();
      console.log(`- Cleared ${count.count} records from ${table}`);
    } catch (e) {
      console.warn(`⚠️  Skipped clearing ${table}:`, (e as Error).message);
    }
  }

  console.log('✅ Operational data cleared.');

  // 2. Re-seed Categories
  console.log('📁 Seeding 16 Premium Categories...');
  for (const cat of categories) {
    await prisma.menuCategory.create({
      data: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        image: cat.image
      }
    });
  }

  // 3. Re-seed Menu Items (100+ items)
  console.log(`🍛 Seeding ${menuItems.length} Curated Menu Items (A-Z Coverage)...`);
  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        image: item.image,
        description: item.description,
        categoryId: item.categoryId
      }
    });
  }

  // 4. Re-seed Tables (Better Organization)
  console.log('🪑 Arranging 20 Dining Floor Tables...');
  for (let i = 1; i <= 20; i++) {
    await prisma.table.create({
      data: {
        tableNumber: i.toString().padStart(2, '0'),
        capacity: i <= 5 ? 2 : i <= 15 ? 4 : i <= 18 ? 6 : 8,
        status: 'AVAILABLE'
      }
    });
  }

  // 5. Re-seed Banners & Coupons
  console.log('🏷️  Setting up Marketing Campaigns...');
  await prisma.banner.createMany({
    data: [
      { title: 'The Royal Monsoon Feast', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200' },
      { title: 'New Wood-Fired Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200' },
      { title: 'Signature Craft Cocktails', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=1200' }
    ]
  });

  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOMENIGEL', discount: 500, minOrderAmount: 2000, expiryDate: new Date('2026-12-31') },
      { code: 'GOURMET20', discount: 20, minOrderAmount: 1500, expiryDate: new Date('2026-12-31') },
      { code: 'COFFEE100', discount: 100, minOrderAmount: 500, expiryDate: new Date('2026-12-31') }
    ]
  });

  console.log('\n✨ Database Reseed Complete!');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Menu Items: ${menuItems.length}`);
  console.log(`- Users & Staff: PRESERVED`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during reseed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
