'use client';

import { useState } from 'react';
import { Category, Product } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { deleteProduct } from '@/lib/actions/product.actions';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProductActionsProps {
  categories: Category[];
  product?: Product;
}

export function ProductActions({ categories, product }: ProductActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    if (!product) return;

    const promise = deleteProduct(product.id).then((res) => {
      if (res.error) throw new Error(res.error);
      return res;
    });

    toast.promise(promise, {
      loading: 'Menghapus produk...',
      success: 'Produk berhasil dihapus',
      error: (err) => err.message,
    });
  };

  return (
    <>
      {/* Tombol Tambah Produk (jika tidak ada data produk) */}
      {!product && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <ProductForm categories={categories} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Tombol Edit & Hapus (jika ada data produk) */}
      {product && (
        <div className="flex gap-2">
          {/* Edit Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Produk</DialogTitle>
              </DialogHeader>
              <ProductForm categories={categories} product={product} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>Tindakan ini tidak dapat diurungkan. Ini akan menghapus produk secara permanen dari database.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
