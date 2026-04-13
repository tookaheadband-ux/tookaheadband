const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Page = require('../models/Page');
const AdminSettings = require('../models/AdminSettings');
const OfflineSale = require('../models/OfflineSale');
const Expense = require('../models/Expense');
const StockSubscription = require('../models/StockSubscription');
const ShippingZone = require('../models/ShippingZone');
const FlashSale = require('../models/FlashSale');
const Bundle = require('../models/Bundle');
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
    const [products, categories, orders, coupons, reviews, pages, offlineSales, expenses, stockSubscriptions, shippingZones, flashSales, bundles, adminSettings] = await Promise.all([
      Product.find().lean(),
      Category.find().lean(),
      Order.find().lean(),
      Coupon.find().lean(),
      Review.find().lean(),
      Page.find().lean(),
      OfflineSale.find().lean(),
      Expense.find().lean(),
      StockSubscription.find().lean(),
      ShippingZone.find().lean(),
      FlashSale.find().lean(),
      Bundle.find().lean(),
      AdminSettings.find().lean(),
    ]);

    const backup = { products, categories, orders, coupons, reviews, pages, offlineSales, expenses, stockSubscriptions, shippingZones, flashSales, bundles, adminSettings };
    const date = moment().tz('Africa/Cairo').format('YYYY-MM-DD');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tooka-backup-${date}.json`);
    res.json(backup);
  } catch (err) {
    next(err);
  }
};

// Admin: profit report (online + offline + shipping + expenses)
const getProfitReport = async (req, res, next) => {
  try {
    const OfflineSale = require('../models/OfflineSale');
    const Expense = require('../models/Expense');
    const { period, dateFrom, dateTo } = req.query;
    const now = moment().tz('Africa/Cairo');

    let startDate, endDate;

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'today':
          startDate = now.clone().startOf('day').toDate();
          endDate = now.clone().endOf('day').toDate();
          break;
        case 'week':
          startDate = now.clone().startOf('isoWeek').toDate();
          endDate = now.clone().endOf('day').toDate();
          break;
        case 'month':
          startDate = now.clone().startOf('month').toDate();
          endDate = now.clone().endOf('day').toDate();
          break;
        default:
          startDate = null;
          endDate = null;
      }
    }

    // --- ONLINE ORDERS ---
    const orderFilter = { status: { $ne: 'canceled' } };
    if (startDate && endDate) orderFilter.createdAt = { $gte: startDate, $lte: endDate };

    const [onlineItemsAgg, onlineShippingAgg] = await Promise.all([
      Order.aggregate([
        { $match: orderFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $multiply: ['$items.priceSnapshot', '$items.qty'] } },
            cost: { $sum: { $multiply: ['$items.costPriceSnapshot', '$items.qty'] } },
            itemsSold: { $sum: '$items.qty' },
            orderIds: { $addToSet: '$_id' },
          },
        },
      ]),
      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: null,
            shippingCharged: { $sum: '$shippingCost' },
            shippingActual: { $sum: '$shippingActualCost' },
            discount: { $sum: '$discount' },
            ordersCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const online = {
      revenue: onlineItemsAgg[0]?.revenue || 0,
      cost: onlineItemsAgg[0]?.cost || 0,
      profit: (onlineItemsAgg[0]?.revenue || 0) - (onlineItemsAgg[0]?.cost || 0),
      itemsSold: onlineItemsAgg[0]?.itemsSold || 0,
      ordersCount: onlineShippingAgg[0]?.ordersCount || 0,
      shippingCharged: onlineShippingAgg[0]?.shippingCharged || 0,
      shippingActual: onlineShippingAgg[0]?.shippingActual || 0,
      shippingProfit: (onlineShippingAgg[0]?.shippingCharged || 0) - (onlineShippingAgg[0]?.shippingActual || 0),
      discount: onlineShippingAgg[0]?.discount || 0,
    };

    // --- OFFLINE SALES ---
    const offlineFilter = {};
    if (startDate && endDate) offlineFilter.createdAt = { $gte: startDate, $lte: endDate };

    const offlineAgg = await OfflineSale.aggregate([
      { $match: offlineFilter },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ['$sellPrice', '$qty'] } },
          cost: { $sum: { $multiply: ['$costPrice', '$qty'] } },
          itemsSold: { $sum: '$qty' },
          salesCount: { $sum: 1 },
        },
      },
    ]);

    const offline = {
      revenue: offlineAgg[0]?.revenue || 0,
      cost: offlineAgg[0]?.cost || 0,
      profit: (offlineAgg[0]?.revenue || 0) - (offlineAgg[0]?.cost || 0),
      itemsSold: offlineAgg[0]?.itemsSold || 0,
      salesCount: offlineAgg[0]?.salesCount || 0,
    };

    // --- EXPENSES ---
    const expenseFilter = {};
    if (startDate && endDate) expenseFilter.date = { $gte: startDate, $lte: endDate };

    const expenseAgg = await Expense.aggregate([
      { $match: expenseFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const expenses = {
      total: expenseAgg[0]?.total || 0,
      count: expenseAgg[0]?.count || 0,
    };

    // --- GRAND TOTAL ---
    const grandTotal = {
      totalRevenue: online.revenue + offline.revenue,
      totalCost: online.cost + offline.cost,
      productProfit: online.profit + offline.profit,
      shippingProfit: online.shippingProfit,
      grossProfit: online.profit + offline.profit + online.shippingProfit,
      expenses: expenses.total,
      discount: online.discount,
      netProfit: online.profit + offline.profit + online.shippingProfit - expenses.total,
    };

    // --- PER-ORDER BREAKDOWN (latest 50) ---
    const orders = await Order.find(orderFilter).sort({ createdAt: -1 }).limit(50).lean();
    const orderProfits = orders.map((o) => {
      const itemRevenue = o.items.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0);
      const itemCost = o.items.reduce((sum, i) => sum + (i.costPriceSnapshot || 0) * i.qty, 0);
      const shipProfit = (o.shippingCost || 0) - (o.shippingActualCost || 0);
      return {
        _id: o._id,
        type: 'online',
        name: o.name,
        createdAt: o.createdAt,
        revenue: itemRevenue,
        cost: itemCost,
        profit: itemRevenue - itemCost,
        shippingProfit: shipProfit,
        discount: o.discount || 0,
        total: o.total,
        itemsSold: o.items.reduce((sum, i) => sum + i.qty, 0),
      };
    });

    // --- OFFLINE SALES BREAKDOWN (latest 50) ---
    const offlineSales = await OfflineSale.find(offlineFilter).sort({ createdAt: -1 }).limit(50).lean();
    const offlineProfits = offlineSales.map((s) => ({
      _id: s._id,
      type: 'offline',
      name: s.productName,
      createdAt: s.createdAt,
      revenue: s.sellPrice * s.qty,
      cost: s.costPrice * s.qty,
      profit: (s.sellPrice - s.costPrice) * s.qty,
      shippingProfit: 0,
      discount: 0,
      total: s.sellPrice * s.qty,
      itemsSold: s.qty,
      notes: s.notes,
    }));

    // Merge and sort by date
    const allTransactions = [...orderProfits, ...offlineProfits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);

    res.json({ online, offline, expenses, grandTotal, transactions: allTransactions });
  } catch (err) {
    next(err);
  }
};

// Admin: get site settings (contact info)
const getSiteSettings = async (req, res, next) => {
  try {
    const keys = ['contact_email', 'contact_phone'];
    const settings = await AdminSettings.find({ key: { $in: keys } });
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    // Defaults
    if (!result.contact_email) result.contact_email = 'tookaheadband@gmail.com';
    if (!result.contact_phone) result.contact_phone = '+201557788876';
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Admin: update site settings (contact info)
const updateSiteSettings = async (req, res, next) => {
  try {
    const { contact_email, contact_phone } = req.body;
    if (contact_email !== undefined) {
      await AdminSettings.findOneAndUpdate({ key: 'contact_email' }, { value: contact_email }, { upsert: true });
    }
    if (contact_phone !== undefined) {
      await AdminSettings.findOneAndUpdate({ key: 'contact_phone' }, { value: contact_phone }, { upsert: true });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, getDashboard, updateRelatedProducts, changePassword, backupDatabase, getProfitReport, getSiteSettings, updateSiteSettings };
