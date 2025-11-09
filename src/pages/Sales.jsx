import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Alert
} from '@mui/material';
import {
  Visibility,
  Cancel,
  Person,
  AttachMoney,
  Receipt,
  EventNote,
  ExpandMore,
  ExpandLess,
  ShoppingCart,
  TrendingUp,
  Money
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import saleService from '../services/saleService';

const Sales = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSales, setTotalSales] = useState(0);
  
  // Resumen de ventas
  const [summary, setSummary] = useState({
    todaySales: 0,
    todayCount: 0,
    weekSales: 0,
    weekCount: 0,
    monthSales: 0,
    monthCount: 0
  });

  // Diálogo de detalles
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Diálogo de cancelación
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelingSaleId, setCancelingSaleId] = useState(null);

  // Estados expandibles para mobile
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadSales();
    loadSummary();
  }, [page, rowsPerPage]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getAll({
        page: page + 1,
        limit: rowsPerPage
      });
      setSales(response.data.sales || []);
      setTotalSales(response.data.pagination.total);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      enqueueSnackbar(error.error || 'Error al cargar ventas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await saleService.getSummary();
      setSummary(response.data || {});
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  const handleViewDetails = async (sale) => {
    try {
      const response = await saleService.getById(sale.id);
      setSelectedSale(response.data);
      setDetailDialog(true);
    } catch (error) {
      enqueueSnackbar(error.error || 'Error al cargar detalles', { variant: 'error' });
    }
  };

  const handleCancelSale = async () => {
    if (!cancelReason.trim()) {
      enqueueSnackbar('Debes proporcionar un motivo de cancelación', { variant: 'warning' });
      return;
    }

    try {
      await saleService.cancel(cancelingSaleId, cancelReason);
      enqueueSnackbar('Venta cancelada exitosamente', { variant: 'success' });
      setCancelDialog(false);
      setCancelReason('');
      setCancelingSaleId(null);
      loadSales();
      loadSummary();
    } catch (error) {
      enqueueSnackbar(error.error || 'Error al cancelar venta', { variant: 'error' });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      cancelled: 'error',
      pending: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completada',
      cancelled: 'Cancelada',
      pending: 'Pendiente'
    };
    return labels[status] || status;
  };

  const getSaleTypeLabel = (type) => {
    const labels = {
      retail: 'Menudeo',
      wholesale: 'Mayoreo',
      credit: 'Crédito'
    };
    return labels[type] || type;
  };

  // Vista mobile: Cards
  const MobileSaleCard = ({ sale }) => {
    const isExpanded = expandedId === sale.id;
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              #{sale.id}
            </Typography>
            <Chip 
              label={getStatusLabel(sale.paymentStatus)} 
              size="small" 
              color={getStatusColor(sale.paymentStatus)}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            {formatCurrency(sale.totalAmount)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Person sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Cliente General'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EventNote sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="textSecondary">
              {formatDate(sale.created_at)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={getSaleTypeLabel(sale.saleType)} 
              size="small" 
              variant="outlined"
            />
            {sale.items && (
              <Chip 
                label={`${sale.items.length} productos`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => handleViewDetails(sale)}
              fullWidth
            >
              Ver Detalles
            </Button>
            {sale.paymentStatus === 'paid' && (
              <Button
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  setCancelingSaleId(sale.id);
                  setCancelDialog(true);
                }}
                fullWidth
              >
                Cancelar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Ventas
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Historial y gestión de ventas
        </Typography>
      </Box>

      {/* Resumen de Ventas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Money sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Ventas Hoy
                </Typography>
              </Box>
              <Typography variant="h5">
                {formatCurrency(summary.todaySales || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {summary.todayCount || 0} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Ventas Semana
                </Typography>
              </Box>
              <Typography variant="h5">
                {formatCurrency(summary.weekSales || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {summary.weekCount || 0} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCart sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Ventas Mes
                </Typography>
              </Box>
              <Typography variant="h5">
                {formatCurrency(summary.monthSales || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {summary.monthCount || 0} ventas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Ventas */}
      {isMobile ? (
        // Vista Mobile: Cards
        <Box>
          {sales.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No hay ventas registradas
              </Typography>
            </Paper>
          ) : (
            sales.map(sale => <MobileSaleCard key={sale.id} sale={sale} />)
          )}
          
          <TablePagination
            component="div"
            count={totalSales}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Ventas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Box>
      ) : (
        // Vista Desktop: Tabla
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No hay ventas registradas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>#{sale.id}</TableCell>
                      <TableCell>{formatDate(sale.created_at)}</TableCell>
                      <TableCell>
                        {sale.customer 
                          ? `${sale.customer.firstName} ${sale.customer.lastName}`
                          : 'Cliente General'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getSaleTypeLabel(sale.saleType)} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(sale.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(sale.paymentStatus)} 
                          size="small" 
                          color={getStatusColor(sale.paymentStatus)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(sale)}
                          title="Ver detalles"
                        >
                          <Visibility />
                        </IconButton>
                        {sale.paymentStatus === 'paid' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setCancelingSaleId(sale.id);
                              setCancelDialog(true);
                            }}
                            title="Cancelar venta"
                          >
                            <Cancel />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalSales}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Ventas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      )}

      {/* Diálogo de Detalles */}
      <Dialog
        open={detailDialog}
        onClose={() => {
          setDetailDialog(false);
          setSelectedSale(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Detalles de Venta #{selectedSale?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSale && (
            <Box>
              {/* Información General */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedSale.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Estado
                  </Typography>
                  <Chip 
                    label={getStatusLabel(selectedSale.paymentStatus)} 
                    size="small" 
                    color={getStatusColor(selectedSale.paymentStatus)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipo de Venta
                  </Typography>
                  <Typography variant="body1">
                    {getSaleTypeLabel(selectedSale.saleType)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.customer 
                      ? `${selectedSale.customer.firstName} ${selectedSale.customer.lastName}`
                      : 'Cliente General'
                    }
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Productos */}
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
              <List>
                {selectedSale.items?.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.product?.name || 'Producto'}
                      secondary={`Cantidad: ${item.quantity} × ${formatCurrency(item.unitPrice)}`}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.subtotal)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Totales */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(selectedSale.subtotal)}</Typography>
                </Box>
                {selectedSale.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="error">Descuento:</Typography>
                    <Typography color="error">-{formatCurrency(selectedSale.discountAmount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(selectedSale.totalAmount)}</Typography>
                </Box>
              </Box>

              {/* Información de Cancelación */}
              {selectedSale.paymentStatus === 'cancelled' && selectedSale.notes && selectedSale.notes.includes('[CANCELADA]') && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="error">
                    <Typography variant="subtitle2">Motivo de cancelación:</Typography>
                    <Typography variant="body2">{selectedSale.cancelledReason}</Typography>
                    {selectedSale.cancelledAt && (
                      <Typography variant="caption">
                        Cancelado el {formatDate(selectedSale.cancelledAt)}
                      </Typography>
                    )}
                  </Alert>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDetailDialog(false);
            setSelectedSale(null);
          }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Cancelación */}
      <Dialog
        open={cancelDialog}
        onClose={() => {
          setCancelDialog(false);
          setCancelReason('');
          setCancelingSaleId(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancelar Venta</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer. El stock de los productos será restaurado.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo de cancelación"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            helperText="Describe el motivo por el cual se cancela esta venta"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCancelDialog(false);
              setCancelReason('');
              setCancelingSaleId(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCancelSale}
            color="error"
            variant="contained"
            disabled={!cancelReason.trim()}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;

