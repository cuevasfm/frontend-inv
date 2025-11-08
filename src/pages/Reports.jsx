import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  TrendingUp as ProfitIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  Storefront as BrandIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import reportService from '../services/reportService';

const Reports = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getInventoryReport();
      setReportData(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      enqueueSnackbar('Error al cargar el reporte de inventario', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !reportData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Reporte de Inventario
        </Typography>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={loadReport}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {reportData && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generado: {formatDate(reportData.generatedAt)}
          </Typography>

          {/* Resumen General */}
          <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>
            Resumen General
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Productos */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InventoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {reportData.summary.totalProducts}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Productos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Items */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InventoryIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {reportData.summary.totalItems.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Unidades en Stock
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Valor de Compra */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(reportData.summary.totalPurchaseValue)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor de Compra
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Valor de Venta */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(reportData.summary.totalRetailValue)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor de Venta
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Ganancia Potencial */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ProfitIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(reportData.summary.potentialProfit)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Ganancia Potencial
                  </Typography>
                  <Chip
                    label={`${reportData.summary.profitMargin}% margen`}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Productos con Bajo Stock */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: reportData.summary.lowStockProducts > 0 ? '#fff3e0' : '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon color={reportData.summary.lowStockProducts > 0 ? 'warning' : 'disabled'} sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {reportData.summary.lowStockProducts}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Bajo Stock
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Productos sin Stock */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: reportData.summary.outOfStockProducts > 0 ? '#ffebee' : '#f5f5f5' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon color={reportData.summary.outOfStockProducts > 0 ? 'error' : 'disabled'} sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {reportData.summary.outOfStockProducts}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Sin Stock
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Distribución por Categorías */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Distribución por Categorías
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Categoría</strong></TableCell>
                    <TableCell align="right"><strong>Productos</strong></TableCell>
                    <TableCell align="right"><strong>Stock Total</strong></TableCell>
                    <TableCell align="right"><strong>Valor Compra</strong></TableCell>
                    <TableCell align="right"><strong>Valor Venta</strong></TableCell>
                    <TableCell align="right"><strong>Ganancia</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.categoryStats.map((cat, index) => (
                    <TableRow key={index}>
                      <TableCell>{cat.category}</TableCell>
                      <TableCell align="right">{cat.count}</TableCell>
                      <TableCell align="right">{cat.totalStock.toLocaleString()}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.purchaseValue)}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.retailValue)}</TableCell>
                      <TableCell align="right" sx={{ color: cat.profit > 0 ? 'success.main' : 'text.secondary' }}>
                        {formatCurrency(cat.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Top 10 Marcas */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BrandIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Top 10 Marcas por Valor
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Marca</strong></TableCell>
                    <TableCell align="right"><strong>Productos</strong></TableCell>
                    <TableCell align="right"><strong>Stock Total</strong></TableCell>
                    <TableCell align="right"><strong>Valor Compra</strong></TableCell>
                    <TableCell align="right"><strong>Valor Venta</strong></TableCell>
                    <TableCell align="right"><strong>Ganancia</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.brandStats.map((brand, index) => (
                    <TableRow key={index}>
                      <TableCell>{brand.brand}</TableCell>
                      <TableCell align="right">{brand.count}</TableCell>
                      <TableCell align="right">{brand.totalStock.toLocaleString()}</TableCell>
                      <TableCell align="right">{formatCurrency(brand.purchaseValue)}</TableCell>
                      <TableCell align="right">{formatCurrency(brand.retailValue)}</TableCell>
                      <TableCell align="right" sx={{ color: brand.profit > 0 ? 'success.main' : 'text.secondary' }}>
                        {formatCurrency(brand.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Top 20 Productos Más Valiosos */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MoneyIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Top 20 Productos Más Valiosos
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Producto</strong></TableCell>
                    <TableCell><strong>Categoría</strong></TableCell>
                    <TableCell><strong>Marca</strong></TableCell>
                    <TableCell align="right"><strong>Stock</strong></TableCell>
                    <TableCell align="right"><strong>P. Compra</strong></TableCell>
                    <TableCell align="right"><strong>P. Venta</strong></TableCell>
                    <TableCell align="right"><strong>Valor Total</strong></TableCell>
                    <TableCell align="right"><strong>Ganancia</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.topValueProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell align="right">{product.currentStock}</TableCell>
                      <TableCell align="right">{formatCurrency(product.purchasePrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(product.retailPrice)}</TableCell>
                      <TableCell align="right"><strong>{formatCurrency(product.totalRetailValue)}</strong></TableCell>
                      <TableCell align="right" sx={{ color: product.potentialProfit > 0 ? 'success.main' : 'text.secondary' }}>
                        {formatCurrency(product.potentialProfit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Reports;
