// src/components/scanner/CameraScanner.tsx
'use client';

// Impor useRef dan useEffect
import React, { useRef, useEffect } from 'react';
import { useZxing } from 'react-zxing';
// import { Result } from '@zxing/library';
import { toast } from 'sonner';

interface CameraScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  // 1. Buat sebuah "kunci" menggunakan useRef. Default-nya 'false' (belum scan).
  const hasScannedRef = useRef(false);

  const { ref } = useZxing({
    constraints: { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
    timeBetweenDecodingAttempts: 100,
    onDecodeResult(result) {
      // 2. Sebelum melakukan apapun, cek apakah kuncinya sudah aktif.
      // Jika ya, langsung hentikan fungsi.
      if (hasScannedRef.current) {
        return;
      }

      // 3. Jika belum, SEGERA aktifkan kuncinya.
      // Perubahan ref terjadi seketika.
      hasScannedRef.current = true;

      // 4. Baru jalankan logika sukses Anda.
      // Dijamin bagian ini hanya akan berjalan SATU KALI per sesi scanner.
      const scanResult = result.getText();
      toast.success('Barcode berhasil dipindai!');
      onScanSuccess(scanResult);
    },

    onError(error: unknown) {
      if (hasScannedRef.current) {
        return; // Abaikan error jika sudah berhasil scan
      }
      if (error instanceof Error) {
        if (error.name !== 'NotFoundException') {
          console.error('Terjadi error tak terduga saat memindai:', error);
          toast.error(`Error: ${error.message}`);
        }
      } else {
        console.error('Terjadi error yang tidak diketahui:', error);
        toast.error('Terjadi error yang tidak diketahui.');
      }
    },
  });

  // 5. [PENTING] Pastikan kunci di-reset saat komponen ditutup/di-unmount.
  // Ini agar saat scanner dibuka lagi di lain waktu, ia siap untuk scan baru.
  useEffect(() => {
    return () => {
      hasScannedRef.current = false;
    };
  }, []); // Array dependensi kosong agar cleanup ini hanya berjalan saat unmount.

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
        <p style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Arahkan Kamera ke Barcode</p>
        <video ref={ref} style={{ width: '100%', border: '2px solid white', borderRadius: '8px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '-40px', right: '0', color: 'white', background: 'transparent', fontSize: '2rem', border: 'none', cursor: 'pointer' }}>
          &times;
        </button>
      </div>
    </div>
  );
}
