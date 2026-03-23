import { z } from 'zod';

export const menuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    price: z.number().positive('Price must be positive'),
    categoryId: z.string().uuid('Invalid category ID'),
    isVeg: z.boolean().default(true),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isSpicy: z.boolean().default(false),
    image: z.string().optional().nullable(),
    preparationTime: z.number().int().positive().optional().nullable(),
    availability: z.boolean().default(true),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
  }),
});
