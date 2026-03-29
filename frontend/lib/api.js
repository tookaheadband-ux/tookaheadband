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
export const adminChangePassword = (data) => api.put('/admin/change-password', data);
export const adminBackupDatabase = () => api.get('/admin/backup');
export const adminGetSiteSettings = () => api.get('/admin/site-settings');
export const adminUpdateSiteSettings = (data) => api.put('/admin/site-settings', data);
export const fetchSiteSettings = () => api.get('/site-settings');
export const fetchFeatureFlags = () => api.get('/feature-flags');
export const adminGetFeatureFlags = () => api.get('/admin/feature-flags');
export const adminUpdateFeatureFlags = (data) => api.put('/admin/feature-flags', data);
export const adminGetProfitReport = (params) => api.get('/admin/profit', { params });

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

// Shipping Zones (public)
export const fetchShippingZones = () => api.get('/shipping-zones');

// Shipping Zones (admin)
export const adminGetShippingZones = () => api.get('/admin/shipping-zones');
export const adminCreateShippingZone = (data) => api.post('/admin/shipping-zones', data);
export const adminUpdateShippingZone = (id, data) => api.put(`/admin/shipping-zones/${id}`, data);
export const adminDeleteShippingZone = (id) => api.delete(`/admin/shipping-zones/${id}`);

// Customers (admin)
export const adminGetCustomers = (params) => api.get('/admin/customers', { params });

// Flash Sales
export const fetchActiveFlashSales = () => api.get('/flash-sales');
export const fetchFlashSaleForProduct = (productId) => api.get(`/flash-sales/product/${productId}`);
export const adminGetFlashSales = () => api.get('/admin/flash-sales');
export const adminCreateFlashSale = (data) => api.post('/admin/flash-sales', data);
export const adminUpdateFlashSale = (id, data) => api.put(`/admin/flash-sales/${id}`, data);
export const adminDeleteFlashSale = (id) => api.delete(`/admin/flash-sales/${id}`);

// Bundles
export const fetchActiveBundles = () => api.get('/bundles');
export const adminGetBundles = () => api.get('/admin/bundles');
export const adminCreateBundle = (data) => api.post('/admin/bundles', data);
export const adminUpdateBundle = (id, data) => api.put(`/admin/bundles/${id}`, data);
export const adminDeleteBundle = (id) => api.delete(`/admin/bundles/${id}`);

// Social Proof
export const fetchSocialProof = () => api.get('/social-proof');

// Offline Sales (admin)
export const adminGetOfflineSales = (params) => api.get('/admin/offline-sales', { params });
export const adminCreateOfflineSale = (data) => api.post('/admin/offline-sales', data);
export const adminDeleteOfflineSale = (id) => api.delete(`/admin/offline-sales/${id}`);

// Expenses (admin)
export const adminGetExpenses = (params) => api.get('/admin/expenses', { params });
export const adminCreateExpense = (data) => api.post('/admin/expenses', data);
export const adminDeleteExpense = (id) => api.delete(`/admin/expenses/${id}`);

// Order Tracking (public)
export const trackOrder = (orderId, phone) => api.get("/orders/track", { params: { orderId, phone } });

// Related Products (admin)
export const adminUpdateRelatedProducts = (id, relatedProducts) => api.put(`/admin/products/${id}/related`, { relatedProducts });

export default api;
