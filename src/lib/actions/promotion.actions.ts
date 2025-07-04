// src/lib/actions/promotion.actions.ts

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '../auth-utils';
import { PromotionSchema } from '../schemas/promotion.schema';

// Mengambil semua promosi
export async function getPromotions() {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        category: true, // Sertakan info kategori jika ada
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Menambahkan status dinamis pada setiap promosi
    const promotionsWithDynamicStatus = promotions.map((promo) => {
      const currentDate = new Date();
      const endDate = new Date(promo.endDate);
      const isDateActive = endDate >= currentDate;

      return {
        ...promo,
        // Properti baru untuk status yang dinamis
        isDynamicallyActive: promo.isActive && isDateActive,
      };
    });

    return { promotions: promotionsWithDynamicStatus };
  } catch {
    return { success: false, message: 'Gagal memuat data promosi.' };
  }
}

// Membuat promosi baru
export async function createPromotion(formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) {
    return { success: false, message: adminCheck.error };
  }

  const validatedFields = PromotionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const data = {
    ...validatedFields.data,
    startDate: new Date(validatedFields.data.startDate),
    endDate: new Date(validatedFields.data.endDate),
  };

  try {
    await prisma.promotion.create({ data });
    revalidatePath('/dashboard/promotions');
    return { success: true, message: 'Promosi berhasil ditambahkan.' };
  } catch {
    return { success: false, message: 'Gagal menambahkan promosi.' };
  }
}

// Memperbarui promosi
export async function updatePromotion(id: string, formData: FormData) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) {
    return { success: false, message: adminCheck.error };
  }

  const validatedFields = PromotionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const data = {
    ...validatedFields.data,
    startDate: new Date(validatedFields.data.startDate),
    endDate: new Date(validatedFields.data.endDate),
  };

  try {
    await prisma.promotion.update({ where: { id }, data });
    revalidatePath('/dashboard/promotions');
    return { success: true, message: 'Promosi berhasil diperbarui.' };
  } catch {
    return { success: false, message: 'Gagal memperbarui promosi.' };
  }
}

// Menghapus promosi
export async function deletePromotion(id: string) {
  const adminCheck = await verifyAdmin();
  if (adminCheck.error) {
    return { success: false, message: adminCheck.error };
  }

  try {
    await prisma.promotion.delete({ where: { id } });
    revalidatePath('/dashboard/promotions');
    return { success: true, message: 'Promosi berhasil dihapus.' };
  } catch {
    return { success: false, message: 'Gagal menghapus promosi.' };
  }
}
