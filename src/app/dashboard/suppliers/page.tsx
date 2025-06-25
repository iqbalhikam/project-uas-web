// app/dashboard/suppliers/page.tsx

import { getSuppliers } from '@/lib/actions/supplier.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupplierActions } from '@/components/suppliers/SupplierActions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function SuppliersPage() {
  const { suppliers, error } = await getSuppliers();

  if (error || !suppliers) {
    return <div className="p-8 text-red-500">{error || 'Gagal memuat data.'}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Supplier</CardTitle>
          <SupplierActions />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Supplier</TableHead>
                  <TableHead>Kontak Person</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{format(supplier.createdAt, 'dd MMMM yyyy', { locale: id })}</TableCell>
                      <TableCell className="text-right">
                        <SupplierActions supplier={supplier} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Belum ada data supplier.
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
