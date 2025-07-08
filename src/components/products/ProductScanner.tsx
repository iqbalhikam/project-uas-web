'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';


const CameraScanner = dynamic(() => import('@/components/scanner/CameraScanner'), {
  ssr: false,
});

interface ProductScannerProps {
  onScan: (sku: string) => void;
}

export function ProductScanner({ onScan }: ProductScannerProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  
  
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScanSuccess = useCallback(
    (sku: string) => {
      onScan(sku);
      setIsScannerOpen(false);
    },
    [onScan]
  );

  const handleClose = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  
  
  if (!isClient) {
    return (
      <Button type="button" variant="outline" size="icon" className="p-2" disabled>
        <ScanLine className="h-4 w-4" />
      </Button>
    );
  }

  
  return (
    <>
      <Button type="button" onClick={() => setIsScannerOpen(true)} variant="outline" size="icon" className="p-2" aria-label="Buka pemindai barcode">
        <ScanLine className="h-4 w-4" />
      </Button>

      {/* Kita tidak lagi menggunakan createPortal untuk sementara waktu untuk menyederhanakan.
          Error mungkin juga berasal dari sana. */}
      {isScannerOpen && <CameraScanner onScanSuccess={handleScanSuccess} onClose={handleClose} />}
    </>
  );
}
