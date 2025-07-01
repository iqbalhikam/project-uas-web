'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, Product } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ProductSchema from '@/lib/schemas/product.schema';
import { ProductScanner } from './ProductScanner'; // <-- Impor komponen scanner yang sudah diisolasi

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  onClose: () => void;
}

export function ProductForm({ categories, product, onClose }: ProductFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      sellingPrice: product?.sellingPrice || 0,
      purchasePrice: product?.purchasePrice || 0,
      stock: product?.stock || 0,
      categoryId: product?.categoryId || '',
    },
  });

  // Fungsi callback ini akan menerima hasil pindaian dari komponen ProductScanner
  const handleScan = (scannedSku: string) => {
    // Mengatur nilai field 'sku' di dalam form
    form.setValue('sku', scannedSku, { shouldValidate: true });
    toast.info(`SKU diatur ke: ${scannedSku}`);
  };

  const onSubmit = async (values: z.infer<typeof ProductSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      // Pastikan nilai tidak null/undefined sebelum di-append
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const promise = product ? updateProduct(product.id, formData) : createProduct(formData);

    toast.promise(promise, {
      loading: product ? 'Memperbarui produk...' : 'Menambahkan produk...',
      success: (res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        form.reset();
        onClose();
        router.refresh(); // Memuat ulang data di halaman produk
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="cth: Kopi Susu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Kode Unik Produk)</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input placeholder="Ketik atau pindai kode..." {...field} />
                </FormControl>
                {/* Komponen ProductScanner yang sudah terisolasi.
                  Ia menangani state buka/tutup scanner-nya sendiri.
                */}
                <ProductScanner onScan={handleScan} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Jual</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="cth: 20000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="cth: 10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok Awal</FormLabel>
              <FormControl>
                {/* Stok hanya bisa diisi saat membuat produk baru */}
                <Input type="number" placeholder="cth: 100" {...field} disabled={!!product} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
