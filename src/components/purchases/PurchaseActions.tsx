// src/components/purchases/PurchaseActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
 // Form yang akan kita buat selanjutnya
import type { Supplier, Product } from '@prisma/client';
import { PurchaseForm } from './PurchaseForm';

interface PurchaseActionsProps {
  suppliers: Supplier[];
  products: Product[];
}

export function PurchaseActions({ suppliers, products }: PurchaseActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Buat Order Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Order Pembelian Baru</DialogTitle>
        </DialogHeader>
        <PurchaseForm suppliers={suppliers} products={products} onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
