import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import brandService from '../services/brandService';
import BrandDialog from '../components/catalog/BrandDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Brands = () => {
  const { enqueueSnackbar } = useSnackbar();
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

  return (
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
