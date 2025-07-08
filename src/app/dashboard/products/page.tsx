

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCategories, getProducts } from '@/lib/actions/product.actions';
import { ProductActions } from '@/components/products/ProductActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';



interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  
  const currentSearchParams = await searchParams;
  const currentPage = Number(currentSearchParams?.page) || 1;
  const limit = 10;

  const { products, totalProducts } = await getProducts(currentPage, limit);
  const { categories } = await getCategories();

  if (!categories) {
    return <div>Gagal memuat kategori. Pastikan Anda sudah membuat data kategori.</div>;
  }

  const totalPages = Math.ceil((totalProducts || 0) / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Manajemen Produk</h1>
        <ProductActions categories={categories} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] md:w-[250px]">Nama Produk</TableHead>
              {/* Sembunyikan kolom yang kurang penting di layar kecil */}
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead className="hidden lg:table-cell">Harga Beli</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatCurrency(product.purchasePrice)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <ProductActions categories={categories} product={product} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Link href={`?page=${currentPage > 1 ? currentPage - 1 : 1}`}>
          <Button variant="outline" size="sm" disabled={currentPage <= 1}>
            <span className="hidden md:inline">Sebelumnya</span>
            <ChevronLeftIcon className="md:hidden" />
          </Button>
        </Link>
        <span className="text-sm">
          <span className='hidden md:inline'>
            Halaman {currentPage} dari {totalPages}
          </span>
          <span className='md:hidden'>
            {currentPage}-{totalPages}
          </span>
        </span>
        <Link href={`?page=${currentPage < totalPages ? currentPage + 1 : totalPages}`}>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>
            <span className="hidden md:inline">Selanjutnya</span>
            <ChevronRightIcon className="md:hidden" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
