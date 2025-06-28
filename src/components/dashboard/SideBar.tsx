// src/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users, BarChart, Tag, Truck, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './UserNav';

// Daftar item navigasi
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/pos', label: 'POS', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/categories', label: 'Kategori', icon: Tag },
  { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck },
  { href: '/dashboard/purchases', label: 'Order Pembelian', icon: ShoppingBag },
  { href: '/dashboard/users', label: 'Pengguna', icon: Users },
  { href: '/dashboard/reports/sales', label: 'Laporan', icon: BarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r p-4 flex-col hidden md:flex">
      <div className='flex gap-2'>
        <UserNav />
        <h1 className="text-2xl font-bold mb-8">KasirApp </h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
              )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
