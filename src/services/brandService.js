import api from './api';

const brandService = {
  // Obtener todas las marcas
  getAll: async () => {
    const response = await api.get('/brands');
    return response.data;
  },

  // Obtener marca por ID
  getById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  // Crear marca
  create: async (brandData) => {
    const response = await api.post('/brands', brandData);
    return response.data;
  },

  // Actualizar marca
  update: async (id, brandData) => {
    const response = await api.put(`/brands/${id}`, brandData);
    return response.data;
  },

  // Eliminar marca
  delete: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  }
};

export default brandService;
