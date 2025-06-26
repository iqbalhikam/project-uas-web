// src/middleware.ts

// Baris ini mendelegasikan semua pekerjaan ke NextAuth
export { default } from 'next-auth/middleware';

// Baris ini tetap sama, untuk menentukan rute yang dilindungi
export const config = {
  matcher: ['/dashboard/:path*'],
};
