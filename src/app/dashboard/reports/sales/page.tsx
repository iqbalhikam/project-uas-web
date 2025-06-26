/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/reports/sales/page.tsx
import { getSalesByDateRange } from '@/lib/actions/report.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Asumsikan Anda sudah punya komponen ini
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

export default async function SalesReportPage({ searchParams }: { searchParams?: { from?: string; to?: string } }) {
  const from = searchParams?.from ? new Date(searchParams.from) : undefined;
  const to = searchParams?.to ? new Date(searchParams.to) : undefined;

  // Set default ke 1 bulan terakhir jika tidak ada parameter
  const dateFrom = from || new Date(new Date().setMonth(new Date().getMonth() - 1));
  const dateTo = to || new Date();

  const { sales, error } = await getSalesByDateRange(dateFrom, dateTo);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
          <p className="text-muted-foreground">Lihat riwayat transaksi penjualan berdasarkan rentang tanggal.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker />
          <a href={`/api/export/sales?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`} download>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Laporan</CardTitle>
          <CardDescription>
            Menampilkan {sales?.length || 0} transaksi dari tanggal {format(dateFrom, 'dd MMM yyyy')} sampai {format(dateTo, 'dd MMM yyyy')}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nota</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.invoiceNumber.substring(0, 8)}...</TableCell>
                      <TableCell>{format(sale.saleDate, 'dd MMMM yyyy, HH:mm', { locale: id })}</TableCell>
                      <TableCell>{sale.customer.name}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada data untuk rentang tanggal ini.
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
