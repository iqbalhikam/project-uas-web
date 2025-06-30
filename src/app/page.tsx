// Lokasi: src/app/page.tsx

import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// PENTING: Impor authOptions dari lokasi yang benar

export default async function RootPage() {
  // 1. Dapatkan sesi pengguna di sisi server menggunakan NextAuth.js
  //    Fungsi ini secara aman memeriksa cookie yang diatur oleh NextAuth.js
  const session = await getServerSession(authOptions);

  // 2. Terapkan logika redirect berdasarkan ada atau tidaknya sesi
  if (session) {
    // Jika objek 'session' ada, berarti pengguna sudah login.
    redirect('/dashboard');
  } else {
    // Jika 'session' bernilai null, pengguna belum login.
    redirect('/login');
  }

  // Kode ini tidak akan pernah dijangkau, tapi return null agar komponen valid
  return null;
}
