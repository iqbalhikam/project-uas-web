/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/report.actions.ts
'use server';

import prisma from '@/lib/prisma';

const getSalesByDateRange = async(from: Date, to: Date) => {
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


const getProfitReport = async(from: Date, to: Date) => {
  try {
    // Ambil semua item penjualan dalam rentang tanggal,
    // termasuk data produk untuk mendapatkan harga beli (modal)
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          saleDate: {
            gte: from,
            lte: to,
          },
        },
      },
      include: {
        product: {
          select: {
            name: true,
            purchasePrice: true, // Ambil harga beli (modal)
          },
        },
      },
    });

    // Proses data untuk kalkulasi
    let totalRevenue = 0; // Total Pendapatan
    let totalCostOfGoods = 0; // Total Modal (HPP)

    const profitDetails = saleItems.map((item) => {
      const revenue = item.priceAtSale * item.quantity;
      const cost = item.product.purchasePrice * item.quantity;
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCostOfGoods += cost;

      return {
        productName: item.product.name,
        quantitySold: item.quantity,
        totalRevenue: revenue,
        totalCost: cost,
        totalProfit: profit,
      };
    });

    const totalProfit = totalRevenue - totalCostOfGoods;

    return {
      totalRevenue,
      totalCostOfGoods,
      totalProfit,
      details: profitDetails,
    };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memuat laporan laba.' };
  }
}

export { 
  getSalesByDateRange, 
  getProfitReport 
};