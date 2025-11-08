import api from './api';

const customerService = {
  // Obtener todos los clientes
  async getAll(params = {}) {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener un cliente por ID
  async getById(id) {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Crear nuevo cliente
  async create(customerData) {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar cliente
  async update(id, customerData) {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar cliente
  async delete(id) {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default customerService;
