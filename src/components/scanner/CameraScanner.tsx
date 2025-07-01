import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface CameraScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
}

const qrcodeRegionId = 'html5-qrcode-reader';

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const config = {
    fps: 25,
    qrbox: (vw: number, vh: number) => {
      const size = Math.max(100, Math.min(vw, vh) * 0.7); // minimal 100px
      return { width: size, height: size };
    },
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    disableFlip: true,
    formatsToSupport: [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.EAN_13, // Barcode produk ritel paling umum
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.CODE_128, // Barcode umum lainnya
    ],
  };
  useEffect(() => {
    const qrCode = new Html5Qrcode(qrcodeRegionId);
    html5QrCodeRef.current = qrCode;

    qrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          toast.success('Barcode berhasil dipindai!');
          qrCode.stop().then(() => {
            onScanSuccess(decodedText);
          });
        },
        () => {}
      )
      .catch((err) => {
        console.error('Error saat memulai scanner:', err);
        toast.error('Tidak bisa mengakses kamera');
      });

    return () => {
      qrCode
        .stop()
        .catch(() => {})
        .then(() => qrCode.clear());
      hasScannedRef.current = false;
    };
  }, [onScanSuccess]);

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
