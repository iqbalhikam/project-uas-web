/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/actions/supplier.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SupplierSchema } from '@/lib/schemas/supplier.schema';
import { verifyAdmin } from '../auth-utils';

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { suppliers };
  } catch (error) {
    return { error: 'Gagal memuat data supplier.' };
  }
}

export async function createSupplier(formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck.error;
  const validatedFields = SupplierSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Data tidak valid.' };
  }

  try {
    await prisma.supplier.create({ data: validatedFields.data });
    revalidatePath('/dashboard/suppliers');
    return { message: 'Supplier berhasil ditambahkan.' };
  } catch (error) {
    return { error: 'Gagal menambahkan supplier.' };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) return adminCheck.error;
  const validatedFields = SupplierSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Data tidak valid.' };
  }

  try {
    await prisma.supplier.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath('/dashboard/suppliers');
    return { message: 'Supplier berhasil diperbarui.' };
  } catch (error) {
    return { error: 'Gagal memperbarui supplier.' };
  }
}

export async function deleteSupplier(id: string) {
  const adminCheck = await verifyAdmin();
    if (adminCheck.error) return adminCheck.error;
  try {
    await prisma.supplier.delete({ where: { id } });
    revalidatePath('/dashboard/suppliers');
    return { message: 'Supplier berhasil dihapus.' };
  } catch (error) {
    return { error: 'Gagal menghapus supplier.' };
  }
}
