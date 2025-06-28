// lib/actions/dashboard.actions.ts
'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set waktu ke awal hari

    // Menghitung beberapa statistik secara bersamaan menggunakan Promise.all
    const [salesTodayData, totalRevenueData, productCount, customerCount, lowStockProducts, recentSales] = await Promise.all([
      // 1. Total penjualan hari ini
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { saleDate: { gte: today } },
      }),
      // 2. Total pendapatan sepanjang waktu
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
      }),
      // 3. Jumlah total produk
      prisma.product.count(),
      // 4. Jumlah total pelanggan
      prisma.customer.count(),
      // 5. Produk dengan stok menipis (stok <= 10)
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      // 6. Penjualan terbaru
      prisma.sale.findMany({
        orderBy: { saleDate: 'desc' },
        take: 5,
        include: {
          customer: {
            select: {
              name: true, // Hanya ambil kolom 'name' dari customer
            },
          },
        },
      }),
    ]);

    return {
      salesToday: salesTodayData._sum.totalAmount || 0,
      totalRevenue: totalRevenueData._sum.totalAmount || 0,
      productCount,
      customerCount,
      lowStockProducts,
      recentSales,
    };
  } catch (error) {
    console.error('Gagal memuat statistik dashboard:', error);
    return { error: 'Gagal memuat data dashboard.' };
  }
}
