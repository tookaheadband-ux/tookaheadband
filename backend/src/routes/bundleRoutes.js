const express = require('express');
const router = express.Router();
const { getActiveBundles } = require('../controllers/bundleController');

router.get('/', getActiveBundles);

module.exports = router;
