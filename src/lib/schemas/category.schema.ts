// lib/schemas/category.schema.ts

import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().min(3, 'Nama kategori minimal 3 karakter'),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;
