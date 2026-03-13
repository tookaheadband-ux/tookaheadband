import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('toka-admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Public API
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchProduct = (id) => api.get(`/products/${id}`);
export const fetchBestSellers = (limit = 8) => api.get('/products/best-sellers', { params: { limit } });
export const fetchCategories = () => api.get('/categories');
export const createOrder = (data) => api.post('/orders', data);
export const fetchPage = (slug) => api.get(`/pages/${slug}`);

// Admin API
export const adminLogin = (data) => api.post('/admin/login', data);
export const adminGetMe = () => api.get('/admin/me');
export const adminDashboard = () => api.get('/admin/dashboard');

export const adminGetProducts = (params) => api.get('/admin/products', { params });
export const adminCreateProduct = (formData) =>
  api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);

export const adminGetCategories = () => api.get('/admin/categories');
export const adminCreateCategory = (formData) =>
  api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateCategory = (id, formData) =>
  api.put(`/admin/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

export const adminGetOrders = (params) => api.get('/admin/orders', { params });
export const adminUpdateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });
export const adminExportOrdersPdf = (params) =>
  api.get('/admin/orders/export-pdf', { params, responseType: 'blob' });

export const adminUpdatePage = (slug, formData) =>
  api.put(`/admin/pages/${slug}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const adminSendDailyReport = () => api.post('/admin/reports/daily');

// Coupons
export const validateCoupon = (data) => api.post('/coupons/validate', data);
export const adminGetCoupons = () => api.get('/admin/coupons');
export const adminCreateCoupon = (data) => api.post('/admin/coupons', data);
export const adminUpdateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const adminDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);

// Reviews
export const getProductReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const createProductReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);
export const adminGetReviews = (params) => api.get('/admin/reviews', { params });
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}`);

// Back in Stock
export const subscribeNotifyMe = (productId, email) => api.post(`/products/${productId}/notify-me`, { email });

// Order Tracking (public)
export const trackOrder = (orderId, phone) => api.get("/orders/track", { params: { orderId, phone } });

// Related Products (admin)
export const adminUpdateRelatedProducts = (id, relatedProducts) => api.put(`/admin/products/${id}/related`, { relatedProducts });

export default api;
