const Coupon = require('../models/Coupon');

// Public: validate coupon code
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    const check = coupon.isValid(orderTotal || 0);
    if (!check.valid) return res.status(400).json({ message: check.message });

    const discount = coupon.calculateDiscount(orderTotal || 0);

    res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: list all coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

// Admin: create coupon
const createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt, isActive } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrder: minOrder || 0,
      maxUses: maxUses || 0,
      expiresAt: expiresAt || null,
      isActive: isActive !== false,
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
    next(err);
  }
};

// Admin: update coupon
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

// Admin: delete coupon
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
