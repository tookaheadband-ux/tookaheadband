const express = require('express');
const router = express.Router();
const { getActiveFlashSales, getFlashSaleForProduct } = require('../controllers/flashSaleController');

router.get('/', getActiveFlashSales);
router.get('/product/:productId', getFlashSaleForProduct);

module.exports = router;
