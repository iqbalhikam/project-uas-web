// src/lib/actions/purchase.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PurchaseOrderSchema } from '../schemas/purchase.schema';

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
