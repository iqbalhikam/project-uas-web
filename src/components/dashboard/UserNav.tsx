// src/components/dashboard/UserNav.tsx
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Kita perlu buat komponen Avatar
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  // Ambil inisial dari nama pengguna untuk fallback avatar
  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ">
            <Avatar className="h-10 w-10 hover:bg-blue-200 border shadow-2xl border-blue-950">
              {/* Jika ada gambar avatar, bisa ditampilkan di sini */}
              <AvatarImage src="https://api.dicebear.com/9.x/adventurer/svg?seed=Brooklynn&flip=true" alt="avatar" />
              <AvatarFallback>{initials || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Pengaturan</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>Keluar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
