import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCategories, getProducts } from '@/lib/actions/product.actions';
import { ProductActions } from '@/components/products/ProductActions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ProductsPageProps = {
  searchParams?: {
    page?: Promise<{ rcdId: string }>;
  };
};
// Halaman ini adalah Server Component
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const currentPage = Number(searchParams?.page);
  const limit = 10; // Tentukan batas per halaman

  // ... (sisa kode tidak berubah)
  const { products, totalProducts } = await getProducts(currentPage, limit);
  const { categories } = await getCategories();

  // Format harga menjadi Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!categories) {
    return <div>Gagal memuat kategori. Pastikan Anda sudah membuat data kategori.</div>;
  }

  const totalPages = Math.ceil((totalProducts || 0) / limit);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Manajemen Produk</h1>
        {/* Tombol Tambah Produk kini ada di dalam ProductActions */}
        <ProductActions categories={categories} />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Harga Beli</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                  <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
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
    </div>
  );
}
