import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const ProductTypeDialog = ({ open, onClose, onSave, productType }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      displayOrder: 0
    }
  });

  useEffect(() => {
    if (productType) {
      reset({
        name: productType.name || '',
        displayOrder: productType.displayOrder || 0
      });
    } else {
      reset({
        name: '',
        displayOrder: 0
      });
    }
  }, [productType, reset, open]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Generar code automáticamente desde el nombre
      const code = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales por guiones
        .replace(/-+/g, '-') // Eliminar guiones duplicados
        .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/fin
      
      await onSave({ ...data, code });
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al guardar tipo de producto',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {productType ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Nombre es requerido' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Tequila, Vodka, Ron, etc."
                autoFocus
              />
            )}
          />

          <Controller
            name="displayOrder"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Orden de visualización"
                fullWidth
                margin="normal"
                helperText="Orden en que aparece en listados (menor = primero)"
              />
            )}
          />
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
              productType ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductTypeDialog;

