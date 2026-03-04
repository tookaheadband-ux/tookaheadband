const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const moment = require('moment-timezone');

// Admin: login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USER) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with bcrypt hash or plain text from env
    const envPass = process.env.ADMIN_PASS;
    let isMatch = false;

    if (envPass.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, envPass);
    } else {
      isMatch = password === envPass;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, username });
  } catch (err) {
    next(err);
  }
};

// Admin: get current admin info
const getMe = async (req, res) => {
  res.json({ username: req.admin.username });
};

// Admin: dashboard stats
const getDashboard = async (req, res, next) => {
  try {
    const todayStart = moment().tz('Africa/Cairo').startOf('day').toDate();
    const todayEnd = moment().tz('Africa/Cairo').endOf('day').toDate();

    const [totalOrders, ordersToday, totalProducts, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'canceled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const estimatedRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalOrders,
      ordersToday,
      totalProducts,
      estimatedRevenue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, getDashboard };
