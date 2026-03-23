import { z } from 'zod';

export const addressSchema = z.object({
  body: z.object({
    type: z.enum(['Home', 'Office', 'Other']),
    addressLine1: z.string().min(5, 'Address is too short'),
    addressLine2: z.string().optional().nullable(),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(5),
    isDefault: z.boolean().default(false),
  }),
});
