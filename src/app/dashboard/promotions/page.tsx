

import { getPromotions } from '@/lib/actions/promotion.actions';
import { getCategories } from '@/lib/actions/product.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PromotionActions } from '@/components/promotions/PromotionActions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';


const formatDate = (date: Date) => format(date, 'dd MMM yyyy', { locale: id });

export default async function PromotionsPage() {
  
  const [{ promotions, success: promoError }, { categories, error: catError }] = await Promise.all([getPromotions(), getCategories()]);

  if (promoError || catError || !promotions || !categories) {
    return <div className="p-8 text-red-500">{promoError || catError || 'Gagal memuat data.'}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Promosi & Diskon</CardTitle>
          <PromotionActions categories={categories} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Diskon</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length > 0 ? (
                  promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.description}</TableCell>
                      <TableCell className="font-bold text-green-600">{promo.discountPercent}%</TableCell>
                      <TableCell>{`${formatDate(promo.startDate)} - ${formatDate(promo.endDate)}`}</TableCell>
                      <TableCell>{promo.category?.name || 'Semua Produk'}</TableCell>
                      <TableCell>
                        <Badge variant={promo.isDynamicallyActive ? 'default' : 'secondary'}>{promo.isDynamicallyActive ? 'Aktif' : 'Tidak Aktif'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <PromotionActions promotion={promo} categories={categories} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Belum ada data promosi.
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