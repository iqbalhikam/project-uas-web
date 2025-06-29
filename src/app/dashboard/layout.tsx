// src/app/dashboard/layout.tsx

import { Sidebar } from '@/components/dashboard/SideBar'; // Komponen yang akan kita buat
// import { UserNav } from '@/components/dashboard/UserNav';
// import { UserNav } from '@/components/dashboard/UserNav';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
