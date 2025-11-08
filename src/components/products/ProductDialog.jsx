import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Box,
  IconButton,
  InputAdornment
} from '@mui/material';
import { QrCodeScanner as ScanIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import productTypeService from '../../services/productTypeService';
import BarcodeScanner from '../common/BarcodeScanner';

const ProductDialog = ({ open, onClose, onSave, product, onBarcodeCheck }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const barcodeInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      barcode: '',
      name: '',
      description: '',
      categoryId: '',
      brandId: '',
      productTypeId: '',
      unitTypeId: '',
      alcoholPercentage: '',
      volumeMl: '',
      purchasePrice: '',
      retailPrice: '',
      wholesalePrice: '',
      wholesaleMinQuantity: 12,
      currentStock: 0,
      minStock: 5,
      maxStock: 100,
      reorderPoint: 10,
      isActive: true
    }
  });

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadCatalogs();
    }
  }, [open]);

  // Enfocar el campo de código de barras cuando se abre el diálogo
  useEffect(() => {
    if (open && barcodeInputRef.current) {
      // Usar setTimeout para asegurar que el diálogo esté completamente renderizado
      const timer = setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const loadCatalogs = async () => {
    try {
      const [categoriesData, brandsData, productTypesData] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll(),
        productTypeService.getAll()
      ]);

      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
      setProductTypes(productTypesData.productTypes || []);
    } catch (error) {
      enqueueSnackbar('Error al cargar catálogos', { variant: 'error' });
    }
  };

  // Cargar datos del producto cuando se abre el diálogo
  useEffect(() => {
    if (product) {
      reset({
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        productTypeId: product.productTypeId || '',
        unitTypeId: product.unitTypeId || '',
        alcoholPercentage: product.alcoholPercentage || '',
        volumeMl: product.volumeMl || '',
        purchasePrice: product.purchasePrice || '',
        retailPrice: product.retailPrice || '',
        wholesalePrice: product.wholesalePrice || '',
        wholesaleMinQuantity: product.wholesaleMinQuantity || 12,
        currentStock: product.currentStock || 0,
        minStock: product.minStock || 5,
        maxStock: product.maxStock || 100,
        reorderPoint: product.reorderPoint || 10,
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else {
      reset({
        barcode: '',
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
        productTypeId: '',
        unitTypeId: '',
        alcoholPercentage: '',
        volumeMl: '',
        purchasePrice: '',
        retailPrice: '',
        wholesalePrice: '',
        wholesaleMinQuantity: 12,
        currentStock: 0,
        minStock: 5,
        maxStock: 100,
        reorderPoint: 10,
        isActive: true
      });
    }
  }, [product, reset, open]);

  const handleBarcodeScan = (barcode) => {
    reset({
      ...control._formValues,
      barcode: barcode
    });
    enqueueSnackbar('Código de barras escaneado exitosamente', { variant: 'success' });

    // Verificar si el producto existe
    if (onBarcodeCheck && !product) {
      onBarcodeCheck(barcode);
    }
  };

  const handleBarcodeBlur = (barcode) => {
    console.log('handleBarcodeBlur llamado con:', barcode);
    console.log('onBarcodeCheck existe:', !!onBarcodeCheck);
    console.log('product:', product);
    console.log('Longitud barcode:', barcode?.length);

    // Verificar si el producto existe cuando se termina de escribir el código
    if (onBarcodeCheck && !product && barcode && barcode.length >= 1) {
      console.log('Llamando a onBarcodeCheck...');
      onBarcodeCheck(barcode);
    } else {
      console.log('No se cumplieron las condiciones para verificar');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convertir strings vacíos a null para campos opcionales
      const cleanData = {
        ...data,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        productTypeId: data.productTypeId || null,
        unitTypeId: data.unitTypeId || null,
        barcode: data.barcode || null,
        alcoholPercentage: data.alcoholPercentage || null,
        volumeMl: data.volumeMl || null,
        wholesalePrice: data.wholesalePrice || null
      };

      await onSave(cleanData);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al guardar producto',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Código de barras */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="barcode"
                control={control}
                rules={{ required: 'Código de barras es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código de Barras"
                    fullWidth
                    inputRef={barcodeInputRef}
                    error={!!errors.barcode}
                    helperText={errors.barcode?.message}
                    onBlur={(e) => {
                      field.onBlur(); // Llamar al onBlur original del field
                      handleBarcodeBlur(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBarcodeBlur(e.target.value);
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setScannerOpen(true)}
                            edge="end"
                            color="primary"
                            title="Escanear código de barras"
                          >
                            <ScanIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* Categoría */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Categoría"
                    fullWidth
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Marca */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="brandId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Marca"
                    fullWidth
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Tipo de Producto */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="productTypeId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo de Producto"
                    fullWidth
                  >
                    <MenuItem value="">Ninguno</MenuItem>
                    {productTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Nombre */}
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nombre es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del Producto"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            {/* Porcentaje de alcohol */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="alcoholPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="% Alcohol"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.1, min: 0, max: 100 }}
                  />
                )}
              />
            </Grid>

            {/* Volumen */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="volumeMl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Volumen (ml)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            {/* Precios */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{
                  required: 'Precio de compra es requerido',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio de Compra"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="retailPrice"
                control={control}
                rules={{
                  required: 'Precio de venta es requerido',
                  min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio de Venta"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                    error={!!errors.retailPrice}
                    helperText={errors.retailPrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="wholesalePrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Precio Mayoreo"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                )}
              />
            </Grid>

            {/* Stock */}
            <Grid item xs={12} sm={3}>
              <Controller
                name="currentStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Actual"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Mínimo"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="maxStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stock Máximo"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="reorderPoint"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Punto de Reorden"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Estado"
                    fullWidth
                  >
                    <MenuItem value={true}>Activo</MenuItem>
                    <MenuItem value={false}>Inactivo</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              product ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </form>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </Dialog>
  );
};

export default ProductDialog;
