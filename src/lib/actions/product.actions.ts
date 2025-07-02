/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import ProductSchema from '../schemas/product.schema';
import { verifyAdmin } from '../auth-utils';

// Skema validasi menggunakan Zod

export async function getProducts(page = 1, limit = 10) {
  // Tambahkan parameter page & limit
  try {
    const skip = (page - 1) * limit; // Hitung data yang akan dilewati

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        skip: skip,
        take: limit, // Batasi jumlah data yang diambil
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count(), // Hitung total produk untuk paginasi
    ]);

    return { products, totalProducts };
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
  const adminCheck = await verifyAdmin();
    if (adminCheck.error) return adminCheck;
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
    // Cek jika error disebabkan oleh relasi data (foreign key constraint)
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return { error: 'Gagal: Produk ini sudah digunakan dalam transaksi penjualan.' };
    }
    // Error umum lainnya
    return { error: 'Gagal menghapus produk, data sudah digunakan di laporan penjualan' };
  }
}