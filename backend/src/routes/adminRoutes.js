const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const { login, getMe, getDashboard } = require('../controllers/adminController');
const { createProduct, updateProduct, deleteProduct, getProducts } = require('../controllers/productController');
const { createCategory, updateCategory, deleteCategory, getCategories } = require('../controllers/categoryController');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { updatePage } = require('../controllers/pageController');

// Auth
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/dashboard', auth, getDashboard);

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
router.patch('/orders/:id/status', auth, updateOrderStatus);

// Pages (admin)
router.put('/pages/:slug', auth, upload.array('images', 10), updatePage);

module.exports = router;
