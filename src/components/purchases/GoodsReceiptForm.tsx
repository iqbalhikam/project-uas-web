
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import type { PurchaseOrder, PurchaseOrderItem, Product, Supplier } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { receivePurchaseOrder } from '@/lib/actions/purchase.actions'; 


type POItemWithProduct = PurchaseOrderItem & { product: Product };
type POWithDetails = PurchaseOrder & { items: POItemWithProduct[]; supplier: Supplier };

interface GoodsReceiptFormProps {
  purchaseOrder: POWithDetails;
}


const FormSchema = z.object({
  items: z.array(
    z.object({
      purchaseOrderItemId: z.string(),
      productId: z.string(),
      quantityReceived: z.coerce.number().min(0, 'Jumlah tidak boleh negatif'),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

export function GoodsReceiptForm({ purchaseOrder }: GoodsReceiptFormProps) {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: purchaseOrder.items.map((item) => ({
        purchaseOrderItemId: item.id,
        productId: item.productId,
        quantityReceived: item.quantity, 
      })),
    },
  });

  const onSubmit = async (values: FormData) => {
    toast.promise(receivePurchaseOrder(purchaseOrder.id, values.items), {
      loading: 'Memproses penerimaan barang...',
      success: (res) => {
        if (res.error) throw new Error(res.error);
        router.push('/dashboard/purchases'); 
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <p className="font-medium">Supplier: {purchaseOrder.supplier.name}</p>
          <p className="text-sm text-muted-foreground">Tanggal Order: {new Date(purchaseOrder.orderDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="w-32 text-center">Dipesan</TableHead>
                <TableHead className="w-32 text-center">Diterima</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantityReceived`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" className="text-center" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Memproses...' : 'Konfirmasi Penerimaan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


