
'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, QrcodeErrorCallback, QrcodeSuccessCallback } from 'html5-qrcode';
import { toast } from 'sonner';


interface CameraScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}
const qrcodeRegionId = 'html5-qrcode-reader';

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const hasScannedRef = useRef(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const successCallback: QrcodeSuccessCallback = (decodedText) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;
      toast.success('Barcode berhasil dipindai!');
      onScanSuccess(decodedText);
      onClose();
      scannerRef.current?.clear();
      
    };

    const errorCallback: QrcodeErrorCallback = () => {
      
    };

    
    const config = {
      
      fps: 30,

      
      qrbox: () => {
        
        
        
        return {
          width: 300,
          height: 300,
        };
      },

      rememberLastUsedCamera: true,
      supportedScanTypes: [
      ],

      
      disableFlip: true,

      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 300 },
        height: { ideal: 300 },
        advanced: [{ focusMode: 'continuous' }],
      },
    } as never;

    
    try {
      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      scannerRef.current.render(successCallback, errorCallback);
    } catch (err) {
      console.error('Gagal memulai Html5QrcodeScanner:', err);
      toast.error('Gagal memulai kamera. Pastikan izin telah diberikan.');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Gagal membersihkan scanner.', error);
        });
      }
      hasScannedRef.current = false;
    };
  }, [onScanSuccess, onClose]);

  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '90%', maxWidth: '600px', background: 'white', padding: '20px', borderRadius: '8px' }}>
        <p style={{ color: 'black', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>Arahkan Kamera ke QR Code</p>
        <div id={qrcodeRegionId} style={{ minHeight: '250px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '-5px', right: '10px', color: 'black', background: 'transparent', fontSize: '2.5rem', border: 'none', cursor: 'pointer' }}>
          &times;
        </button>
      </div>
    </div>
  );
}
