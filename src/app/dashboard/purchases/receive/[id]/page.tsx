// src/app/dashboard/purchases/receive/[id]/page.tsx

import { getPurchaseOrderById } from '@/lib/actions/purchase.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoodsReceiptForm } from '@/components/purchases/GoodsReceiptForm';

export default async function GoodsReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { purchaseOrder, error } = await getPurchaseOrderById(id);

  if (error || !purchaseOrder) {
    return <div className="p-8 text-center text-red-500">{error || 'Order pembelian tidak ditemukan.'}</div>;
  }

  if (purchaseOrder.status !== 'PENDING') {
    return (
      <div className="p-8 text-center text-yellow-600">
        Status order ini adalah <strong>{purchaseOrder.status}</strong>. Stok untuk order ini sudah diperbarui atau dibatalkan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Penerimaan Barang</CardTitle>
          <CardDescription>Konfirmasi jumlah barang yang diterima dari supplier berdasarkan Purchase Order #{purchaseOrder.id.substring(0, 8)}.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoodsReceiptForm purchaseOrder={purchaseOrder} />
        </CardContent>
      </Card>
    </div>
  );
}
