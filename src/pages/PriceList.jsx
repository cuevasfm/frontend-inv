import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import priceListService from '../services/priceListService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import productTypeService from '../services/productTypeService';

const PriceList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  const [config, setConfig] = useState({
    groupBy: 'category',
    sortBy: 'name',
    sortOrder: 'ASC',
    categoryId: '',
    brandId: '',
    productTypeId: '',
    includeStock: false,
    includeWholesale: true
  });

  // Cargar catálogos
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

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Obtener datos del servidor
      const data = await priceListService.getProductsForPriceList(config);

      if (!data.products || (Array.isArray(data.products) && data.products.length === 0) ||
          (typeof data.products === 'object' && Object.keys(data.products).length === 0)) {
        enqueueSnackbar('No hay productos para generar la lista', { variant: 'warning' });
        setLoading(false);
        return;
      }

      // Crear PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(18);
      doc.text('Lista de Precios', pageWidth / 2, 15, { align: 'center' });

      // Fecha
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Fecha: ${today}`, pageWidth / 2, 22, { align: 'center' });

      let yPosition = 30;

      // Si está agrupado
      if (data.grouped) {
        const groups = Object.values(data.products);

        groups.forEach((group, groupIndex) => {
          // Verificar si necesitamos nueva página
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          // Título del grupo
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(group.groupName, 14, yPosition);
          yPosition += 8;

          // Preparar datos de la tabla
          const tableData = group.products.map(product => {
            const row = [
              product.barcode || '-',
              product.name,
              product.volumeMl ? `${product.volumeMl} ml` : '-',
              `$${parseFloat(product.retailPrice).toFixed(2)}`
            ];

            if (config.includeWholesale) {
              if (product.wholesalePrice) {
                row.push(`$${parseFloat(product.wholesalePrice).toFixed(2)}`);
                row.push(`${product.wholesaleMinQuantity || 12} pzs`);
              } else {
                row.push('-');
                row.push('-');
              }
            }

            if (config.includeStock) {
              row.push(product.currentStock || 0);
            }

            return row;
          });

          // Definir columnas
          const columns = [
            { header: 'Código', dataKey: 'barcode' },
            { header: 'Producto', dataKey: 'name' },
            { header: 'Contenido', dataKey: 'volume' },
            { header: 'Precio', dataKey: 'price' }
          ];

          if (config.includeWholesale) {
            columns.push({ header: 'Mayoreo', dataKey: 'wholesale' });
            columns.push({ header: 'Mín.', dataKey: 'min' });
          }

          if (config.includeStock) {
            columns.push({ header: 'Stock', dataKey: 'stock' });
          }

          // Construir columnStyles dinámicamente
          let colIndex = 0;
          const columnStyles = {
            [colIndex++]: { cellWidth: 25 }, // Código
            [colIndex++]: { cellWidth: 'auto' }, // Producto
            [colIndex++]: { cellWidth: 20 }, // Contenido
            [colIndex++]: { cellWidth: 20 }  // Precio
          };

          if (config.includeWholesale) {
            columnStyles[colIndex++] = { cellWidth: 20 }; // Mayoreo
            columnStyles[colIndex++] = { cellWidth: 15 }; // Mín
          }

          if (config.includeStock) {
            columnStyles[colIndex++] = { cellWidth: 15 }; // Stock
          }

          // Generar tabla
          autoTable(doc, {
            startY: yPosition,
            head: [columns.map(col => col.header)],
            body: tableData,
            theme: 'striped',
            headStyles: {
              fillColor: [63, 81, 181],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9
            },
            bodyStyles: {
              fontSize: 8
            },
            columnStyles,
            margin: { left: 14, right: 14 }
          });

          yPosition = doc.lastAutoTable.finalY + 10;
        });
      } else {
        // Sin agrupar, tabla simple
        const tableData = data.products.map(product => {
          const row = [
            product.barcode || '-',
            product.name,
            product.category?.name || '-',
            product.brand?.name || '-',
            product.volumeMl ? `${product.volumeMl} ml` : '-',
            `$${parseFloat(product.retailPrice).toFixed(2)}`
          ];

          if (config.includeWholesale) {
            if (product.wholesalePrice) {
              row.push(`$${parseFloat(product.wholesalePrice).toFixed(2)}`);
              row.push(`${product.wholesaleMinQuantity || 12} pzs`);
            } else {
              row.push('-');
              row.push('-');
            }
          }

          if (config.includeStock) {
            row.push(product.currentStock || 0);
          }

          return row;
        });

        const columns = [
          { header: 'Código', dataKey: 'barcode' },
          { header: 'Producto', dataKey: 'name' },
          { header: 'Categoría', dataKey: 'category' },
          { header: 'Marca', dataKey: 'brand' },
          { header: 'Contenido', dataKey: 'volume' },
          { header: 'Precio', dataKey: 'price' }
        ];

        if (config.includeWholesale) {
          columns.push({ header: 'Mayoreo', dataKey: 'wholesale' });
          columns.push({ header: 'Mín.', dataKey: 'min' });
        }

        if (config.includeStock) {
          columns.push({ header: 'Stock', dataKey: 'stock' });
        }

        // Construir columnStyles dinámicamente
        let colIndex = 0;
        const columnStyles = {
          [colIndex++]: { cellWidth: 20 }, // Código
          [colIndex++]: { cellWidth: 'auto' }, // Producto
          [colIndex++]: { cellWidth: 25 }, // Categoría
          [colIndex++]: { cellWidth: 25 }, // Marca
          [colIndex++]: { cellWidth: 18 }, // Contenido
          [colIndex++]: { cellWidth: 18 }  // Precio
        };

        if (config.includeWholesale) {
          columnStyles[colIndex++] = { cellWidth: 18 }; // Mayoreo
          columnStyles[colIndex++] = { cellWidth: 12 }; // Mín
        }

        if (config.includeStock) {
          columnStyles[colIndex++] = { cellWidth: 12 }; // Stock
        }

        autoTable(doc, {
          startY: yPosition,
          head: [columns.map(col => col.header)],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8
          },
          columnStyles,
          margin: { left: 14, right: 14 }
        });
      }

      // Descargar PDF
      const fileName = `lista_precios_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      enqueueSnackbar('Lista de precios generada exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      enqueueSnackbar(
        error.message || 'Error al generar lista de precios',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Listas de Precios
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Lista
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          {/* Agrupar por */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Agrupar por"
              value={config.groupBy}
              onChange={(e) => handleConfigChange('groupBy', e.target.value)}
            >
              <MenuItem value="none">Sin agrupar</MenuItem>
              <MenuItem value="category">Categoría</MenuItem>
              <MenuItem value="brand">Marca</MenuItem>
              <MenuItem value="productType">Tipo de Producto</MenuItem>
            </TextField>
          </Grid>

          {/* Ordenar por */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Ordenar por"
              value={config.sortBy}
              onChange={(e) => handleConfigChange('sortBy', e.target.value)}
            >
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="retailPrice">Precio</MenuItem>
              <MenuItem value="currentStock">Stock</MenuItem>
            </TextField>
          </Grid>

          {/* Orden */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Orden"
              value={config.sortOrder}
              onChange={(e) => handleConfigChange('sortOrder', e.target.value)}
            >
              <MenuItem value="ASC">Ascendente</MenuItem>
              <MenuItem value="DESC">Descendente</MenuItem>
            </TextField>
          </Grid>

          {/* Filtros opcionales */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Filtros (Opcional)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Categoría"
              value={config.categoryId}
              onChange={(e) => handleConfigChange('categoryId', e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Marca"
              value={config.brandId}
              onChange={(e) => handleConfigChange('brandId', e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Tipo"
              value={config.productTypeId}
              onChange={(e) => handleConfigChange('productTypeId', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {productTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Incluir precio de mayoreo */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.includeWholesale}
                  onChange={(e) => handleConfigChange('includeWholesale', e.target.checked)}
                />
              }
              label="Incluir precio de mayoreo"
            />
          </Grid>

          {/* Incluir stock */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.includeStock}
                  onChange={(e) => handleConfigChange('includeStock', e.target.checked)}
                />
              }
              label="Incluir cantidad en stock"
            />
          </Grid>

          {/* Botones */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PdfIcon />}
                onClick={generatePDF}
                disabled={loading}
                size="large"
              >
                {loading ? 'Generando...' : 'Generar PDF'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setConfig({
                  groupBy: 'category',
                  sortBy: 'name',
                  sortOrder: 'ASC',
                  categoryId: '',
                  brandId: '',
                  productTypeId: '',
                  includeStock: false,
                  includeWholesale: true
                })}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PriceList;
