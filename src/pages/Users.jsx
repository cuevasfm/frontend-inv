import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Fab,
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import userService from '../services/userService';
import UserDialog from '../components/users/UserDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Users = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.pageSize, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search
      };

      const data = await userService.getAll(params);
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      enqueueSnackbar('Error al cargar usuarios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.delete(selectedUser.id);
      enqueueSnackbar('Usuario desactivado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al desactivar usuario',
        { variant: 'error' }
      );
    }
  };

  const handleSave = async (userData) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, userData);
        enqueueSnackbar('Usuario actualizado exitosamente', { variant: 'success' });
      } else {
        await userService.create(userData);
        enqueueSnackbar('Usuario creado exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadUsers();
    } catch (error) {
      throw error;
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      manager: 'Gerente',
      cashier: 'Cajero',
      warehouse: 'Almacén',
      promoter: 'Promotor'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      cashier: 'info',
      warehouse: 'success',
      promoter: 'secondary'
    };
    return colors[role] || 'default';
  };

  const columns = [
    {
      field: 'username',
      headerName: 'Usuario',
      width: 150,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'name',
      headerName: 'Nombre Completo',
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => {
        const name = `${row.firstName || ''} ${row.lastName || ''}`.trim();
        return name || '-';
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getRoleLabel(params.value)}
          color={getRoleColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  // Vista móvil con tarjetas
  const MobileView = () => (
    <Box sx={{ pb: 10 }}>
      {/* Búsqueda móvil */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toca el botón + para crear un nuevo usuario
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {users.map((user) => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            
            return (
              <Grid item xs={12} key={user.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h6">
                            {fullName || user.username}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccountIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              @{user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip
                        label={user.isActive ? 'Activo' : 'Inactivo'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{ mb: 1.5 }}
                    />

                    {user.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <IconButton
                      onClick={() => handleEdit(user)}
                      color="primary"
                      size="large"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(user)}
                      color="error"
                      size="large"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        onClick={handleAddNew}
      >
        <AddIcon />
      </Fab>
    </Box>
  );

  // Vista desktop con DataGrid
  const DesktopView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            endAdornment: <SearchIcon />
          }}
        />
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.total}
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.pageSize
          }}
          onPaginationModelChange={(model) => {
            setPagination(prev => ({
              ...prev,
              page: model.page,
              pageSize: model.pageSize
            }));
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Paper>
    </Box>
  );

  return (
    <Box>
      {/* Header solo en móvil */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5">
            Usuarios
          </Typography>
        </Box>
      )}

      {/* Vista condicional */}
      {isMobile ? <MobileView /> : <DesktopView />}

      <UserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Desactivar Usuario"
        message={`¿Estás seguro de que deseas desactivar al usuario "${selectedUser?.username}"?`}
      />
    </Box>
  );
};

export default Users;
