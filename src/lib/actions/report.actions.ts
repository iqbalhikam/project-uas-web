/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/report.actions.ts
'use server';

import prisma from '@/lib/prisma';

export async function getSalesByDateRange(from: Date, to: Date) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: from, // gte: greater than or equal
          lte: to, // lte: less than or equal
        },
      },
      include: {
        customer: true, // Sertakan info pelanggan
        user: true, // Sertakan info kasir
        items: {
          include: {
            product: true, // Sertakan info produk di setiap item
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });
    return { sales };
  } catch (error) {
    return { error: 'Gagal memuat laporan penjualan.' };
  }
}
