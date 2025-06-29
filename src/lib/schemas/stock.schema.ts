// src/lib/schemas/stock.schema.ts

import { z } from 'zod';

// Skema untuk satu item penyesuaian
export const StockAdjustmentItemSchema = z.object({
  productId: z.string(),
  productName: z.string(), // Untuk ditampilkan di UI
  currentStock: z.number(), // Stok sistem saat ini
  physicalCount: z.coerce.number().min(0, 'Stok fisik tidak boleh negatif'), // Stok fisik hasil hitungan
});

// Skema untuk keseluruhan form
export const StockAdjustmentSchema = z.object({
  items: z.array(StockAdjustmentItemSchema),
  reason: z.string().min(3, 'Alasan penyesuaian wajib diisi').optional(),
});

// Tipe data untuk digunakan di form
export type StockAdjustmentFormData = z.infer<typeof StockAdjustmentSchema>;
