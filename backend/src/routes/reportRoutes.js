const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { sendDailyReport } = require('../controllers/reportController');

router.post('/daily', auth, sendDailyReport);

module.exports = router;
