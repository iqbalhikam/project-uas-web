


'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '../auth';
import { getActivePromotions } from './promotion.actions';
import { PaymentMethod } from '@prisma/client';


export async function getPosData() {
  try {
    
    const [productsData, promotionsData] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { name: 'asc' },
        include: { category: true }, 
      }),
      getActivePromotions(),
    ]);

    return { products: productsData, promotions: promotionsData.promotions || [] };
  } catch {
    return { error: 'Gagal memuat data untuk POS.' };
  }
}


type CartItem = {
  
  id: string;
  name: string;
  price: number;
  quantity: number;
};



export async function processSale(cartItems: CartItem[], customerId: string, totalAmount: number, paymentMethod: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return { error: 'Akses ditolak. Anda harus login.' };
  }
  if (cartItems.length === 0) {
    return { error: 'Keranjang belanja kosong.' };
  }

  try {

    
    const sale = await prisma.$transaction(async (tx) => {
      
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { stock: true, name: true },
        });

        if (!product || product.stock < item.quantity) {
          
          throw new Error(`Stok untuk produk "${product?.name || item.name}" tidak mencukupi. Sisa stok: ${product?.stock || 0}.`);
        }
      }

      
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          userId: session.user.id,
          paymentMethod: paymentMethod as PaymentMethod, 
        },
      });

      
      const saleItemsData = cartItems.map((item) => ({
        saleId: newSale.id,
        productId: item.id,
        quantity: item.quantity,
        priceAtSale: item.price,
      }));

      
      await tx.saleItem.createMany({
        data: saleItemsData,
      });

      
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      
      for (const item of cartItems) {
        await tx.stockMovement.create({
          data: {
            productId: item.id,
            type: 'SALE',
            quantityChange: -item.quantity, 
            saleId: newSale.id,
          },
        });
      }

      return newSale;
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: `Transaksi berhasil! ID Nota: ${sale.invoiceNumber.substring(0, 8)}` };
  } catch (error) {
    console.error(error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Gagal memproses transaksi.' };
  }
}