// src/lib/actions/stock.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

type AdjustmentItem = {
  productId: string;
  physicalCount: number;
};

// Fungsi untuk melakukan penyesuaian stok
export async function adjustStock(items: AdjustmentItem[], reason: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Akses ditolak. Hanya admin yang bisa melakukan penyesuaian stok.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // 1. Ambil stok saat ini dari database untuk produk tersebut
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        }

        const currentStock = product.stock;
        const physicalCount = item.physicalCount;
        const quantityChange = physicalCount - currentStock;

        // 2. Hanya lakukan update jika ada perubahan
        if (quantityChange !== 0) {
          // Update stok produk ke jumlah fisik yang baru
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: physicalCount },
          });

          // Catat pergerakan stok
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'ADJUSTMENT',
              quantityChange: quantityChange, // Bisa positif (bertambah) atau negatif (berkurang)
              reason: reason || 'Stok Opname',
            },
          });
        }
      }
    });

    // Revalidasi path agar data di UI ter-update
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');

    return { message: 'Penyesuaian stok berhasil disimpan.' };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Gagal menyimpan penyesuaian stok.' };
  }
}
