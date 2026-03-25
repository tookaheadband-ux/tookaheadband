const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Page = require('../models/Page');
const AdminSettings = require('../models/AdminSettings');
const moment = require('moment-timezone');

// Helper: get current admin password (DB first, then env fallback)
const getAdminPassword = async () => {
  const setting = await AdminSettings.findOne({ key: 'admin_password' });
  return setting ? setting.value : process.env.ADMIN_PASS;
};

// Admin: login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USER) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const storedPass = await getAdminPassword();
    let isMatch = false;

    if (storedPass.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, storedPass);
    } else {
      isMatch = password === storedPass;
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


// Admin: update related products for a product
const updateRelatedProducts = async (req, res, next) => {
  try {
    const { relatedProducts } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { relatedProducts: relatedProducts || [] },
      { new: true }
    ).populate('relatedProducts', 'nameAr nameEn price images');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const storedPass = await getAdminPassword();
    let isMatch = false;

    if (storedPass.startsWith('$2')) {
      isMatch = await bcrypt.compare(currentPassword, storedPass);
    } else {
      isMatch = currentPassword === storedPass;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await AdminSettings.findOneAndUpdate(
      { key: 'admin_password' },
      { value: hashedPassword },
      { upsert: true }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// Admin: backup entire database
const backupDatabase = async (req, res, next) => {
  try {
    const [products, categories, orders, coupons, reviews, pages] = await Promise.all([
      Product.find().lean(),
      Category.find().lean(),
      Order.find().lean(),
      Coupon.find().lean(),
      Review.find().lean(),
      Page.find().lean(),
    ]);

    const backup = { products, categories, orders, coupons, reviews, pages };
    const date = moment().tz('Africa/Cairo').format('YYYY-MM-DD');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tooka-backup-${date}.json`);
    res.json(backup);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, getDashboard, updateRelatedProducts, changePassword, backupDatabase };
