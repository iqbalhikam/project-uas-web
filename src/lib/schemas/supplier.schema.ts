// lib/schemas/supplier.schema.ts

import { z } from 'zod';

export const SupplierSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof SupplierSchema>;
