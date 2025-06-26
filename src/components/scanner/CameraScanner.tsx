// components/scanner/CameraScanner.tsx
'use client';

import React, { useEffect, useRef } from 'react';
// LANGKAH 1: Hapus IScannerControls dari import
import { BrowserMultiFormatReader } from '@zxing/library';
import { toast } from 'sonner';

interface CameraScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // LANGKAH 2: Ubah tipe Ref menjadi lebih sederhana atau biarkan any.
  // Di sini kita definisikan hanya interface yang kita butuhkan, yaitu objek dengan method stop().
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const codeReader = new BrowserMultiFormatReader();

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();

        toast.info('Arahkan kamera ke barcode...');

        // LANGKAH 3: Hapus anotasi tipe dari argumen 'controls'
        codeReader
          .decodeContinuously(videoElement, (result, err) => {
            if (result) {
              controlsRef.current?.stop();
              onScanSuccess(result.getText());
              toast.success(`Barcode terdeteksi: ${result.getText()}`);
              onClose();
            }
            if (err && err.name !== 'NotFoundException') {
              console.error('Error saat scanning:', err);
              toast.error('Terjadi error saat memindai.');
            }
          })
      })
      .catch((err) => {
        console.error('Gagal mengakses kamera:', err);
        toast.error('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.');
        onClose();
      });

    return () => {
      controlsRef.current?.stop();
    };
  }, [onScanSuccess, onClose]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
        <p style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Arahkan Kamera ke Barcode</p>
        <video ref={videoRef} style={{ width: '100%', border: '2px solid white', borderRadius: '8px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '-40px', right: '0', color: 'white', background: 'transparent', fontSize: '2rem', border: 'none', cursor: 'pointer' }}>
          &times;
        </button>
      </div>
    </div>
  );
}
