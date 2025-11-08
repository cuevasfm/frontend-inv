import api from './api';

const reportService = {
  // Obtener reporte de inventario
  async getInventoryReport() {
    try {
      const response = await api.get('/reports/inventory');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default reportService;
