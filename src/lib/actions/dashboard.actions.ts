
'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    
    const [salesTodayData, totalRevenueData, productCount, lowStockProducts, recentSales] = await Promise.all([
      
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { saleDate: { gte: today } },
      }),
      
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
      }),
      
      prisma.product.count(),
      
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      
      prisma.sale.findMany({
        orderBy: { saleDate: 'desc' },
        take: 5,
        
      }),
    ]);

    return {
      salesToday: salesTodayData._sum.totalAmount || 0,
      totalRevenue: totalRevenueData._sum.totalAmount || 0,
      productCount,
      lowStockProducts,
      recentSales,
    };
  } catch (error) {
    console.error('Gagal memuat statistik dashboard:', error);
    return { error: 'Gagal memuat data dashboard.' };
  }
}
