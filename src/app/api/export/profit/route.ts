// src/app/api/export/profit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getProfitReport } from '@/lib/actions/report.actions';

// Memastikan route ini selalu dinamis dan tidak di-cache
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const toDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

    if (!fromDate || !toDate) {
      return NextResponse.json({ message: 'Rentang tanggal wajib diisi' }, { status: 400 });
    }

    const report = await getProfitReport(fromDate, toDate);

    if (report.error || !report.details) {
      return NextResponse.json({ message: report.error || 'Gagal membuat laporan' }, { status: 500 });
    }

    // --- PERSIAPAN DATA ---

    const worksheetData = [
      ['Laporan Laba Rugi'],
      [`Periode: ${fromDate.toLocaleDateString('id-ID', { dateStyle: 'long' })} - ${toDate.toLocaleDateString('id-ID', { dateStyle: 'long' })}`],
      [],
      ['Ringkasan Utama'],
      ['Total Pendapatan', report.totalRevenue],
      ['Total Modal (HPP)', report.totalCostOfGoods],
      ['Laba Kotor', report.totalProfit],
      [],
      ['Rincian Laba per Produk'],
      ['Nama Produk', 'Jumlah Terjual', 'Pendapatan', 'Modal', 'Laba'],
    ];

    let totalQty = 0;
    report.details.forEach((item) => {
      worksheetData.push([item.productName, item.quantitySold, item.totalRevenue, item.totalCost, item.totalProfit]);
      totalQty += item.quantitySold;
    });

    worksheetData.push([]); // Baris pemisah
    worksheetData.push(['TOTAL', totalQty, report.totalRevenue, report.totalCostOfGoods, report.totalProfit]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const lastRow = worksheetData.length;

    // --- APLIKASI GAYA DAN FORMAT (METODE ANDAL) ---

    // Format mata uang standar
    const currencyFormat = '"Rp"#,##0_);[Red]-"Rp"#,##0';
    // Format mata uang hijau untuk nilai positif (laba)
    const profitFormat = '[Green]"Rp"#,##0_);[Red]-"Rp"#,##0';

    // Terapkan format pada ringkasan
    worksheet['B5'].z = currencyFormat;
    worksheet['B6'].z = currencyFormat;
    worksheet['B7'].z = profitFormat;

    // Terapkan format pada rincian data
    for (let i = 11; i < lastRow - 1; i++) {
      worksheet[`C${i}`].z = currencyFormat; // Pendapatan
      worksheet[`D${i}`].z = currencyFormat; // Modal
      worksheet[`E${i}`].z = profitFormat; // Laba
    }

    // Terapkan format pada baris TOTAL
    worksheet[`C${lastRow}`].z = currencyFormat;
    worksheet[`D${lastRow}`].z = currencyFormat;
    worksheet[`E${lastRow}`].z = profitFormat;

    // Atur lebar kolom
    worksheet['!cols'] = [{ wch: 45 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    // Gabungkan sel untuk judul
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 4 } },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Laba');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Laporan_Laba_Rugi_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Gagal mengekspor data' }, { status: 500 });
  }
}
