/* eslint-disable @typescript-eslint/no-unused-vars */
// types/next-auth.d.ts

import { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Memperluas tipe 'Session' bawaan dari NextAuth
 * untuk menyertakan properti kustom kita (id dan role).
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user']; // <-- Gabungkan dengan tipe user bawaan
  }
}

/**
 * Memperluas tipe 'JWT' bawaan dari NextAuth
 * untuk menyertakan properti kustom kita.
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
