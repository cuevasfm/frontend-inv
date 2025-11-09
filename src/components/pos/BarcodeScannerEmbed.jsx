import { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScannerEmbed = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    startScanning();

    return () => {
      mountedRef.current = false;
      stopScanning();
    };
  }, []);

  const checkCameraPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Error checking camera permissions:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Permiso de cámara denegado. Ve a la configuración de tu navegador y permite el acceso a la cámara.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No se encontró ninguna cámara en tu dispositivo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('La cámara está siendo usada por otra aplicación.');
      } else {
        throw new Error(err.message || 'No se pudo acceder a la cámara.');
      }
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      isProcessingRef.current = false;
      lastScannedRef.current = '';

      // Verificar permisos
      await checkCameraPermissions();

      if (!mountedRef.current) return;

      // Crear instancia del escáner
      html5QrCodeRef.current = new Html5Qrcode('barcode-reader-embed');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (isProcessingRef.current || !mountedRef.current) return;
          if (lastScannedRef.current === decodedText) return;

          isProcessingRef.current = true;
          lastScannedRef.current = decodedText;

          console.log('Código escaneado:', decodedText);

          // Detener y notificar
          stopScanning().then(() => {
            if (mountedRef.current && onScan) {
              onScan(decodedText);
            }
          });
        },
        () => {
          // Errores normales de escaneo, ignorar
        }
      );

      if (mountedRef.current) {
        setScanning(true);
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorMsg = err.message || 'No se pudo acceder a la cámara. Verifica los permisos.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
    isProcessingRef.current = false;
    lastScannedRef.current = '';
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!error && !scanning && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Iniciando cámara...
          </Typography>
        </Box>
      )}

      {/* Contenedor del escáner */}
      <Box
        id="barcode-reader-embed"
        sx={{
          width: '100%',
          minHeight: 300,
          margin: '0 auto',
          border: scanning ? '2px solid #1976d2' : 'none',
          borderRadius: 1,
          overflow: 'hidden',
          '& video': {
            width: '100%',
            height: 'auto'
          }
        }}
      />
    </Box>
  );
};

export default BarcodeScannerEmbed;

