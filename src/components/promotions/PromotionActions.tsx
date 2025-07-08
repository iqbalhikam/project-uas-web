'use client';

import { useState } from 'react';
import type { Category, Promotion } from '@prisma/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { deletePromotion } from '@/lib/actions/promotion.actions';
import { PromotionForm } from './PromotionForm';

interface PromotionActionsProps {
  promotion?: Promotion;
  categories: Category[]; 
}

export function PromotionActions({ promotion, categories }: PromotionActionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = () => {
    if (!promotion) return;
    toast.promise(deletePromotion(promotion.id), {
      loading: 'Menghapus promosi...',
      success: (res) => {
        if (res.success) throw new Error(res.message);
        setIsAlertOpen(false);
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  
  if (!promotion) {
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Promosi
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Promosi Baru</DialogTitle>
          </DialogHeader>
          <PromotionForm categories={categories} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promosi</DialogTitle>
          </DialogHeader>
          <PromotionForm promotion={promotion} categories={categories} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus promosi <span>{promotion.description}</span> secara permanen.</AlertDialogDescription>
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
