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

  useEffect(() => {
    if (open && !scanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setError(null);

      // Crear instancia del escáner
      html5QrCodeRef.current = new Html5Qrcode('barcode-reader');

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      };

      // Iniciar escaneo
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        config,
        (decodedText, decodedResult) => {
          // Código escaneado exitosamente
          onScan(decodedText);
          stopScanning();
          onClose();
        },
        (errorMessage) => {
          // Error al escanear (normal mientras busca código)
          // No mostrar estos errores
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
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
