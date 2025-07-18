'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users, BarChart, Tag, Truck, ShoppingBag, AreaChart, Trophy, ClipboardCheck, PercentCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './UserNav';
import { useSession } from 'next-auth/react';


const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/pos', label: 'Kasir', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/products', label: 'Produk', icon: Package, roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/categories', label: 'Kategori', icon: Tag, roles: ['ADMIN'] },
  { href: '/dashboard/promotions', label: 'Promosi', icon: PercentCircle, roles: ['ADMIN'] },
  { href: '/dashboard/suppliers', label: 'Supplier', icon: Truck, roles: ['ADMIN'] },
  { href: '/dashboard/purchases', label: 'Order Pembelian', icon: ShoppingBag, roles: ['ADMIN'] },
  { href: '/dashboard/stock-adjustments', label: 'Stok Opname', icon: ClipboardCheck, roles: ['ADMIN'] },
  { href: '/dashboard/users', label: 'Pengguna', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/reports/sales', label: 'Laporan Penjualan', icon: BarChart, roles: ['ADMIN'] },
  { href: '/dashboard/reports/profit', label: 'Laporan Laba', icon: AreaChart, roles: ['ADMIN'] },
  { href: '/dashboard/reports/bestsellers', label: 'Produk Terlaris', icon: Trophy, roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen: boolean; 
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const{data : session} = useSession();
  const userRole = session?.user.role;
  const navItems = allNavItems.filter(item => item.roles.includes(userRole || ''));

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-20 w-64 bg-sidebar border-r p-4 flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full' 
      )}>
      <div className="flex gap-2">
        <h1 className="text-2xl font-bold mb-8">KasirPintar </h1>
        <div className=" flex justify-end w-full h-fit">
          <UserNav />
        </div>
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
