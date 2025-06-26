/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/pos.actions.ts
'use server';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

// Aksi untuk mengambil data awal yang dibutuhkan halaman POS
export async function getPosData() {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } }, // Hanya ambil produk yang stoknya ada
      orderBy: { name: 'asc' },
    });
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    return { products, customers };
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

// Aksi untuk memproses transaksi penjualan
export async function processSale(
  cartItems: CartItem[], 
  customerId: string, 
  totalAmount: number, 
  paymentMethod: string
) {
  // 3. Dapatkan sesi pengguna saat ini di server
  const session = await getServerSession(authOptions);

  // 4. Lakukan pengecekan jika tidak ada sesi (pengguna tidak login)
  if (!session || !session.user?.id) {
    return { error: 'Akses ditolak. Anda harus login.' };
  }
  if (cartItems.length === 0) {
    return { error: 'Keranjang belanja kosong.' };
  }
  if (!customerId) {
    return { error: 'Pelanggan belum dipilih.' };
  }

  try {
    // Gunakan transaksi untuk memastikan semua operasi berhasil atau gagal bersamaan
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Buat catatan Penjualan (Sale) utama
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          customerId,
          userId: session.user.id, // GANTI INI DENGAN ID USER YANG LOGIN - SEMENTARA COPY PASTE
          paymentMethod: paymentMethod as any,
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

      return newSale;
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard'); // Revalidasi dashboard juga
    return { success: `Transaksi berhasil! ID Nota: ${sale.invoiceNumber}` };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memproses transaksi.' };
  }
}
