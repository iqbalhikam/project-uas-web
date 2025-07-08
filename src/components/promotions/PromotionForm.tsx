'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Category, Promotion } from '@prisma/client';

import { PromotionFormData, PromotionSchema } from '@/lib/schemas/promotion.schema';
import { createPromotion, updatePromotion } from '@/lib/actions/promotion.actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PromotionFormProps {
  promotion?: Promotion;
  categories: Category[];
  onClose: () => void;
}

export function PromotionForm({ promotion, categories, onClose }: PromotionFormProps) {
  const isEditMode = !!promotion;
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(PromotionSchema),
    defaultValues: {
      description: promotion?.description || '',
      discountPercent: promotion?.discountPercent || 0,
      
      startDate: promotion ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      isActive: promotion?.isActive ?? true,
      categoryId: promotion?.categoryId || undefined,
    },
  });

  const onSubmit = async (values: PromotionFormData) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const promise = isEditMode ? updatePromotion(promotion.id, formData) : createPromotion(formData);
    toast.promise(promise, {
      loading: isEditMode ? 'Memperbarui promosi...' : 'Menambahkan promosi...',
      success: (res) => {
        if (!res.success) {
          console.error(res.errors);
        }
        onClose();
        return res.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Promosi</FormLabel>
              <FormControl>
                <Input placeholder="cth: Diskon Kemerdekaan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountPercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persentase Diskon (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="cth: 15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Mulai</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Selesai</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Target (Opsional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="All Categories">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
