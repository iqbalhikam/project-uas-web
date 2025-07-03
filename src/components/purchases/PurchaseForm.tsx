// src/components/purchases/PurchaseForm.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PurchaseOrderSchema, type PurchaseOrderFormData } from '@/lib/schemas/purchase.schema';
import { createPurchaseOrder } from '@/lib/actions/purchase.actions';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { Supplier, Product } from '@prisma/client';

interface PurchaseFormProps {
  suppliers: Supplier[];
  products: Product[];
  onClose: () => void;
}

export function PurchaseForm({ suppliers, products, onClose }: PurchaseFormProps) {
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(PurchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      items: [{ productId: '', quantity: 1, priceAtPurchase: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (values: PurchaseOrderFormData) => {
    toast.promise(createPurchaseOrder(values), {
      loading: 'Menyimpan order...',
      success: (res) => {
        if (typeof res === 'object' && res.error) throw new Error(res.error);
        onClose();
        if (typeof res === 'object' && res.message) return res.message;
        // return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Pemilihan Supplier --- */}
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih Supplier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier untuk order ini" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Daftar Item Produk --- */}
        <div className="space-y-4">
          <FormLabel>Item Produk</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-end p-3 border rounded-md">
              <FormField
                control={form.control}
                name={`items.${index}.productId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <Input type="number" placeholder="Jml" className="w-20" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.priceAtPurchase`}
                render={({ field }) => (
                  <FormItem>
                    <Input type="number" placeholder="Harga Beli" className="w-32" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, priceAtPurchase: 0 })}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Item
          </Button>
        </div>

        {/* --- Tombol Aksi Form --- */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
