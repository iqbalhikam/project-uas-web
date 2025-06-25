/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import ProductSchema from '../schemas/product.schema';

// Skema validasi menggunakan Zod

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { products };
  } catch (error) {
    return { error: 'Gagal memuat produk' };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany();
    return { categories };
  } catch (error) {
    return { error: 'Gagal memuat kategori' };
  }
}

export async function createProduct(formData: FormData) {
  const validatedFields = ProductSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.create({
      data: validatedFields.data,
    });
    revalidatePath('/dashboard/products'); // Refresh data di halaman produk
    return { message: 'Produk berhasil ditambahkan' };
  } catch (error) {
    return { error: 'Gagal menambahkan produk' };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const validatedFields = ProductSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath('/dashboard/products');
    return { message: 'Produk berhasil diperbarui' };
  } catch (error) {
    return { error: 'Gagal memperbarui produk' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/dashboard/products');
    return { message: 'Produk berhasil dihapus' };
  } catch (error) {
    return { error: 'Gagal menghapus produk.' };
  }
}
