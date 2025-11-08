import api from './api';

const productService = {
  getAll: (params) => api.get('/products', { params }),
  
  getById: (id) => api.get(`/products/${id}`),
  
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  
  create: (productData) => api.post('/products', productData),
  
  update: (id, productData) => api.put(`/products/${id}`, productData),
  
  delete: (id) => api.delete(`/products/${id}`),
  
  restore: (id) => api.post(`/products/${id}/restore`),
  
  adjustStock: (id, quantity, reason) => 
    api.post(`/products/${id}/adjust-stock`, { quantity, reason }),
  
  getLowStock: () => api.get('/products/low-stock'),
  
  getPriceList: () => api.get('/products/price-list')
};

export default productService;
