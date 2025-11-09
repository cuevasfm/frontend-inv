import api from './api';

const saleService = {
  // Crear nueva venta
  async create(saleData) {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener todas las ventas
  async getAll(params = {}) {
    try {
      const response = await api.get('/sales', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener una venta por ID
  async getById(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancelar venta
  async cancel(id, reason) {
    try {
      const response = await api.post(`/sales/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener resumen de ventas
  async getSummary(params = {}) {
    try {
      const response = await api.get('/sales/summary', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default saleService;

