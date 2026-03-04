const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getBestSellers, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const auth = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getProduct);

module.exports = router;
