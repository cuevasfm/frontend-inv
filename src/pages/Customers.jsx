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
import customerService from '../services/customerService';
import CustomerDialog from '../components/customers/CustomerDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Customers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, pagination.pageSize, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search
      };

      const data = await customerService.getAll(params);
      setCustomers(data.customers || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      enqueueSnackbar('Error al cargar clientes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await customerService.delete(selectedCustomer.id);
      enqueueSnackbar('Cliente eliminado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadCustomers();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al eliminar cliente',
        { variant: 'error' }
      );
    }
  };

  const handleSave = async (customerData) => {
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, customerData);
        enqueueSnackbar('Cliente actualizado exitosamente', { variant: 'success' });
      } else {
        await customerService.create(customerData);
        enqueueSnackbar('Cliente creado exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadCustomers();
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => {
        if (row.customerType === 'business') {
          return row.companyName || '-';
        }
        return `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-';
      }
    },
    {
      field: 'customerType',
      headerName: 'Tipo',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value === 'business' ? 'Empresa' : 'Individual'}
          color={params.value === 'business' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 130,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'taxId',
      headerName: 'RFC',
      width: 130,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'municipality',
      headerName: 'Municipio',
      width: 150,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'state',
      headerName: 'Estado',
      width: 130,
      valueGetter: (value) => value || '-'
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 100,
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
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar clientes..."
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
          rows={customers}
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

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        customer={selectedCustomer}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${
          selectedCustomer?.companyName ||
          `${selectedCustomer?.firstName || ''} ${selectedCustomer?.lastName || ''}`.trim()
        }"?`}
      />
    </Box>
  );
};

export default Customers;
