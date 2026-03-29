const FlashSale = require('../models/FlashSale');

// Public: get active flash sales
const getActiveFlashSales = async (req, res, next) => {
  try {
    const now = new Date();
    const sales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gt: now },
    }).populate('productId', 'nameAr nameEn price images stock sku');
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

// Public: get flash sale for a specific product
const getFlashSaleForProduct = async (req, res, next) => {
  try {
    const now = new Date();
    const sale = await FlashSale.findOne({
      productId: req.params.productId,
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gt: now },
    });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// Admin: get all flash sales
const adminGetFlashSales = async (req, res, next) => {
  try {
    const sales = await FlashSale.find().sort({ createdAt: -1 }).populate('productId', 'nameAr nameEn price images sku');
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

// Admin: create flash sale
const adminCreateFlashSale = async (req, res, next) => {
  try {
    const { productId, discountedPrice, startTime, endTime } = req.body;
    if (!productId || discountedPrice === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const sale = await FlashSale.create({ productId, discountedPrice, startTime, endTime });
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

// Admin: update flash sale
const adminUpdateFlashSale = async (req, res, next) => {
  try {
    const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// Admin: delete flash sale
const adminDeleteFlashSale = async (req, res, next) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flash sale deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActiveFlashSales, getFlashSaleForProduct, adminGetFlashSales, adminCreateFlashSale, adminUpdateFlashSale, adminDeleteFlashSale };
