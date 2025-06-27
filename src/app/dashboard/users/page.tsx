// src/app/dashboard/users/page.tsx (UPDATED)

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserActions } from '@/components/users/UserActions'; // <-- IMPORT BARU

// Fungsi untuk mengambil data pengguna dari database
async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { users };
  } catch (error) {
    console.error(error);
    return { error: 'Gagal memuat data pengguna.' };
  }
}

export default async function UsersPage() {
  const { users, error } = await getUsers();

  if (error || !users) {
    return <div className="p-8 text-red-500">{error || 'Gagal memuat data.'}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Pengguna</CardTitle>
          {/* Tambahkan komponen Aksi (Tombol Tambah) di sini */}
          <UserActions />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{format(user.createdAt, 'dd MMMM yyyy', { locale: id })}</TableCell>
                      <TableCell className="text-right">
                        {/* Tambahkan komponen Aksi (Edit/Hapus) per baris */}
                        <UserActions user={user} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Belum ada data pengguna.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
