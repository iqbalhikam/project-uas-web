// src/app/dashboard/purchases/page.tsx

import { getPurchaseOrders } from '@/lib/actions/purchase.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getSuppliers } from '@/lib/actions/supplier.actions';
import { getProducts } from '@/lib/actions/product.actions';
import { PurchaseActions } from '@/components/purchases/PurchaseActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Fungsi helper untuk format mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Fungsi helper untuk warna status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    case 'PENDING':
    default:
      return 'secondary';
  }
};

export default async function PurchasesPage() {
  // Ambil semua data yang diperlukan untuk form dan halaman
  const { purchaseOrders, error } = await getPurchaseOrders();
  const { suppliers } = await getSuppliers();
  const { products } = await getProducts(); // Mengambil semua produk untuk form

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  // Pastikan data yang dibutuhkan form tersedia
  if (!suppliers || !products) {
    return <div className="p-8">Gagal memuat data supplier atau produk.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Order Pembelian</CardTitle>
          {/* Komponen untuk tombol "Buat Order Baru" */}
          <PurchaseActions suppliers={suppliers} products={products} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders && purchaseOrders.length > 0 ? (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>{format(po.orderDate, 'dd MMM yyyy', { locale: id })}</TableCell>
                      <TableCell className="font-medium">{po.supplier.name}</TableCell>
                      <TableCell>{po.items.length}</TableCell>
                      <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(po.status)}>{po.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {po.status === 'PENDING' && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/purchases/receive/${po.id}`}>Terima Barang</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Belum ada data order pembelian.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
