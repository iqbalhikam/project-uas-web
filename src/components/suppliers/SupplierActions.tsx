// components/suppliers/SupplierActions.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Supplier } from '@prisma/client';
import { SupplierSchema, type SupplierFormData } from '@/lib/schemas/supplier.schema';
import { createSupplier, deleteSupplier, updateSupplier } from '@/lib/actions/supplier.actions';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface SupplierActionsProps {
  supplier?: Supplier;
}

export function SupplierActions({ supplier }: SupplierActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: supplier?.name || '',
      contactPerson: supplier?.contactPerson || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
    },
  });

  const onSubmit = async (values: SupplierFormData) => {
    const formData = new FormData();
    // Loop untuk mengisi formData dari values
    (Object.keys(values) as Array<keyof SupplierFormData>).forEach((key) => {
      formData.append(key, values[key] || '');
    });

    const promise = supplier ? updateSupplier(supplier.id, formData) : createSupplier(formData);

    toast.promise(promise, {
      loading: supplier ? 'Memperbarui...' : 'Menambahkan...',
      success: (res) => {
        if (res.success) throw new Error(res.message);
        setIsDialogOpen(false);
        form.reset();
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  const handleDelete = () => {
    if (!supplier) return;
    toast.promise(deleteSupplier(supplier.id), {
      loading: 'Menghapus...',
      success: (res) => {
        if (res.success) throw new Error(res.message);
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {!supplier && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Supplier
          </Button>
        </DialogTrigger>
      )}

      {supplier && (
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
                <AlertDialogDescription>Tindakan ini akan menghapus data supplier secara permanen.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: PT Sinar Jaya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontak Person</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Budi" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: 08123456789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Jl. Raya No. 123" {...field} value={field.value ?? ''} />
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
