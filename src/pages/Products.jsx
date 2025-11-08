import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  useTheme,
  CircularProgress,
  MenuItem,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import productTypeService from '../services/productTypeService';
import ProductDialog from '../components/products/ProductDialog';
import QuickStockDialog from '../components/products/QuickStockDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    brandId: '',
    productTypeId: ''
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickStockDialogOpen, setQuickStockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingProduct, setExistingProduct] = useState(null);

  // Cargar productos
  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.pageSize,
        search,
        ...filters
      };

      const data = await productService.getAll(params);
      setProducts(data.products);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al cargar productos',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar catálogos al montar el componente
  useEffect(() => {
    loadCatalogs();
  }, []);

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

  useEffect(() => {
    loadProducts();
  }, [pagination.page, pagination.pageSize, filters]);

  // Buscar productos
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    loadProducts();
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearch('');
    setPagination(prev => ({ ...prev, page: 0 }));
    setTimeout(loadProducts, 100);
  };

  // Abrir diálogo para crear
  const handleCreate = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  // Abrir diálogo para editar
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  // Abrir diálogo de confirmación de eliminación
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Eliminar producto
  const handleDelete = async () => {
    try {
      await productService.delete(selectedProduct.id);
      enqueueSnackbar('Producto eliminado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadProducts();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al eliminar producto',
        { variant: 'error' }
      );
    }
  };

  // Verificar si producto existe por código de barras
  const handleBarcodeCheck = async (barcode) => {
    console.log('handleBarcodeCheck en Products.jsx llamado con:', barcode);
    if (!barcode || barcode.length < 1) {
      console.log('Barcode muy corto o vacío');
      return;
    }

    try {
      console.log('Buscando producto con barcode:', barcode);
      const result = await productService.getByBarcode(barcode);
      console.log('Resultado de búsqueda:', result);

      if (result && result.product) {
        console.log('Producto encontrado, mostrando diálogo rápido');
        setExistingProduct(result.product);
        setDialogOpen(false);
        setQuickStockDialogOpen(true);
        enqueueSnackbar(
          `Producto encontrado: ${result.product.name}. Actualiza inventario y precios.`,
          { variant: 'info' }
        );
      } else {
        console.log('Producto no encontrado, continuar con formulario');
      }
    } catch (error) {
      console.error('Error al buscar producto:', error);
      // Producto no existe, continuar con formulario normal
      setExistingProduct(null);
    }
  };

  // Guardar producto (crear o editar)
  const handleSave = async (productData) => {
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.id, productData);
        enqueueSnackbar('Producto actualizado exitosamente', { variant: 'success' });
      } else {
        await productService.create(productData);
        enqueueSnackbar('Producto creado exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      throw error;
    }
  };

  // Actualizar stock rápido
  const handleQuickStockUpdate = async (updateData) => {
    try {
      // Incluir todos los campos del producto existente más las actualizaciones
      const fullUpdateData = {
        barcode: existingProduct.barcode,
        name: existingProduct.name,
        description: existingProduct.description,
        categoryId: existingProduct.categoryId,
        brandId: existingProduct.brandId,
        productTypeId: existingProduct.productTypeId,
        unitTypeId: existingProduct.unitTypeId,
        alcoholPercentage: existingProduct.alcoholPercentage,
        volumeMl: existingProduct.volumeMl,
        wholesaleMinQuantity: existingProduct.wholesaleMinQuantity,
        minStock: existingProduct.minStock,
        maxStock: existingProduct.maxStock,
        reorderPoint: existingProduct.reorderPoint,
        isActive: existingProduct.isActive,
        ...updateData // Los nuevos valores sobrescriben
      };

      await productService.update(existingProduct.id, fullUpdateData);
      enqueueSnackbar('Inventario y precios actualizados exitosamente', { variant: 'success' });
      setQuickStockDialogOpen(false);
      setExistingProduct(null);
      loadProducts();
    } catch (error) {
      throw error;
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      field: 'barcode',
      headerName: 'Código',
      width: 120,
      sortable: true,
      hideable: true
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'category',
      headerName: 'Categoría',
      width: 130,
      valueGetter: (value, row) => row.category?.name || '-',
      hideable: true
    },
    {
      field: 'brand',
      headerName: 'Marca',
      width: 130,
      valueGetter: (value, row) => row.brand?.name || '-',
      hideable: true
    },
    {
      field: 'productType',
      headerName: 'Tipo',
      width: 120,
      valueGetter: (value, row) => row.productType?.name || '-',
      hideable: true
    },
    {
      field: 'currentStock',
      headerName: 'Stock',
      width: 90,
      type: 'number',
      renderCell: (params) => {
        const stock = params.row.currentStock;
        const minStock = params.row.minStock;
        const color = stock <= minStock ? 'error' : 'success';

        return (
          <Chip
            label={stock}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: 'retailPrice',
      headerName: 'Precio',
      width: 100,
      type: 'number',
      valueFormatter: (params) => {
        const value = params?.value || params;
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return `$${numValue?.toFixed(2) || '0.00'}`;
      }
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
      hideable: true
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      hideable: false,
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
          Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, SKU o código de barras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ minWidth: 120 }}
              >
                Filtros
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={showFilters}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Categoría"
                    value={filters.categoryId}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, categoryId: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                    size="small"
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Marca"
                    value={filters.brandId}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, brandId: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                    size="small"
                  >
                    <MenuItem value="">Todas las marcas</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Producto"
                    value={filters.productTypeId}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, productTypeId: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                    size="small"
                  >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    {productTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </Paper>

      {/* Vista de cards para móvil */}
      {isSmallScreen ? (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} key={product.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {product.name}
                          </Typography>
                          <Chip
                            label={product.isActive ? 'Activo' : 'Inactivo'}
                            color={product.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>

                        {product.barcode && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Código: {product.barcode}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                          {product.category && (
                            <Chip label={product.category.name} size="small" variant="outlined" />
                          )}
                          {product.brand && (
                            <Chip label={product.brand.name} size="small" variant="outlined" />
                          )}
                          {product.productType && (
                            <Chip label={product.productType.name} size="small" variant="outlined" />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Precio
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ${parseFloat(product.retailPrice).toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                              Stock
                            </Typography>
                            <Chip
                              label={product.currentStock}
                              color={product.currentStock <= product.minStock ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(product)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(product)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Paginación para cards */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                <Button
                  variant="outlined"
                  disabled={pagination.page === 0}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  Página {pagination.page + 1} de {Math.ceil(pagination.total / pagination.pageSize)}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize) - 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Siguiente
                </Button>
              </Box>
            </>
          )}
        </Box>
      ) : (
        /* Vista de tabla para desktop */
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={products}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onPageChange={(newPage) =>
              setPagination(prev => ({ ...prev, page: newPage }))
            }
            onPageSizeChange={(newPageSize) =>
              setPagination(prev => ({ ...prev, pageSize: newPageSize }))
            }
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            columnVisibilityModel={{
              barcode: window.innerWidth > 900,
              category: window.innerWidth > 900,
              brand: window.innerWidth > 900,
              productType: window.innerWidth > 900,
              isActive: window.innerWidth > 600
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              },
              '& .MuiDataGrid-columnHeaders': {
                minHeight: '48px !important'
              },
              '& .MuiDataGrid-cell': {
                padding: { xs: '8px 4px', sm: '8px 16px' }
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 600
              }
            }}
          />
        </Paper>
      )}

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        product={selectedProduct}
        onBarcodeCheck={handleBarcodeCheck}
      />

      <QuickStockDialog
        open={quickStockDialogOpen}
        onClose={() => {
          setQuickStockDialogOpen(false);
          setExistingProduct(null);
        }}
        onSave={handleQuickStockUpdate}
        product={existingProduct}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${selectedProduct?.name}"?`}
      />
    </Box>
  );
};

export default Products;
