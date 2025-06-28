// src/lib/schemas/purchase.schema.ts

import { z } from 'zod';

// Skema untuk satu item produk dalam order pembelian
const PurchaseItemSchema = z.object({
  productId: z.string().min(1, 'Produk harus dipilih'),
  quantity: z.coerce.number().min(1, 'Jumlah minimal 1'),
  priceAtPurchase: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
});

// Skema untuk keseluruhan order pembelian
export const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier harus dipilih'),
  items: z.array(PurchaseItemSchema).min(1, 'Minimal harus ada 1 produk dalam order'),
  // totalAmount akan dihitung di server, jadi tidak perlu divalidasi di sini
});

// Tipe data untuk digunakan di form
export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderSchema>;
