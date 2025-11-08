import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import auditLogService from '../services/auditLogService';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const AuditLogs = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    module: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const modules = [
    { value: '', label: 'Todos los módulos' },
    { value: 'auth', label: 'Autenticación' },
    { value: 'users', label: 'Usuarios' },
    { value: 'products', label: 'Productos' },
    { value: 'customers', label: 'Clientes' },
    { value: 'sales', label: 'Ventas' },
    { value: 'suppliers', label: 'Proveedores' },
    { value: 'purchase-orders', label: 'Órdenes de Compra' },
    { value: 'categories', label: 'Categorías' },
    { value: 'brands', label: 'Marcas' },
    { value: 'promoters', label: 'Promotores' },
    { value: 'visits', label: 'Visitas' }
  ];

  const actions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'LOGIN', label: 'Inicio de sesión' },
    { value: 'LOGOUT', label: 'Cierre de sesión' },
    { value: 'VIEW', label: 'Visualización' }
  ];

  const columns = [
    {
      field: 'created_at',
      headerName: 'Fecha y Hora',
      width: 180,
      valueFormatter: (params) => {
        return new Date(params).toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
    },
    {
      field: 'username',
      headerName: 'Usuario',
      width: 150
    },
    {
      field: 'module',
      headerName: 'Módulo',
      width: 130
    },
    {
      field: 'action',
      headerName: 'Acción',
      width: 120,
      renderCell: (params) => {
        const colors = {
          CREATE: '#4caf50',
          UPDATE: '#2196f3',
          DELETE: '#f44336',
          LOGIN: '#9c27b0',
          LOGOUT: '#ff9800',
          VIEW: '#607d8b'
        };
        return (
          <Box
            sx={{
              backgroundColor: colors[params.row.action] || '#757575',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {params.row.action}
          </Box>
        );
      }
    },
    {
      field: 'entityName',
      headerName: 'Entidad',
      width: 200
    },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 1,
      minWidth: 250
    },
    {
      field: 'ipAddress',
      headerName: 'IP',
      width: 130
    }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const data = await auditLogService.getAll(params);
      setLogs(data.logs);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (error) {
      enqueueSnackbar(error.error || 'Error al cargar los logs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await auditLogService.getStats(params);
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
    fetchStats();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      module: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => {
      fetchLogs();
      fetchStats();
    }, 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Logs de Auditoría
      </Typography>

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Logs
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Módulos Activos
                </Typography>
                <Typography variant="h4">
                  {stats.byModule.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tipos de Acción
                </Typography>
                <Typography variant="h4">
                  {stats.byAction.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Usuarios Activos
                </Typography>
                <Typography variant="h4">
                  {stats.topUsers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Usuario, entidad, descripción..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Módulo</InputLabel>
              <Select
                value={filters.module}
                label="Módulo"
                onChange={(e) => handleFilterChange('module', e.target.value)}
              >
                {modules.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Acción</InputLabel>
              <Select
                value={filters.action}
                label="Acción"
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                {actions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                fullWidth
              >
                Buscar
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={12}>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de logs */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.total}
          page={pagination.page - 1}
          pageSize={pagination.limit}
          onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
          onPageSizeChange={(newPageSize) => setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }))}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem'
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default AuditLogs;
