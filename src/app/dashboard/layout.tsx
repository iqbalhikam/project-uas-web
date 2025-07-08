'use client';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/SideBar'; // Komponen yang akan kita buat
import { ReactNode, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);



  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && <div className="fixed inset-0 z-10 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div className="flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
