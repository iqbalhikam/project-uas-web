// src/components/users/UserForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Role } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createUser, updateUser } from '@/lib/actions/user.actions';
import { toast } from 'sonner';
import { UserCreateSchema, UserUpdateSchema } from '@/lib/schemas/user.schema';

interface UserFormProps {
  user?: User; // Opsional, untuk mode edit
  onClose: () => void;
}

// Tentukan skema berdasarkan apakah ini mode edit atau create
const getCorrectSchema = (isEditMode: boolean) => (isEditMode ? UserUpdateSchema : UserCreateSchema);

export function UserForm({ user, onClose }: UserFormProps) {
  const isEditMode = !!user;
  const formSchema = getCorrectSchema(isEditMode);

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || undefined,
      // Jangan set default value untuk password agar field kosong saat edit
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormData) => {
    const formData = new FormData();
    // Loop untuk mengisi formData, termasuk handle undefined/null values
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const promise = isEditMode ? updateUser(user.id, formData) : createUser(formData);

    toast.promise(promise, {
      loading: isEditMode ? 'Memperbarui pengguna...' : 'Menambahkan pengguna...',
      success: (res) => {
        if (res.error) throw new Error(res.error);
        onClose(); // Tutup dialog setelah berhasil
        if ("message" in res) {
          return res.message;
        }
      },
      error: (err) => err.message,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="cth: John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cth: john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role untuk pengguna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">{isEditMode ? 'Isi password hanya jika ingin mengubahnya.' : 'Password untuk login pengguna baru.'}</p>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
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