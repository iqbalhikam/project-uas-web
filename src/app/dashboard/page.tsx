// app/dashboard/page.tsx
import { getDashboardStats } from '@/lib/actions/dashboard.actions';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Package, Users, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

// Fungsi helper untuk format mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Jika terjadi error saat fetch data, tampilkan pesan
  if (stats.error) {
    return <div className="p-8 text-center text-red-500">{stats.error}</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Dashboard {}</h1>

      {/* Bagian Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pendapatan" value={formatCurrency(stats.totalRevenue || 0)} icon={CreditCard} description="Total pendapatan sepanjang waktu" />
        <StatCard title="Penjualan Hari Ini" value={formatCurrency(stats.salesToday || 0)} icon={DollarSign} description="Total pendapatan untuk hari ini" />
        <StatCard title="Jumlah Produk" value={stats.productCount || 0} icon={Package} description="Total jenis produk yang terdaftar" />
        <StatCard title="Jumlah Pelanggan" value={stats.customerCount || 0} icon={Users} description="Total pelanggan yang terdaftar" />
      </div>

      {/* Bagian Tabel (Penjualan Terbaru & Stok Menipis) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Penjualan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentSales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="font-medium">{sale.customer.name}</div>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(sale.saleDate, { addSuffix: true, locale: id })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stok Segera Habis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Sisa Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.lowStockProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">{product.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
