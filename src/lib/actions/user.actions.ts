/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/actions/user.actions.ts (UPDATED)
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserCreateSchema, UserUpdateSchema } from '@/lib/schemas/user.schema';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth'; // <-- Import getServerSession
import { authOptions } from '../auth';

// Fungsi helper untuk mendapatkan sesi dan mengecek role admin
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { error: 'Akses ditolak. Anda bukan admin.' };
  }
  return { session };
}

// Aksi untuk membuat pengguna baru
export async function createUser(formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck;

  const validatedFields = UserCreateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid. Silakan periksa kembali isian Anda.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, role, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'Email sudah digunakan.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, role, password: hashedPassword },
    });

    revalidatePath('/dashboard/users');
    return { message: 'Pengguna baru berhasil ditambahkan.' };
  } catch (error) {
    return { error: 'Gagal menambahkan pengguna.' };
  }
}

// Aksi untuk memperbarui pengguna
export async function updateUser(id: string, formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck;

  const validatedFields = UserUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, role, password } = validatedFields.data;

  try {
    const dataToUpdate: any = { name, email, role };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath('/dashboard/users');
    return { message: 'Data pengguna berhasil diperbarui.' };
  } catch (error) {
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
      return { error: 'Email sudah digunakan oleh pengguna lain.' };
    }
    return { error: 'Gagal memperbarui data pengguna.' };
  }
}

// Aksi untuk menghapus pengguna
export async function deleteUser(id: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck;

  // Tambahan: Mencegah admin menghapus dirinya sendiri
  if (id === adminCheck.session?.user.id) {
    return { error: 'Tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/dashboard/users');
    return { message: 'Pengguna berhasil dihapus.' };
  } catch (error) {
    return { error: 'Gagal menghapus pengguna.' };
  }
}
