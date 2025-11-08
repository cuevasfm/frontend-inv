import api from './api';

const productTypeService = {
  // Obtener todos los tipos de producto
  getAll: async () => {
    const response = await api.get('/product-types');
    return response.data;
  },

  // Obtener tipo de producto por ID
  getById: async (id) => {
    const response = await api.get(`/product-types/${id}`);
    return response.data;
  },

  // Crear tipo de producto
  create: async (productTypeData) => {
    const response = await api.post('/product-types', productTypeData);
    return response.data;
  },

  // Actualizar tipo de producto
  update: async (id, productTypeData) => {
    const response = await api.put(`/product-types/${id}`, productTypeData);
    return response.data;
  },

  // Eliminar tipo de producto
  delete: async (id) => {
    const response = await api.delete(`/product-types/${id}`);
    return response.data;
  }
};

export default productTypeService;
