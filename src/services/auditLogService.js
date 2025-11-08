import api from './api';

const auditLogService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getStats(params = {}) {
    try {
      const response = await api.get('/audit-logs/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default auditLogService;
