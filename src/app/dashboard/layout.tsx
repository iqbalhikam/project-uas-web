// src/app/dashboard/layout.tsx

import { Sidebar } from '@/components/dashboard/SideBar'; // Komponen yang akan kita buat
// import { UserNav } from '@/components/dashboard/UserNav';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
        <UserNav />
      </header> */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
