const express = require('express');
const router = express.Router();
const { createOrder, trackOrder } = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);
router.get('/track', trackOrder);

module.exports = router;
