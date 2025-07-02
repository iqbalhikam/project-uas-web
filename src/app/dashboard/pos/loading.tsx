// src/app/dashboard/pos/loading.tsx

import { Skeleton } from '@/components/ui/skeleton';
import {  CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PosLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 bg-card rounded-lg shadow">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-[calc(100%-4.5rem)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg shadow flex flex-col">
        <CardHeader>
          <CardTitle>Keranjang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          </div>
        </CardContent>
        <div className="p-4 border-t mt-auto">
          <div className="flex justify-between font-bold text-lg mb-4">
            <Skeleton className="h-7 w-1/4" />
            <Skeleton className="h-7 w-1/3" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
