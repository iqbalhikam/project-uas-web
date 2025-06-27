// src/components/users/UserActions.tsx
'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { toast } from 'sonner';

// Impor komponen UI
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Impor form dan actions
import { deleteUser } from '@/lib/actions/user.actions';
import { UserForm } from './UserForm';

interface UserActionsProps {
  user?: User; // Opsional, untuk membedakan mode tambah dan edit/hapus
}

export function UserActions({ user }: UserActionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = () => {
    if (!user) return;

    toast.promise(deleteUser(user.id), {
      loading: 'Menghapus pengguna...',
      success: (res) => {
        if ('error' in res) throw new Error(res.error);
        setIsAlertOpen(false);
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  // Tampilan untuk tombol "Tambah Pengguna Baru" (jika tidak ada prop `user`)
  if (!user) {
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <UserForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  // Tampilan untuk tombol Aksi "Edit" dan "Hapus" per baris
  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Dialog untuk form Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <UserForm user={user} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi Hapus */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus pengguna &quot;{user.name}&quot; secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
