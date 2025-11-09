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
  Select,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import auditLogService from '../services/auditLogService';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Computer as ComputerIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const AuditLogs = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
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

  // Función auxiliar para obtener color de acción
  const getActionColor = (action) => {
    const colors = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'error',
      LOGIN: 'secondary',
      LOGOUT: 'warning',
      VIEW: 'default'
    };
    return colors[action] || 'default';
  };

  // Función auxiliar para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vista móvil con timeline
  const MobileView = () => (
    <Box>
      {/* Estadísticas compactas */}
      {stats && (
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" color="primary">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total Logs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" color="primary">{stats.byModule.length}</Typography>
                <Typography variant="caption" color="text.secondary">Módulos</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros colapsables */}
      <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography>Filtros</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Buscar"
                placeholder="Usuario, entidad..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
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
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha Inicio"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha Fin"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  fullWidth
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Timeline de logs */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No se encontraron registros de auditoría
          </Typography>
        </Paper>
      ) : (
        <Box>
          {logs.map((log, index) => (
            <Card key={log.id} sx={{ mb: 2 }}>
              <CardContent>
                {/* Header con acción y fecha */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip
                    label={log.action}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    <Typography variant="caption">
                      {formatDate(log.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {/* Descripción */}
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {log.description}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* Metadatos */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Usuario: <strong>{log.username}</strong>
                    </Typography>
                  </Box>
                  
                  {log.module && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Módulo: <strong>{log.module}</strong>
                      </Typography>
                    </Box>
                  )}

                  {log.entityName && (
                    <Typography variant="caption" color="text.secondary">
                      Entidad: <strong>{log.entityName}</strong>
                    </Typography>
                  )}

                  {log.ipAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ComputerIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        IP: {log.ipAddress}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Paginación simple */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
              Página {pagination.page} de {pagination.totalPages}
            </Typography>
            <Button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Vista desktop con DataGrid
  const DesktopView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Logs de Auditoría
        </Typography>
      </Box>

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

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header solo en móvil */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5">
            Logs de Auditoría
          </Typography>
        </Box>
      )}

      {/* Vista condicional */}
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
};

export default AuditLogs;
