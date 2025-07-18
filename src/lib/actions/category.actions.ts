'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CategorySchema } from '@/lib/schemas/category.schema';
import { verifyAdmin } from '../auth-utils';

export async function getCategories(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [categories, totalCategories] = await prisma.$transaction([
      prisma.category.findMany({
        skip: skip,
        take: limit, 
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.category.count(), 
    ]);
    return { categories, totalCategories };
  } catch {
    return { error: 'Gagal memuat kategori' };
  }
}

export async function createCategory(formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck.error;
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const existingCategory = await prisma.category.findFirst({
      where: { name: validatedFields.data.name },
    });

    if (existingCategory) {
      return { error: 'Kategori dengan nama ini sudah ada.' };
    }

    await prisma.category.create({
      data: validatedFields.data,
    });

    revalidatePath('/dashboard/categories');
    return { message: 'Kategori berhasil ditambahkan.' };
  } catch {
    return { error: 'Gagal menambahkan kategori.' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck.error;
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath('/dashboard/categories');
    return { message: 'Kategori berhasil diperbarui.' };
  } catch {
    return { error: 'Gagal memperbarui kategori.' };
  }
}

export async function deleteCategory(id: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck;
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath('/dashboard/categories');
    return { message: 'Kategori berhasil dihapus.' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return { error: 'Tidak bisa menghapus kategori ini karena masih digunakan oleh produk.' };
    }
    return { error: 'Gagal menghapus kategori.' };
  }
}
