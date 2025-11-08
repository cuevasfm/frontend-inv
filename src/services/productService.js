import api from './api';

const productService = {
  // Obtener todos los productos
  async getAll(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener un producto por ID
  async getById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar producto por código de barras
  async getByBarcode(barcode) {
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Producto no encontrado
      }
      throw error.response?.data || error;
    }
  },

  // Crear producto
  async create(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar producto
  async update(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Eliminar producto
  async delete(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ajustar stock
  async adjustStock(id, quantity, notes) {
    try {
      const response = await api.post(`/products/${id}/adjust-stock`, {
        quantity,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener productos con stock bajo
  async getLowStock() {
    try {
      const response = await api.get('/products/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default productService;
