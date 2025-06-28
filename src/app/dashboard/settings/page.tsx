// src/app/dashboard/settings/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun dan preferensi Anda.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informasi ini akan ditampilkan secara publik.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Di sini Anda bisa menambahkan form untuk mengubah nama, email, atau password */}
          <p>Form untuk pengaturan profil akan ada di sini.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Di sini Anda bisa menambahkan opsi untuk mengganti tema (terang/gelap) */}
          <p>Opsi untuk tema (terang/gelap) akan ada di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
