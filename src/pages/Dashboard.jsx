import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  People,
  Warning,
  AttachMoney,
  TrendingDown,
  LocalOffer,
  Category,
  History,
  BarChart,
  ShowChart,
  Info
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import reportService from '../services/reportService';
import customerService from '../services/customerService';
import auditLogService from '../services/auditLogService';
import saleService from '../services/saleService';

const StatCard = ({ title, value, subtitle, icon, color, trend, loading }) => (
  <Paper
    sx={{
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 140,
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    ) : (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              backgroundColor: `${color}.light`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend.direction === 'up' ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography variant="caption" color={trend.direction === 'up' ? 'success.main' : 'error.main'}>
              {trend.value}
            </Typography>
          </Box>
        )}
      </>
    )}
  </Paper>
);

const Dashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    inventory: null,
    customers: null,
    recentActivity: [],
    sales: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [inventoryData, customersData, activityData, salesData] = await Promise.all([
        reportService.getInventoryReport().catch(() => null),
        customerService.getAll({ page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        auditLogService.getAll({ page: 1, limit: 10 }).catch(() => ({ logs: [] })),
        saleService.getSummary().catch(() => null)
      ]);

      setDashboardData({
        inventory: inventoryData,
        customers: customersData,
        recentActivity: activityData.logs || [],
        sales: salesData?.data || null
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      enqueueSnackbar('Error al cargar algunos datos del dashboard', { variant: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-MX');
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'error',
      LOGIN: 'secondary',
      LOGOUT: 'default'
    };
    return colors[action] || 'default';
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Resumen general de tu licorería
        </Typography>
      </Box>

      {/* Estadísticas Principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Productos */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Productos"
            value={dashboardData.inventory?.summary.totalProducts || 0}
            subtitle={`${dashboardData.inventory?.summary.totalItems.toLocaleString() || 0} unidades`}
            icon={<Inventory sx={{ color: 'primary.main' }} />}
            color="primary"
            loading={loading}
          />
        </Grid>

        {/* Valor Inventario */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Inventario"
            value={dashboardData.inventory ? formatCurrency(dashboardData.inventory.summary.totalRetailValue) : '$0'}
            subtitle="Valor de venta"
            icon={<AttachMoney sx={{ color: 'success.main' }} />}
            color="success"
            loading={loading}
          />
        </Grid>

        {/* Ganancia Potencial */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ganancia Potencial"
            value={dashboardData.inventory ? formatCurrency(dashboardData.inventory.summary.potentialProfit) : '$0'}
            subtitle={dashboardData.inventory ? `${dashboardData.inventory.summary.profitMargin}% margen` : ''}
            icon={<TrendingUp sx={{ color: 'warning.main' }} />}
            color="warning"
            loading={loading}
          />
        </Grid>

        {/* Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes"
            value={dashboardData.customers?.pagination?.total || 0}
            subtitle="Registrados"
            icon={<People sx={{ color: 'info.main' }} />}
            color="info"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Alertas de Stock */}
      {dashboardData.inventory && (dashboardData.inventory.summary.lowStockProducts > 0 || dashboardData.inventory.summary.outOfStockProducts > 0) && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dashboardData.inventory.summary.outOfStockProducts > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <AlertTitle>⚠️ Productos Sin Stock</AlertTitle>
                <strong>{dashboardData.inventory.summary.outOfStockProducts}</strong> productos sin existencias. 
                Revisa el inventario para reabastecer.
              </Alert>
            </Grid>
          )}
          {dashboardData.inventory.summary.lowStockProducts > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <AlertTitle>📦 Stock Bajo</AlertTitle>
                <strong>{dashboardData.inventory.summary.lowStockProducts}</strong> productos con stock bajo. 
                Considera hacer un pedido pronto.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Sección: Top Categorías */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Category sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Top Categorías</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : dashboardData.inventory?.categoryStats.length > 0 ? (
              <List dense>
                {dashboardData.inventory.categoryStats.slice(0, 5).map((cat, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <Chip label={index + 1} size="small" color="primary" sx={{ width: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={cat.category}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {cat.count} productos • {cat.totalStock} unidades
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((cat.totalStock / dashboardData.inventory.summary.totalItems) * 100, 100)}
                            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, ml: 1 }}>
                      {formatCurrency(cat.profit)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Category sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay datos de categorías
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sección: Top Marcas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalOffer sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Top Marcas</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : dashboardData.inventory?.brandStats.length > 0 ? (
              <List dense>
                {dashboardData.inventory.brandStats.slice(0, 5).map((brand, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <Chip label={index + 1} size="small" color="warning" sx={{ width: 28 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={brand.brand}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {brand.count} productos • {brand.totalStock} unidades
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((brand.totalStock / dashboardData.inventory.summary.totalItems) * 100, 100)}
                            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                            color="warning"
                          />
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, ml: 1 }}>
                      {formatCurrency(brand.profit)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <LocalOffer sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay datos de marcas
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sección: Actividad Reciente */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <History sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Actividad Reciente</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : dashboardData.recentActivity.length > 0 ? (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {dashboardData.recentActivity.slice(0, 8).map((log) => (
                  <ListItem key={log.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 35, mt: 0.5 }}>
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color={getActionColor(log.action)}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {log.description}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          {log.username} • {formatDate(log.created_at)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <History sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay actividad reciente
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sección: Resumen de Ventas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShowChart sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Ventas</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : dashboardData.sales ? (
              <Box>
                {/* Ventas de Hoy */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="success.dark" gutterBottom>
                    Ventas de Hoy
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                    {formatCurrency(dashboardData.sales.todaySales || 0)}
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    {dashboardData.sales.todayCount || 0} transacciones
                  </Typography>
                </Box>

                {/* Ventas de la Semana */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="info.dark" gutterBottom>
                    Ventas de la Semana
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.dark' }}>
                    {formatCurrency(dashboardData.sales.weekSales || 0)}
                  </Typography>
                  <Typography variant="caption" color="info.dark">
                    {dashboardData.sales.weekCount || 0} transacciones
                  </Typography>
                </Box>

                {/* Ventas del Mes */}
                <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                    Ventas del Mes
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                    {formatCurrency(dashboardData.sales.monthSales || 0)}
                  </Typography>
                  <Typography variant="caption" color="warning.dark">
                    {dashboardData.sales.monthCount || 0} transacciones
                  </Typography>
                </Box>

                {/* Promedio */}
                {dashboardData.sales.todayCount > 0 && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Ticket Promedio Hoy
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(dashboardData.sales.todaySales / dashboardData.sales.todayCount)}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <BarChart sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Sin ventas registradas
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Aún no hay ventas en el sistema
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Información del Sistema */}
      <Card sx={{ mt: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Info sx={{ mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Bienvenido al Sistema de Inventario
              </Typography>
              <Typography variant="body2">
                Este dashboard muestra el estado actual de tu licorería con datos en tiempo real. 
                Usa el menú lateral para navegar entre las diferentes secciones del sistema.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
