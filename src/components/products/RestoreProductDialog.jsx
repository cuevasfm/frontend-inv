import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { RestoreFromTrash as RestoreIcon } from '@mui/icons-material';

const RestoreProductDialog = ({ open, onClose, product, onRestore }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestoreIcon color="primary" />
        Producto Eliminado Encontrado
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Ya existe un producto eliminado con este código de barras
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Código de Barras:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {product.barcode}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Nombre:
          </Typography>
          <Typography variant="body1">
            {product.name}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            SKU:
          </Typography>
          <Typography variant="body1">
            {product.sku}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Stock Actual:
          </Typography>
          <Typography variant="body1">
            {product.currentStock} unidades
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          ¿Deseas restaurar este producto y ajustar su inventario?
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => onRestore(product)}
          variant="contained"
          startIcon={<RestoreIcon />}
        >
          Restaurar Producto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreProductDialog;

