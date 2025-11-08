import api from './api';

const authService = {
  // Login
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      const { user, token, refreshToken } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Obtener usuario actual
  async me() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService;
