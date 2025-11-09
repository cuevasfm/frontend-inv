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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as BrandIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import brandService from '../services/brandService';
import BrandDialog from '../components/catalog/BrandDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Brands = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await brandService.getAll();
      setBrands(data.brands || []);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al cargar marcas',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setDialogOpen(true);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await brandService.delete(selectedBrand.id);
      enqueueSnackbar('Marca eliminada exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadBrands();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al eliminar marca',
        { variant: 'error' }
      );
    }
  };

  const handleSave = async (brandData) => {
    try {
      if (selectedBrand) {
        await brandService.update(selectedBrand.id, brandData);
        enqueueSnackbar('Marca actualizada exitosamente', { variant: 'success' });
      } else {
        await brandService.create(brandData);
        enqueueSnackbar('Marca creada exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadBrands();
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 2,
      minWidth: 300
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
      ) : brands.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BrandIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay marcas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toca el botón + para crear una nueva marca
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {brands.map((brand) => (
            <Grid item xs={12} key={brand.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BrandIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {brand.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {brand.description || 'Sin descripción'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <IconButton
                    onClick={() => handleEdit(brand)}
                    color="primary"
                    size="large"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(brand)}
                    color="error"
                    size="large"
                  >
                    <DeleteIcon />
                  </IconButton>
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

  // Vista desktop con DataGrid
  const DesktopView = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Marcas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Marca
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={brands}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Paper>
    </Box>
  );

  return (
    <Box>
      {/* Header solo en móvil */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5">
            Marcas
          </Typography>
        </Box>
      )}

      {/* Vista condicional */}
      {isMobile ? <MobileView /> : <DesktopView />}

      <BrandDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        brand={selectedBrand}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Marca"
        message={`¿Estás seguro de que deseas eliminar la marca "${selectedBrand?.name}"?`}
      />
    </Box>
  );
};

export default Brands;
