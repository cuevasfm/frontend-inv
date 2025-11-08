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
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const UserDialog = ({ open, onClose, onSave, user }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'cashier',
      isActive: true
    }
  });

  // Enfocar el campo de nombre de usuario cuando se abre el diálogo
  useEffect(() => {
    if (open && usernameInputRef.current) {
      const timer = setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Cargar datos del usuario cuando se abre el diálogo
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        email: user.email || '',
        password: '', // No mostramos la contraseña
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'cashier',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'cashier',
        isActive: true
      });
    }
  }, [user, reset, open]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validación del nombre de usuario
      if (!data.username) {
        enqueueSnackbar('El nombre de usuario es requerido', { variant: 'error' });
        setLoading(false);
        return;
      }

      // Validación del email
      if (!data.email) {
        enqueueSnackbar('El email es requerido', { variant: 'error' });
        setLoading(false);
        return;
      }

      // Validación de contraseña (solo para nuevos usuarios)
      if (!user && !data.password) {
        enqueueSnackbar('La contraseña es requerida', { variant: 'error' });
        setLoading(false);
        return;
      }

      // Si es edición y no se proporcionó contraseña, no enviarla
      const cleanData = { ...data };
      if (user && !data.password) {
        delete cleanData.password;
      }

      await onSave(cleanData);
    } catch (error) {
      enqueueSnackbar(
        error.error || error.message || 'Error al guardar usuario',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Información Básica
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Nombre de usuario es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre de Usuario"
                    fullWidth
                    inputRef={usernameInputRef}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email es requerido',
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
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre(s)"
                    fullWidth
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

            {/* Contraseña */}
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                rules={{
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={user ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* Configuración */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Configuración
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Rol"
                    fullWidth
                  >
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="manager">Gerente</MenuItem>
                    <MenuItem value="cashier">Cajero</MenuItem>
                    <MenuItem value="warehouse">Almacén</MenuItem>
                    <MenuItem value="promoter">Promotor</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {user && (
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
              user ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDialog;
