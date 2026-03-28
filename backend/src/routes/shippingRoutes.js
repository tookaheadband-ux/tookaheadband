const express = require('express');
const router = express.Router();
const { getShippingZones } = require('../controllers/shippingController');

// Public: get all shipping zones for checkout dropdown
router.get('/', getShippingZones);

module.exports = router;
