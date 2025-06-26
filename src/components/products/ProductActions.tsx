// components/products/ProductActions.tsx
'use client';

import { useState } from 'react';
import { Category, Product } from '@prisma/client';
import { toast } from 'sonner';

// Impor komponen UI dari shadcn/ui
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal } from 'lucide-react';

// Impor Server Action dan Form
import { deleteProduct } from '@/lib/actions/product.actions';
import { ProductForm } from './ProductForm';
// import { ProductForm } from './product-form'; // Pastikan path impor ini benar

// Definisikan props untuk komponen ini
interface ProductActionsProps {
  categories: Category[];
  product?: Product; // product bersifat opsional
}

export function ProductActions({ categories, product }: ProductActionsProps) {
  // State untuk mengontrol dialog form (Tambah/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  // State untuk mengontrol dialog konfirmasi hapus
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    const promise = deleteProduct(product.id);
    toast.promise(promise, {
      loading: 'Menghapus produk...',
      success: 'Produk berhasil dihapus',
      error: 'Gagal menghapus produk',
    });
  };

  // Jika tidak ada `product` di props, berarti ini adalah tombol "Tambah Produk Baru"
  if (!product) {
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button>Tambah Produk Baru</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <ProductForm categories={categories} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  // Jika ada `product` di props, berarti ini adalah menu aksi untuk setiap baris tabel
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsFormOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-red-600">
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog untuk form Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories}
            product={product} // Kirim data produk untuk mode edit
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog untuk konfirmasi Hapus */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Aksi ini tidak bisa dibatalkan. Ini akan menghapus produk &quot;{product.name}&quot; secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
