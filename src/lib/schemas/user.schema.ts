// src/lib/schemas/user.schema.ts

import { z } from 'zod';
import { Role } from '@prisma/client';

// Skema untuk membuat pengguna baru
export const UserCreateSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: 'Role harus dipilih' }),
    }),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'], // Tampilkan error di field konfirmasi password
  });

// Skema untuk memperbarui pengguna
// Password bersifat opsional di sini
export const UserUpdateSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: 'Role harus dipilih' }),
    }),
    // Buat password opsional, hanya jika diisi baru divalidasi
    password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
    confirmPassword: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

// Tipe data yang diambil dari skema
export type UserCreateFormData = z.infer<typeof UserCreateSchema>;
export type UserUpdateFormData = z.infer<typeof UserUpdateSchema>;
