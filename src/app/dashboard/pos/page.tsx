// app/dashboard/pos/page.tsx
import { getPosData } from '@/lib/actions/pos.actions';
import { PosClient } from '@/components/pos/PosClient';

// Ini adalah Server Component yang mengambil data awal
export default async function PosPage() {
  const { products, promotions, error } = await getPosData();

  if (error || !products) {
    return <div className="p-8 text-center text-red-500">{error || 'Gagal memuat data. Pastikan ada produk dan pelanggan di database.'}</div>;
  }

  return (
    <div className="p-4">
      <PosClient products={products} promotions={promotions} />
    </div>
  );
}
