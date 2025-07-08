

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const toDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

    if (!fromDate || !toDate) {
      return NextResponse.json({ message: 'Rentang tanggal wajib diisi' }, { status: 400 });
    }

    const sales = await prisma.sale.findMany({
      where: { saleDate: { gte: fromDate, lte: toDate } },
      include: { items: { include: { product: true } } },
      orderBy: { saleDate: 'desc' },
    });

    
    const dataToExport = sales.flatMap((sale) =>
      sale.items.map((item) => ({
        'ID Nota': sale.invoiceNumber,
        Tanggal: sale.saleDate.toLocaleDateString('id-ID'),
        'SKU Produk': item.product.sku,
        'Nama Produk': item.product.name,
        Jumlah: item.quantity,
        'Harga Satuan': item.priceAtSale,
        Subtotal: item.quantity * item.priceAtSale,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="laporan_penjualan.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Gagal mengekspor data' }, { status: 500 });
  }
}
