// app/dashboard/categories/page.tsx

import { getCategories } from '@/lib/actions/category.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryActions } from '@/components/categories/CategoryActions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CategoriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage( { searchParams }: CategoriesPageProps ) {
  // const { categories, error } = await getCategories();
  const currentSearchParams = await searchParams;
  const currentPage = Number(currentSearchParams?.page) || 1;
  const limit = 5;

  const { totalCategories, categories, error } = await getCategories(currentPage, limit);

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!categories) {
    return <div className="p-8">Gagal memuat data kategori.</div>;
  }

  const totalPages = Math.ceil((totalCategories || 0) / limit);

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
          <div className="flex items-center justify-end space-x-2 py-4">
            <Link href={`?page=${currentPage > 1 ? currentPage - 1 : 1}`}>
              <Button variant="outline" size="sm" disabled={currentPage <= 1}>
                Sebelumnya
              </Button>
            </Link>
            <span className="text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Link href={`?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>
                Selanjutnya
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
