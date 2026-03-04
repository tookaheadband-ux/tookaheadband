const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer } = require('../services/emailService');
const { sendNewOrderNotification, sendLowStockAlert } = require('../services/telegramService');

// Public: create order
const createOrder = async (req, res, next) => {
  try {
    const { name, phone, address, email, notes, items } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Name, phone, and address are required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Build order items with snapshots and calculate total
    const orderItems = [];
    let total = 0;

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
        productNameSnapshot: product.nameEn || product.nameAr,
        priceSnapshot: product.price,
        qty: item.qty,
        imageSnapshot: product.images[0] || '',
      });

      total += product.price * item.qty;

      // Decrease stock and increment sold count
      product.stock -= item.qty;
      product.soldCount += item.qty;
      await product.save();

      // Check low stock
      if (product.stock <= 3) {
        sendLowStockAlert(product).catch((e) => console.error('Low stock alert error:', e));
      }
    }

    const order = await Order.create({
      name,
      phone,
      address,
      email: email || '',
      notes: notes || '',
      items: orderItems,
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

// Admin: get orders with pagination
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
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

// Admin: update order status
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

    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
