
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` akan memperkaya `req` dengan token pengguna.
  function middleware(req) {
    const { token } = req.nextauth;

    // Cek jika pengguna mencoba mengakses rute admin (/dashboard/users)
    if (req.nextUrl.pathname.startsWith('/dashboard/users')) {
      // Jika role bukan ADMIN, alihkan ke halaman utama dashboard
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      // Callback ini untuk menentukan apakah pengguna diizinkan mengakses (authorized)
      authorized: ({ token }) => !!token, // Pengguna dianggap ter-otorisasi jika ada token (sudah login)
    },
  }
);

// Tentukan rute yang ingin dilindungi oleh middleware ini
export const config = {
  matcher: ['/dashboard/:path*'],
};