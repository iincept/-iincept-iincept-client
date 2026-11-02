import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Helper to determine if a request is for the Admin Panel
const isAdminRequest = (config) => {
  if (config.useAdminAuth || config.headers?.useAdminToken) {
    return true;
  }
  if (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin')) {
    return true;
  }
  return false;
};

// Request interceptor: Strictly isolates admin_token and customer token
axiosClient.interceptors.request.use(
  (config) => {
    try {
      if (isAdminRequest(config)) {
        // Admin requests use ONLY admin_token and never customer token
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
      } else {
        // Customer requests use ONLY customer token and never admin_token
        const customerToken = localStorage.getItem('token');
        if (customerToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${customerToken}`;
        }
      }
    } catch (err) {
      // Ignore localStorage read errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handles 401 token invalidation without cross-contamination
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error.response && error.response.status === 401) {
        const config = error.config || {};
        if (isAdminRequest(config)) {
          // Invalidate strictly only admin keys
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else {
          // Invalidate strictly only customer keys
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (err) {
      // Ignore errors during interceptor handling
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
