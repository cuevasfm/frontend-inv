import api from './api';

const priceListService = {
  // Obtener productos para lista de precios
  async getProductsForPriceList(params = {}) {
    try {
      const response = await api.get('/products/price-list', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default priceListService;
