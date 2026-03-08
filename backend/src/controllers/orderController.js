const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdateToCustomer } = require('../services/emailService');
const { sendNewOrderNotification, sendLowStockAlert } = require('../services/telegramService');
const { generateDailyReport } = require('../services/pdfService');

// Public: create order
const createOrder = async (req, res, next) => {
  try {
    const { name, phone, address, email, notes, items, couponCode } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Name, phone, and address are required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Build order items with snapshots and calculate total
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.qty) {
        const productName = product.nameEn || product.nameAr;
        return res.status(400).json({ message: `Insufficient stock for "${productName}"` });
      }

      orderItems.push({
        productId: product._id,
        skuSnapshot: product.sku || '',
        productNameSnapshot: product.nameEn || product.nameAr,
        priceSnapshot: product.price,
        qty: item.qty,
        imageSnapshot: product.images[0] || '',
      });

      subtotal += product.price * item.qty;

      // Decrease stock and increment sold count
      product.stock -= item.qty;
      product.soldCount += item.qty;
      await product.save();

      // Check low stock
      if (product.stock <= 3) {
        sendLowStockAlert(product).catch((e) => console.error('Low stock alert error:', e));
      }
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCouponCode = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const check = coupon.isValid(subtotal);
        if (check.valid) {
          discount = coupon.calculateDiscount(subtotal);
          appliedCouponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const total = subtotal - discount;

    const order = await Order.create({
      name,
      phone,
      address,
      email: email || '',
      notes: notes || '',
      items: orderItems,
      subtotal,
      couponCode: appliedCouponCode,
      discount,
      total,
    });

    // Send notifications (non-blocking)
    sendNewOrderNotification(order).catch((e) => console.error('Telegram error:', e));
    sendOrderConfirmationToAdmin(order).catch((e) => console.error('Admin email error:', e));
    sendOrderConfirmationToCustomer(order).catch((e) => console.error('Customer email error:', e));

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Admin: get orders with pagination, search, date filters
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search by name, phone, or SKU
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { 'items.skuSnapshot': searchRegex },
        { 'items.productNameSnapshot': searchRegex },
      ];
    }

    // Date range filters
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        const endDate = new Date(req.query.dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: update order status + send email notification
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'shipped', 'delivered', 'canceled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send status update email to customer (non-blocking)
    sendOrderStatusUpdateToCustomer(order, status).catch((e) => console.error('Status email error:', e));

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Admin: export orders as PDF
const exportOrdersPdf = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { 'items.skuSnapshot': searchRegex },
      ];
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const endDate = new Date(req.query.dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);
    const pdfBuffer = await generateDailyReport(orders);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=TOOKA_Orders_${new Date().toISOString().split('T')[0]}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};


// Public: track order by orderId + phone
const trackOrder = async (req, res, next) => {
  try {
    const { orderId, phone } = req.query;
    if (!orderId || !phone) {
      return res.status(400).json({ message: 'orderId and phone are required' });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify phone matches (last 8 digits to handle formatting differences)
    const cleanQueryPhone = phone.replace(/\D/g, '').slice(-8);
    const cleanOrderPhone = order.phone.replace(/\D/g, '').slice(-8);
    if (cleanQueryPhone !== cleanOrderPhone) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      _id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      name: order.name,
      items: order.items.map(item => ({
        productNameSnapshot: item.productNameSnapshot,
        priceSnapshot: item.priceSnapshot,
        qty: item.qty,
        imageSnapshot: item.imageSnapshot,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      couponCode: order.couponCode,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, exportOrdersPdf, trackOrder };
