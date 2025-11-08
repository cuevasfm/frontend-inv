import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import userService from '../services/userService';
import UserDialog from '../components/users/UserDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Users = () => {
  const { enqueueSnackbar } = useSnackbar();
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

  return (
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
