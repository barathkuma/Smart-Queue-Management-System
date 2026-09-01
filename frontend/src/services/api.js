import axios from 'axios';

// Base API instance
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_queue_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh on 401 Expired Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('smart_queue_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${apiBaseURL}/auth/refresh/`, { refresh: refreshToken });
          const newAccessToken = res.data.access;

          localStorage.setItem('smart_queue_access_token', newAccessToken);
          if (res.data.refresh) {
            localStorage.setItem('smart_queue_refresh_token', res.data.refresh);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // Token refresh failed - clean storage and redirect
          localStorage.removeItem('smart_queue_access_token');
          localStorage.removeItem('smart_queue_refresh_token');
          localStorage.removeItem('smart_queue_user');
          window.location.href = '/login?expired=1';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
