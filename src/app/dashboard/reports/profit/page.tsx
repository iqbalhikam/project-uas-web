import { getProfitReport } from '@/lib/actions/report.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

type ProfitReportPageProps = {
  searchParams: {
    from: Promise<{ [key: string]: string | string[] | undefined }>;
    to: Promise<{ [key: string]: string | string[] | undefined }>;
  };
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

export default async function ProfitReportPage({ searchParams }: ProfitReportPageProps) {
  const currentSearchParams = await searchParams;

  const from = currentSearchParams?.from ? new Date(String(currentSearchParams.from)) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = await currentSearchParams?.to ? new Date(String(currentSearchParams.from)) : new Date();

  const report = await getProfitReport(from, to);

  // ... (sisa kode tidak berubah)
  if (report.error) {
    return <div className="p-8 text-red-500">{report.error}</div>;
  }

  const { totalRevenue, totalCostOfGoods, totalProfit, details } = report;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
          <p className="text-muted-foreground">Analisis keuntungan dari penjualan produk.</p>
        </div>
        <DateRangePicker />
      </div>
      {/* Kartu Statistik Ringkasan */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Pendapatan" value={formatCurrency(totalRevenue || 0)} icon={TrendingUp} />
        <StatCard title="Total Modal (HPP)" value={formatCurrency(totalCostOfGoods || 0)} icon={TrendingDown} />
        <StatCard title="Laba Kotor" value={formatCurrency(totalProfit || 0)} icon={DollarSign} />
      </div>
      {/* Tabel Rincian per Produk */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Keuntungan per Produk</CardTitle>
          <CardDescription>Menampilkan rincian keuntungan untuk setiap produk yang terjual dalam rentang tanggal yang dipilih.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[40vh] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-center">Jumlah Terjual</TableHead>
                  <TableHead className="text-right">Total Pendapatan</TableHead>
                  <TableHead className="text-right">Total Modal</TableHead>
                  <TableHead className="text-right">Total Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details && details.length > 0 ? (
                  details.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantitySold}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(item.totalCost)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{formatCurrency(item.totalProfit)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data penjualan untuk rentang tanggal ini.
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
