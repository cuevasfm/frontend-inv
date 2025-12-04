import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Fab,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalBar as LocalBarIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import productTypeService from '../services/productTypeService';
import ProductTypeDialog from '../components/catalog/ProductTypeDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const ProductTypes = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    setLoading(true);
    try {
      const data = await productTypeService.getAll();
      // Ordenar por displayOrder
      const sorted = (data.productTypes || []).sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setProductTypes(sorted);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al cargar tipos de producto',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProductType(null);
    setDialogOpen(true);
  };

  const handleEdit = (productType) => {
    setSelectedProductType(productType);
    setDialogOpen(true);
  };

  const handleDeleteClick = (productType) => {
    setSelectedProductType(productType);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await productTypeService.delete(selectedProductType.id);
      enqueueSnackbar('Tipo de producto eliminado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadProductTypes();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al eliminar tipo de producto',
        { variant: 'error' }
      );
    }
  };

  const handleSave = async (productTypeData) => {
    try {
      if (selectedProductType) {
        await productTypeService.update(selectedProductType.id, productTypeData);
        enqueueSnackbar('Tipo de producto actualizado exitosamente', { variant: 'success' });
      } else {
        await productTypeService.create(productTypeData);
        enqueueSnackbar('Tipo de producto creado exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadProductTypes();
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      field: 'displayOrder',
      headerName: 'Orden',
      width: 100,
      align: 'center'
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
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

  // Vista móvil con tarjetas
  const MobileView = () => (
    <Box sx={{ pb: 10 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : productTypes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocalBarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No hay tipos de producto registrados
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Crea tu primer tipo de producto
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {productTypes.map((productType) => (
            <Grid item xs={12} sm={6} key={productType.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                      {productType.name}
                    </Typography>
                    <Chip 
                      label={`Orden: ${productType.displayOrder || 0}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(productType)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(productType)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        onClick={handleCreate}
      >
        <AddIcon />
      </Fab>
    </Box>
  );

  // Vista de escritorio con tabla
  const DesktopView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Tipos de Producto
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Tipo
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={productTypes}
          columns={columns}
          autoHeight
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {isMobile ? <MobileView /> : <DesktopView />}

      <ProductTypeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        productType={selectedProductType}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Tipo de Producto"
        message={`¿Estás seguro de que deseas eliminar el tipo de producto "${selectedProductType?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ProductTypes;

