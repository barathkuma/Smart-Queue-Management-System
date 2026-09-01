import api from './api';

export const authService = {
  /**
   * Log in user with email and password
   */
  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    const { user, tokens } = response.data;
    if (tokens?.access) {
      localStorage.setItem('smart_queue_access_token', tokens.access);
      localStorage.setItem('smart_queue_refresh_token', tokens.refresh);
      localStorage.setItem('smart_queue_user', JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data) {
    const response = await api.post('/auth/register/', data);
    const { user, tokens } = response.data;
    if (tokens?.access) {
      localStorage.setItem('smart_queue_access_token', tokens.access);
      localStorage.setItem('smart_queue_refresh_token', tokens.refresh);
      localStorage.setItem('smart_queue_user', JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   */
  async getMe() {
    const response = await api.get('/auth/me/');
    localStorage.setItem('smart_queue_user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Update current user's profile
   */
  async updateProfile(data) {
    const response = await api.patch('/auth/me/', data);
    localStorage.setItem('smart_queue_user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Log out current user and invalidate refresh token
   */
  async logout() {
    const refresh = localStorage.getItem('smart_queue_refresh_token');
    try {
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('smart_queue_access_token');
      localStorage.removeItem('smart_queue_refresh_token');
      localStorage.removeItem('smart_queue_user');
    }
  },

  /**
   * Get cached user & token from storage
   */
  getStoredAuth() {
    const token = localStorage.getItem('smart_queue_access_token');
    const userJson = localStorage.getItem('smart_queue_user');
    let user = null;
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      user = null;
    }
    return { token, user };
  }
};
