/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/pos.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '../auth';
import { getActivePromotions } from './promotion.actions';

// Aksi untuk mengambil data awal yang dibutuhkan halaman POS
export async function getPosData() {
  try {
    // Ambil produk dan promosi aktif secara bersamaan
    const [productsData, promotionsData] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { name: 'asc' },
        include: { category: true }, // Pastikan kategori di-include
      }),
      getActivePromotions(),
    ]);

    return { products: productsData, promotions: promotionsData.promotions || [] };
  } catch (error) {
    return { error: 'Gagal memuat data untuk POS.' };
  }
}

// Tipe data untuk item di keranjang
type CartItem = {
  
  id: string;
  name: string;
  price: number;
  quantity: number;
};



export async function processSale(cartItems: CartItem[], customerId: string, totalAmount: number, paymentMethod: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return { error: 'Akses ditolak. Anda harus login.' };
  }
  if (cartItems.length === 0) {
    return { error: 'Keranjang belanja kosong.' };
  }

  try {

    // Prisma Transaction: Semua operasi di dalamnya akan berhasil atau gagal bersamaan.
    const sale = await prisma.$transaction(async (tx) => {
      // LANGKAH BARU: Validasi stok semua item di keranjang
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { stock: true, name: true },
        });

        if (!product || product.stock < item.quantity) {
          // Lemparkan error untuk membatalkan transaksi
          throw new Error(`Stok untuk produk "${product?.name || item.name}" tidak mencukupi. Sisa stok: ${product?.stock || 0}.`);
        }
      }

      // 1. Buat catatan Penjualan (Sale) utama
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          userId: session.user.id,
          paymentMethod: paymentMethod as any, // Asumsi PaymentMethod adalah enum yang valid
        },
      });

      // 2. Siapkan data untuk SaleItem
      const saleItemsData = cartItems.map((item) => ({
        saleId: newSale.id,
        productId: item.id,
        quantity: item.quantity,
        priceAtSale: item.price,
      }));

      // 3. Buat semua catatan SaleItem
      await tx.saleItem.createMany({
        data: saleItemsData,
      });

      // 4. Update (kurangi) stok untuk setiap produk yang terjual
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // (Opsional tapi direkomendasikan) Catat pergerakan stok untuk setiap item
      for (const item of cartItems) {
        await tx.stockMovement.create({
          data: {
            productId: item.id,
            type: 'SALE',
            quantityChange: -item.quantity, // Stok berkurang
            saleId: newSale.id,
          },
        });
      }

      return newSale;
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: `Transaksi berhasil! ID Nota: ${sale.invoiceNumber.substring(0, 8)}` };
  } catch (error) {
    console.error(error);
    // Kirim pesan error yang lebih spesifik jika ada
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Gagal memproses transaksi.' };
  }
}