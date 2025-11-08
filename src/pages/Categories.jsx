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
import categoryService from '../services/categoryService';
import CategoryDialog from '../components/catalog/CategoryDialog';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';

const Categories = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data.categories || []);
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al cargar categorías',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await categoryService.delete(selectedCategory.id);
      enqueueSnackbar('Categoría eliminada exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      loadCategories();
    } catch (error) {
      enqueueSnackbar(
        error.message || 'Error al eliminar categoría',
        { variant: 'error' }
      );
    }
  };

  const handleSave = async (categoryData) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, categoryData);
        enqueueSnackbar('Categoría actualizada exitosamente', { variant: 'success' });
      } else {
        await categoryService.create(categoryData);
        enqueueSnackbar('Categoría creada exitosamente', { variant: 'success' });
      }
      setDialogOpen(false);
      loadCategories();
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
          Categorías
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Categoría
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={categories}
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

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        category={selectedCategory}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory?.name}"?`}
      />
    </Box>
  );
};

export default Categories;
