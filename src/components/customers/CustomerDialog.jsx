import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const CustomerDialog = ({ open, onClose, onSave, customer }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customerType: 'individual',
      firstName: '',
      lastName: '',
      companyName: '',
      taxId: '',
      email: '',
      phone: '',
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      neighborhood: '',
      postalCode: '',
      municipality: '',
      state: '',
      notes: '',
      isActive: true
    }
  });

  const customerType = watch('customerType');

  // Enfocar el campo de nombre cuando se abre el diálogo
  useEffect(() => {
    if (open && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Cargar datos del cliente cuando se abre el diálogo
  useEffect(() => {
    if (customer) {
      reset({
        customerType: customer.customerType || 'individual',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        companyName: customer.companyName || '',
        taxId: customer.taxId || '',
        email: customer.email || '',
        phone: customer.phone || '',
        street: customer.street || '',
        exteriorNumber: customer.exteriorNumber || '',
        interiorNumber: customer.interiorNumber || '',
        neighborhood: customer.neighborhood || '',
        postalCode: customer.postalCode || '',
        municipality: customer.municipality || '',
        state: customer.state || '',
        notes: customer.notes || '',
        isActive: customer.isActive !== undefined ? customer.isActive : true
      });
    } else {
      reset({
        customerType: 'individual',
        firstName: '',
        lastName: '',
        companyName: '',
        taxId: '',
        email: '',
        phone: '',
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        neighborhood: '',
        postalCode: '',
        municipality: '',
        state: '',
        notes: '',
        isActive: true
      });
    }
  }, [customer, reset, open]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validación del nombre según el tipo de cliente
      if (data.customerType === 'business' && !data.companyName) {
        enqueueSnackbar('El nombre de la empresa es requerido', { variant: 'error' });
        setLoading(false);
        return;
      }

      if (data.customerType === 'individual' && !data.firstName && !data.lastName) {
        enqueueSnackbar('El nombre del cliente es requerido', { variant: 'error' });
        setLoading(false);
        return;
      }

      // Convertir strings vacíos a null para campos opcionales
      const cleanData = {
        ...data,
        email: data.email || null,
        taxId: data.taxId || null,
        phone: data.phone || null,
        street: data.street || null,
        exteriorNumber: data.exteriorNumber || null,
        interiorNumber: data.interiorNumber || null,
        neighborhood: data.neighborhood || null,
        postalCode: data.postalCode || null,
        municipality: data.municipality || null,
        state: data.state || null,
        notes: data.notes || null
      };

      await onSave(cleanData);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al guardar cliente',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Tipo de Cliente */}
            <Grid item xs={12}>
              <Controller
                name="customerType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo de Cliente"
                    fullWidth
                  >
                    <MenuItem value="individual">Persona Física</MenuItem>
                    <MenuItem value="business">Empresa</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Datos según tipo de cliente */}
            {customerType === 'individual' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: 'Nombre es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre(s)"
                        fullWidth
                        inputRef={nameInputRef}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Apellidos"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Controller
                  name="companyName"
                  control={control}
                  rules={{ required: 'Nombre de la empresa es requerido' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre de la Empresa"
                      fullWidth
                      inputRef={nameInputRef}
                      error={!!errors.companyName}
                      helperText={errors.companyName?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Información de contacto */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Información de Contacto
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teléfono"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="taxId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="RFC"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Dirección
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Calle"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Controller
                name="exteriorNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="No. Ext."
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Controller
                name="interiorNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="No. Int."
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="neighborhood"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Colonia"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código Postal"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="municipality"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Municipio"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Estado"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Notas */}
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notas"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            {/* Estado */}
            {customer && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Estado"
                      fullWidth
                    >
                      <MenuItem value={true}>Activo</MenuItem>
                      <MenuItem value={false}>Inactivo</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}
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
              customer ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
