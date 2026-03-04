const express = require('express');
const router = express.Router();
const { getPage } = require('../controllers/pageController');

// Public routes
router.get('/:slug', getPage);

module.exports = router;
