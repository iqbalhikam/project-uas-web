// app/dashboard/categories/page.tsx

import { getCategories } from '@/lib/actions/category.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryActions } from '@/components/categories/CategoryActions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function CategoriesPage() {
  const { categories, error } = await getCategories();

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!categories) {
    return <div className="p-8">Gagal memuat data kategori.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manajemen Kategori</CardTitle>
          </div>
          <CategoryActions />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Nama Kategori</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{format(category.createdAt, 'dd MMMM yyyy', { locale: id })}</TableCell>
                      <TableCell className="text-right">
                        <CategoryActions category={category} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Belum ada kategori. Silakan tambahkan.
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
