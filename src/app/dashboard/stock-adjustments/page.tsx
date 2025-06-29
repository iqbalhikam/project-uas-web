// src/app/dashboard/stock-adjustments/page.tsx

import { getProducts } from '@/lib/actions/product.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StockAdjustmentForm } from '@/components/stock/StockAdjustmentForm';

export default async function StockAdjustmentPage() {
  // Kita perlu mengambil semua produk untuk ditampilkan di form
  const { products, error } = await getProducts(1, 1000); // Ambil semua produk, sesuaikan limit jika perlu

  if (error || !products) {
    return <div className="p-8 text-red-500">{error || 'Gagal memuat data produk.'}</div>;
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Stok Opname / Penyesuaian Stok</CardTitle>
          <CardDescription>Gunakan halaman ini untuk mencocokkan stok sistem dengan stok fisik di gudang. Masukkan jumlah fisik hasil perhitungan pada kolom &quot;Stok Fisik&quot;.</CardDescription>
        </CardHeader>
        <CardContent>
          <StockAdjustmentForm products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
