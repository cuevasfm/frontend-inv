import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const QuickStockDialog = ({ open, onClose, onSave, product }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      stockToAdd: 0,
      purchasePrice: '',
      retailPrice: '',
      wholesalePrice: ''
    }
  });

  // Actualizar valores del formulario cuando cambie el producto
  useEffect(() => {
    if (product && open) {
      reset({
        stockToAdd: 0,
        purchasePrice: product.purchasePrice || '',
        retailPrice: product.retailPrice || '',
        wholesalePrice: product.wholesalePrice || ''
      });
    }
  }, [product, open, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = {
        purchasePrice: parseFloat(data.purchasePrice),
        retailPrice: parseFloat(data.retailPrice),
        wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null,
        currentStock: product.currentStock + parseInt(data.stockToAdd)
      };

      await onSave(updateData);
      reset();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al actualizar producto',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Actualizar Inventario y Precios
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Código de barras: {product.barcode}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                label={`Stock actual: ${product.currentStock}`}
                color="primary"
                size="small"
              />
              {product.category && (
                <Chip
                  label={product.category.name}
                  variant="outlined"
                  size="small"
                />
              )}
              {product.brand && (
                <Chip
                  label={product.brand.name}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Cantidad a agregar */}
            <Grid item xs={12}>
              <Controller
                name="stockToAdd"
                control={control}
                rules={{
                  required: 'Cantidad es requerida',
                  min: { value: 1, message: 'Debe agregar al menos 1 unidad' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cantidad a agregar al inventario"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.stockToAdd}
                    helperText={errors.stockToAdd?.message}
                  />
                )}
              />
            </Grid>

            {/* Precios */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{
                  required: 'Precio de compra es requerido',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio de Compra"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="retailPrice"
                control={control}
                rules={{
                  required: 'Precio de venta es requerido',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio de Venta"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                    error={!!errors.retailPrice}
                    helperText={errors.retailPrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="wholesalePrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio Mayoreo"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'primary.light',
                  borderRadius: 1,
                  color: 'primary.contrastText'
                }}
              >
                <Typography variant="body2">
                  <strong>Stock nuevo:</strong> {product.currentStock} + {watch('stockToAdd') || 0} = <strong>{product.currentStock + (parseInt(watch('stockToAdd')) || 0)}</strong> unidades
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Actualizar Inventario'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuickStockDialog;
