import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ open, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false); // Para evitar múltiples escaneos
  const lastScannedRef = useRef(''); // Para evitar duplicados

  useEffect(() => {
    if (open && !scanning) {
      // Resetear flags al abrir
      isProcessingRef.current = false;
      lastScannedRef.current = '';
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const checkCameraPermissions = async () => {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      // Solicitar permisos explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      console.error('Error checking camera permissions:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Permiso de cámara denegado. Ve a la configuración de tu navegador y permite el acceso a la cámara para este sitio.');
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

      // Verificar y solicitar permisos primero
      await checkCameraPermissions();

      // Crear instancia del escáner
      html5QrCodeRef.current = new Html5Qrcode('barcode-reader');

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // Todos los tipos de códigos
      };

      // Iniciar escaneo
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        config,
        (decodedText, decodedResult) => {
          // Evitar múltiples escaneos del mismo código
          if (isProcessingRef.current) {
            return; // Ya estamos procesando un código
          }

          // Evitar duplicados inmediatos
          if (lastScannedRef.current === decodedText) {
            return;
          }

          // Marcar como procesando
          isProcessingRef.current = true;
          lastScannedRef.current = decodedText;

          console.log('Código escaneado:', decodedText);

          // Detener el escáner inmediatamente
          stopScanning().then(() => {
            // Llamar al callback después de detener
            onScan(decodedText);
            onClose();
          });
        },
        (errorMessage) => {
          // Error al escanear (normal mientras busca código)
          // No mostrar estos errores
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'No se pudo acceder a la cámara. Verifica los permisos.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (scanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    
    // Resetear flags
    isProcessingRef.current = false;
    lastScannedRef.current = '';
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Escanear Código de Barras</DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Coloca el código de barras frente a la cámara
          </Typography>

          {/* Contenedor del escáner */}
          <Box
            id="barcode-reader"
            sx={{
              width: '100%',
              maxWidth: 400,
              margin: '0 auto',
              border: '2px solid #1976d2',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;
