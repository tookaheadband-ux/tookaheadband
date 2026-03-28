const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const { login, getMe, getDashboard, updateRelatedProducts, changePassword, backupDatabase, getProfitReport, getSiteSettings, updateSiteSettings } = require('../controllers/adminController');
const { createProduct, updateProduct, deleteProduct, getProducts } = require('../controllers/productController');
const { createCategory, updateCategory, deleteCategory, getCategories } = require('../controllers/categoryController');
const { getOrders, updateOrderStatus, exportOrdersPdf } = require('../controllers/orderController');
const { updatePage } = require('../controllers/pageController');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { getAllReviews, deleteReview } = require('../controllers/reviewController');
const { getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone } = require('../controllers/shippingController');

// Auth
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/dashboard', auth, getDashboard);
router.put('/change-password', auth, changePassword);
router.get('/backup', auth, backupDatabase);
router.get('/profit', auth, getProfitReport);
router.get('/site-settings', auth, getSiteSettings);
router.put('/site-settings', auth, updateSiteSettings);

// Products (admin)
router.get('/products', auth, getProducts);
router.post('/products', auth, upload.array('images', 10), createProduct);
router.put('/products/:id', auth, upload.array('images', 10), updateProduct);
router.delete('/products/:id', auth, deleteProduct);

// Categories (admin)
router.get('/categories', auth, getCategories);
router.post('/categories', auth, upload.single('coverImage'), createCategory);
router.put('/categories/:id', auth, upload.single('coverImage'), updateCategory);
router.delete('/categories/:id', auth, deleteCategory);

// Orders (admin)
router.get('/orders', auth, getOrders);
router.get('/orders/export-pdf', auth, exportOrdersPdf);
router.patch('/orders/:id/status', auth, updateOrderStatus);

// Pages (admin)
router.put('/pages/:slug', auth, upload.array('images', 10), updatePage);

// Coupons (admin)
router.get('/coupons', auth, getCoupons);
router.post('/coupons', auth, createCoupon);
router.put('/coupons/:id', auth, updateCoupon);
router.delete('/coupons/:id', auth, deleteCoupon);

// Reviews (admin)
router.get('/reviews', auth, getAllReviews);
router.delete('/reviews/:id', auth, deleteReview);

// Shipping Zones (admin)
router.get('/shipping-zones', auth, getShippingZones);
router.post('/shipping-zones', auth, createShippingZone);
router.put('/shipping-zones/:id', auth, updateShippingZone);
router.delete('/shipping-zones/:id', auth, deleteShippingZone);

// Related Products (admin)
router.put('/products/:id/related', auth, updateRelatedProducts);

module.exports = router;
