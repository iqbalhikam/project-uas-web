'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@prisma/client';
import { CategorySchema, type CategoryFormData } from '@/lib/schemas/category.schema';
import { createCategory, deleteCategory, updateCategory } from '@/lib/actions/category.actions';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';

interface CategoryActionsProps {
  category?: Category;
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name || '',
    },
  });

  const onSubmit = async (values: CategoryFormData) => {
    const formData = new FormData();
    formData.append('name', values.name);

    const promise = category ? updateCategory(category.id, formData) : createCategory(formData);

    toast.promise(promise, {
      loading: category ? 'Memperbarui...' : 'Menambahkan...',
      success: (res) => {
        
        if (typeof res === 'object' && res !== null && 'error' in res && res.error) {
          throw new Error(String(res.error));
        }
        setIsDialogOpen(false);
        if (typeof res === 'object' && res !== null && 'message' in res && res.message) {
          return res.message;
        }
        return 'Aksi berhasil!';
      },
      error: (err) => err.message,
    });
  };

  const handleDelete = () => {
    if (!category) return;
    const promise = deleteCategory(category.id);

    toast.promise(promise, {
      loading: 'Menghapus...',
      success: (res) => {
        if ("error" in res) {
          throw new Error(res.error);
        }
        if ('message' in res) {
          return res.message;
        }
        return 'Kategori berhasil dihapus.';
      },
      error: (err) => err.message,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* Tombol Tambah (Mode Create) */}
      {!category && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kategori
          </Button>
        </DialogTrigger>
      )}

      {/* Tombol Aksi (Mode Edit/Delete) */}
      {category && (
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>Tindakan ini tidak dapat diurungkan. Ini akan menghapus kategori secara permanen.</AlertDialogDescription>
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

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
          <DialogDescription>{category ? 'Ubah nama untuk kategori ini.' : 'Buat kategori baru untuk produk Anda.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Minuman Dingin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
