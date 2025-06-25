// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Deklarasikan variabel global untuk menampung instance prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Buat satu instance PrismaClient yang akan di-share
// Cek jika kita berada di environment production, buat instance baru.
// Jika di development, cek dulu apakah instance sudah ada di variabel global.
// Jika belum ada, baru buat. Ini mencegah pembuatan koneksi berulang kali saat hot-reload.
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
