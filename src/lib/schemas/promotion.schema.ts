import { z } from 'zod';

export const PromotionSchema = z.object({
  description: z.string().min(5, 'Deskripsi minimal harus 5 karakter.'),
  discountPercent: z.coerce.number().min(1, 'Diskon minimal 1%').max(100, 'Diskon maksimal 100%'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal mulai tidak valid.' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Tanggal selesai tidak valid.' }),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional(),
});

export type PromotionFormData = z.infer<typeof PromotionSchema>;
