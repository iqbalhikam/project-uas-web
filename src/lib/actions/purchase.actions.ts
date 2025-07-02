// src/lib/actions/purchase.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PurchaseOrderSchema } from '../schemas/purchase.schema';
import { verifyAdmin } from '../auth-utils';

// Fungsi untuk mengambil semua data Purchase Order
export async function getPurchaseOrders() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true, // Sertakan informasi supplier
        items: true, // Sertakan jumlah item
      },
      orderBy: {
        orderDate: 'desc',
      },
    });
    return { purchaseOrders };
  } catch {
    return { error: 'Gagal memuat data order pembelian.' };
  }
}

// Fungsi untuk membuat Purchase Order baru
export async function createPurchaseOrder(data: unknown) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck;
  // 1. Validasi data yang masuk menggunakan skema
  const validatedFields = PurchaseOrderSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Data tidak valid.' };
  }

  const { supplierId, items } = validatedFields.data;

  try {
    // 2. Hitung total harga
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.priceAtPurchase, 0);

    // 3. Gunakan transaksi Prisma untuk memastikan semua operasi berhasil
    await prisma.$transaction(async (tx) => {
      // Buat entri PurchaseOrder utama
      const newPurchaseOrder = await tx.purchaseOrder.create({
        data: {
          supplierId,
          totalAmount,
          // status PENDING secara default
        },
      });

      // Siapkan data untuk PurchaseOrderItem
      const purchaseOrderItemsData = items.map((item) => ({
        purchaseOrderId: newPurchaseOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      }));

      // Buat semua entri item pembelian
      await tx.purchaseOrderItem.createMany({
        data: purchaseOrderItemsData,
      });

      // CATATAN: Penambahan stok akan dilakukan pada langkah "Penerimaan Barang", bukan saat PO dibuat.
    });

    revalidatePath('/dashboard/purchases'); // Refresh halaman daftar order
    return { message: 'Order Pembelian berhasil dibuat.' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal membuat order pembelian.' };
  }
}

export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true, // Sertakan detail produk di setiap item
          },
        },
      },
    });
    if (!purchaseOrder) {
      return { error: 'Order pembelian tidak ditemukan.' };
    }
    return { purchaseOrder };
  } catch {
    return { error: 'Gagal memuat data order pembelian.' };
  }
}

type ReceivedItem = {
  productId: string;
  quantityReceived: number;
};

export async function receivePurchaseOrder(purchaseOrderId: string, receivedItems: ReceivedItem[]) {
  try {
    // Gunakan transaksi untuk memastikan semua operasi database konsisten
    await prisma.$transaction(async (tx) => {
      // 1. Update status Purchase Order menjadi COMPLETED
      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: 'COMPLETED' },
      });

      // 2. Loop setiap item yang diterima untuk update stok
      for (const item of receivedItems) {
        if (item.quantityReceived > 0) {
          // Tambah stok di tabel Product
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantityReceived,
              },
            },
          });

          // (Opsional tapi direkomendasikan) Catat pergerakan stok
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'PURCHASE',
              quantityChange: item.quantityReceived,
              reason: `Penerimaan dari PO #${purchaseOrderId.substring(0, 8)}`,
              purchaseOrderId: purchaseOrderId,
            },
          });
        }
      }
    });

    // Revalidasi path agar data di halaman lain ikut ter-update
    revalidatePath('/dashboard/purchases');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');

    return { message: 'Penerimaan barang berhasil diproses dan stok telah diperbarui.' };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memproses penerimaan barang.' };
  }
}
