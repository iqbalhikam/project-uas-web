import { z } from 'zod';

const ProductSchema = z.object({
  sku: z.string().min(3, 'SKU minimal 3 karakter'),
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  description: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
  purchasePrice: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
  stock: z.coerce.number().int('Stok harus angka bulat'),
  categoryId: z.string().cuid('Kategori tidak valid'),
});

export default ProductSchema;
