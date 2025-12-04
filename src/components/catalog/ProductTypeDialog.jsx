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
      slug: '',
      description: '',
      displayOrder: 0
    }
  });

  useEffect(() => {
    if (productType) {
      reset({
        name: productType.name || '',
        slug: productType.slug || '',
        description: productType.description || '',
        displayOrder: productType.displayOrder || 0
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        displayOrder: 0
      });
    }
  }, [productType, reset, open]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await onSave(data);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al guardar tipo de producto',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Generar slug automáticamente desde el nombre
  const handleNameChange = (onChange, value) => {
    onChange(value);
    if (!productType) {
      // Solo auto-generar slug al crear, no al editar
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales por guiones
        .replace(/-+/g, '-') // Eliminar guiones duplicados
        .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/fin
      reset((formValues) => ({
        ...formValues,
        name: value,
        slug
      }));
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
            render={({ field: { onChange, ...field } }) => (
              <TextField
                {...field}
                onChange={(e) => handleNameChange(onChange, e.target.value)}
                label="Nombre"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="Ej: Tequila"
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            rules={{ 
              required: 'Slug es requerido',
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'Solo minúsculas, números y guiones'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Slug (identificador único)"
                fullWidth
                margin="normal"
                error={!!errors.slug}
                helperText={errors.slug?.message || 'Generado automáticamente desde el nombre'}
                placeholder="ej: tequila"
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

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Descripción opcional del tipo de producto"
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

