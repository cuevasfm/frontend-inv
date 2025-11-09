import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
  Avatar,
  Alert,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  QrCodeScanner as ScanIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import saleService from '../services/saleService';
import productService from '../services/productService';
import customerService from '../services/customerService';
import BarcodeScanner from '../components/common/BarcodeScanner';

const STORAGE_KEY = 'pos_current_sale';

const POS = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estado principal
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [saleType, setSaleType] = useState('retail');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  // Diálogos
  const [scannerOpen, setScannerOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Búsqueda y datos
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Pago
  const [paidAmount, setPaidAmount] = useState('');

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed.cart || []);
        setCustomer(parsed.customer || null);
        setSaleType(parsed.saleType || 'retail');
        setNotes(parsed.notes || '');
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cart,
      customer,
      saleType,
      notes
    }));
  }, [cart, customer, saleType, notes]);

  // Calcular totales
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = saleType === 'wholesale' && item.product.wholesalePrice
        ? parseFloat(item.product.wholesalePrice)
        : parseFloat(item.product.retailPrice);
      return sum + (price * item.quantity);
    }, 0);

    const discount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal - discount;

    return { subtotal, discount, total };
  }, [cart, saleType]);

  const totals = calculateTotals();

  // Agregar producto por código de barras
  const handleBarcodeScan = async (barcode) => {
    try {
      const response = await productService.getAll({ search: barcode, limit: 1 });
      const product = response.products?.find(p => p.barcode === barcode);

      if (!product) {
        enqueueSnackbar(`Producto con código ${barcode} no encontrado`, { variant: 'warning' });
        return;
      }

      if (!product.isActive) {
        enqueueSnackbar(`El producto "${product.name}" no está activo`, { variant: 'error' });
        return;
      }

      addToCart(product);
      setScannerOpen(false);
    } catch (error) {
      enqueueSnackbar('Error al buscar producto', { variant: 'error' });
    }
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQuantity = newCart[existingIndex].quantity + 1;

      if (newQuantity > product.currentStock) {
        enqueueSnackbar(`Stock insuficiente. Disponible: ${product.currentStock}`, { variant: 'warning' });
        return;
      }

      newCart[existingIndex].quantity = newQuantity;
      setCart(newCart);
    } else {
      if (product.currentStock <= 0) {
        enqueueSnackbar('Producto sin stock disponible', { variant: 'error' });
        return;
      }

      setCart([...cart, {
        product,
        quantity: 1,
        discount: 0
      }]);
    }

    enqueueSnackbar(`"${product.name}" agregado al carrito`, { variant: 'success' });
  };

  // Actualizar cantidad
  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    const newQuantity = newCart[index].quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    if (newQuantity > newCart[index].product.currentStock) {
      enqueueSnackbar('Stock insuficiente', { variant: 'warning' });
      return;
    }

    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  // Remover del carrito
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    enqueueSnackbar('Producto eliminado del carrito', { variant: 'info' });
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setNotes('');
    setPaidAmount('');
    localStorage.removeItem(STORAGE_KEY);
    enqueueSnackbar('Carrito limpiado', { variant: 'info' });
  };

  // Buscar productos
  const searchProducts = async (search) => {
    if (!search || search.length < 2) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await productService.getAll({ search, limit: 20 });
      setProducts(response.products || []);
    } catch (error) {
      enqueueSnackbar('Error al buscar productos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes
  const searchCustomers = async (search) => {
    setLoading(true);
    try {
      const response = await customerService.getAll({ search, limit: 20, page: 1 });
      setCustomers(response.customers || []);
    } catch (error) {
      enqueueSnackbar('Error al buscar clientes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Procesar venta
  const processSale = async () => {
    if (cart.length === 0) {
      enqueueSnackbar('El carrito está vacío', { variant: 'warning' });
      return;
    }

    const paid = parseFloat(paidAmount) || totals.total;

    if (paid < totals.total) {
      enqueueSnackbar('El monto pagado es insuficiente', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customerId: customer?.id || null,
        saleType,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          discountAmount: item.discount || 0
        })),
        paymentMethod,
        paymentStatus: 'paid',
        paidAmount: paid,
        notes: notes || null
      };

      const response = await saleService.create(saleData);
      
      enqueueSnackbar(
        `Venta ${response.sale.saleNumber} completada. Cambio: ${formatCurrency(paid - totals.total)}`,
        { variant: 'success' }
      );

      // Limpiar y cerrar
      clearCart();
      setPaymentDialogOpen(false);
      setPaidAmount('');

    } catch (error) {
      console.error('Error al procesar venta:', error);
      enqueueSnackbar(error.error || 'Error al procesar la venta', { variant: 'error' });
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h5'}>
              💰 Punto de Venta
            </Typography>
            {customer && (
              <Chip
                label={customer.customerType === 'business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`}
                onDelete={() => setCustomer(null)}
                color="primary"
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<PersonIcon />}
              onClick={() => setCustomerSelectOpen(true)}
              variant={customer ? 'contained' : 'outlined'}
            >
              {isMobile ? '' : 'Cliente'}
            </Button>
            <IconButton color="error" onClick={clearCart} disabled={cart.length === 0}>
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Área principal */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ScanIcon />}
            onClick={() => setScannerOpen(true)}
            sx={{ py: 1.5 }}
          >
            Escanear
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setProductSearchOpen(true)}
            sx={{ py: 1.5 }}
          >
            Buscar
          </Button>
        </Box>

        {/* Carrito */}
        {cart.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Carrito vacío
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Escanea o busca productos para iniciar la venta
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: 2 }}>
            <List dense>
              {cart.map((item, index) => {
                const price = saleType === 'wholesale' && item.product.wholesalePrice
                  ? parseFloat(item.product.wholesalePrice)
                  : parseFloat(item.product.retailPrice);
                const itemTotal = (price * item.quantity) - (item.discount || 0);

                return (
                  <Box key={index}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                        {item.product.name[0]}
                      </Avatar>
                      <ListItemText
                        primary={item.product.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatCurrency(price)} x {item.quantity}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Stock: {item.product.currentStock}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(itemTotal)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(index, -1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Chip label={item.quantity} size="small" />
                          <IconButton size="small" onClick={() => updateQuantity(index, 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeFromCart(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < cart.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </Paper>
        )}
      </Box>

      {/* Total y Pago - Siempre visible */}
      <Paper sx={{ p: 2, position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
          </Box>
          {totals.discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="error">Descuento:</Typography>
              <Typography variant="body2" color="error">-{formatCurrency(totals.discount)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">TOTAL:</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={() => setPaymentDialogOpen(true)}
          disabled={cart.length === 0 || loading}
          sx={{ py: 1.5 }}
        >
          Cobrar
        </Button>
      </Paper>

      {/* Diálogo: Escáner de Códigos */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Escanear Código de Barras
          <IconButton
            onClick={() => setScannerOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(error) => enqueueSnackbar(error, { variant: 'error' })}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo: Buscar Producto */}
      <Dialog
        open={productSearchOpen}
        onClose={() => setProductSearchOpen(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Buscar Producto</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o código de barras..."
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              searchProducts(e.target.value);
            }}
            autoFocus
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AddIcon />
                </InputAdornment>
              )
            }}
          />
          <List>
            {products.map((product) => (
              <ListItem
                key={product.id}
                button
                onClick={() => {
                  addToCart(product);
                  setProductSearchOpen(false);
                  setProductSearch('');
                }}
              >
                <ListItemText
                  primary={product.name}
                  secondary={`${formatCurrency(product.retailPrice)} • Stock: ${product.currentStock}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Seleccionar Cliente */}
      <Dialog
        open={customerSelectOpen}
        onClose={() => setCustomerSelectOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleccionar Cliente (Opcional)</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Buscar cliente..."
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              searchCustomers(e.target.value);
            }}
            autoFocus
            sx={{ mb: 2, mt: 1 }}
          />
          <List>
            {customers.map((cust) => (
              <ListItem
                key={cust.id}
                button
                onClick={() => {
                  setCustomer(cust);
                  setCustomerSelectOpen(false);
                  setCustomerSearch('');
                }}
              >
                <ListItemText
                  primary={cust.customerType === 'business' ? cust.companyName : `${cust.firstName} ${cust.lastName}`}
                  secondary={cust.email || cust.phone}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Pago */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => !loading && setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Procesar Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="h4" align="center" color="primary" fontWeight="bold">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              value={paymentMethod}
              label="Método de Pago"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">💵 Efectivo</MenuItem>
              <MenuItem value="card">💳 Tarjeta</MenuItem>
              <MenuItem value="transfer">🏦 Transferencia</MenuItem>
              <MenuItem value="credit">📄 Crédito</MenuItem>
            </Select>
          </FormControl>

          {paymentMethod === 'cash' && (
            <>
              <TextField
                fullWidth
                label="Monto Recibido"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                sx={{ mb: 2 }}
              />
              {paidAmount && parseFloat(paidAmount) >= totals.total && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Cambio: {formatCurrency(parseFloat(paidAmount) - totals.total)}
                  </Typography>
                </Alert>
              )}
            </>
          )}

          <TextField
            fullWidth
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={processSale}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            disabled={loading || (paymentMethod === 'cash' && (!paidAmount || parseFloat(paidAmount) < totals.total))}
          >
            Confirmar Venta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POS;

