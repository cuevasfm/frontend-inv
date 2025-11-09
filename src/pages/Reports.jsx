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
  Chip,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  TrendingUp as ProfitIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  Storefront as BrandIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import reportService from '../services/reportService';

const Reports = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // Vista móvil optimizada
  const MobileView = () => (
    <Box>
      {/* Header móvil */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">
            Reporte de Inventario
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={loadReport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {reportData && formatDate(reportData.generatedAt)}
        </Typography>
      </Box>

      {reportData && (
        <>
          {/* Resumen compacto */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6" color="primary">{reportData.summary.totalProducts}</Typography>
                  <Typography variant="caption" color="text.secondary">Productos</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6" color="primary">{reportData.summary.totalItems.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">Items</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(reportData.summary.potentialProfit)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ganancia Potencial ({reportData.summary.profitMargin}% margen)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ backgroundColor: reportData.summary.lowStockProducts > 0 ? '#fff3e0' : '#f5f5f5' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6">{reportData.summary.lowStockProducts}</Typography>
                  <Typography variant="caption" color="text.secondary">Bajo Stock</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ backgroundColor: reportData.summary.outOfStockProducts > 0 ? '#ffebee' : '#f5f5f5' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="h6">{reportData.summary.outOfStockProducts}</Typography>
                  <Typography variant="caption" color="text.secondary">Sin Stock</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Categorías - Accordion */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1 }} />
                <Typography>Por Categorías ({reportData.categoryStats.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {reportData.categoryStats.map((cat, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={cat.category}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Productos: {cat.count} | Stock: {cat.totalStock.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" display="block" color="success.main">
                            Ganancia: {formatCurrency(cat.profit)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Marcas - Accordion */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BrandIcon sx={{ mr: 1 }} />
                <Typography>Top 10 Marcas ({reportData.brandStats.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {reportData.brandStats.map((brand, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={brand.brand}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Productos: {brand.count} | Stock: {brand.totalStock.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" display="block" color="success.main">
                            Ganancia: {formatCurrency(brand.profit)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Top Productos - Accordion */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography>Top 20 Productos ({reportData.topValueProducts.length})</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {reportData.topValueProducts.map((product) => (
                  <ListItem key={product.id} divider>
                    <ListItemText
                      primary={product.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {product.category} | {product.brand}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Stock: {product.currentStock} | Valor: {formatCurrency(product.totalRetailValue)}
                          </Typography>
                          <Typography variant="caption" display="block" color="success.main">
                            Ganancia: {formatCurrency(product.potentialProfit)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );

  // Vista desktop original
  const DesktopView = () => (
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

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
};

export default Reports;
