const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);

module.exports = router;
