const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getBestSellers, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { createReview, getReviews } = require('../controllers/reviewController');
const { subscribeNotifyMe } = require('../controllers/stockController');
const auth = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getProduct);

// Reviews (public)
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', createReview);

// Back in Stock (public)
router.post('/:id/notify-me', subscribeNotifyMe);

module.exports = router;
