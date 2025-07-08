
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StockAdjustmentSchema, type StockAdjustmentFormData } from '@/lib/schemas/stock.schema';
import { adjustStock } from '@/lib/actions/stock.actions';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '@prisma/client';

interface StockAdjustmentFormProps {
  products: Product[];
}

export function StockAdjustmentForm({ products }: StockAdjustmentFormProps) {
  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(StockAdjustmentSchema),
    defaultValues: {
      items: products.map((product) => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        physicalCount: product.stock, 
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (values: StockAdjustmentFormData) => {
    
    const changedItems = values.items
      .filter((item) => item.physicalCount !== item.currentStock)
      .map((item) => ({
        productId: item.productId,
        physicalCount: item.physicalCount,
      }));

    if (changedItems.length === 0) {
      toast.info('Tidak ada perubahan stok yang perlu disimpan.');
      return;
    }

    const reason = 'Stok Opname Berkala'; 

    toast.promise(adjustStock(changedItems, reason), {
      loading: 'Menyimpan penyesuaian...',
      success: (res) => {
        if (res.error) throw new Error(res.error);
        
        
        window.location.reload();
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="text-center">Stok Sistem</TableHead>
                <TableHead className="w-[150px] text-center">Stok Fisik (Hitungan)</TableHead>
                <TableHead className="text-center">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const currentStock = form.watch(`items.${index}.currentStock`);
                const physicalCount = form.watch(`items.${index}.physicalCount`);
                const difference = physicalCount - currentStock;

                return (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.productName}</TableCell>
                    <TableCell className="text-center">{field.currentStock}</TableCell>
                    <TableCell>
                      <Input type="number" className="text-center" {...form.register(`items.${index}.physicalCount`)} />
                    </TableCell>
                    <TableCell className={`text-center font-bold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}`}>{difference > 0 ? `+${difference}` : difference}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
