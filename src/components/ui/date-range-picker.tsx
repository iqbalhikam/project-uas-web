// components/ui/date-range-picker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function DateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ambil tanggal dari URL atau set default
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const defaultFrom = fromParam ? new Date(fromParam) : new Date(new Date().setDate(new Date().getDate() - 30));
  const defaultTo = toParam ? new Date(toParam) : new Date();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });

  // Fungsi untuk update URL saat tanggal berubah
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from && newDate?.to) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      current.set('from', newDate.from.toISOString());
      current.set('to', newDate.to.toISOString());

      const search = current.toString();
      const query = search ? `?${search}` : '';

      router.push(`${pathname}${query}`);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={'outline'} className={cn('w-[300px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd LLL, y', { locale: id })} - {format(date.to, 'dd LLL, y', { locale: id })}
                </>
              ) : (
                format(date.from, 'dd LLL, y', { locale: id })
              )
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={handleDateChange} numberOfMonths={2} locale={id} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
