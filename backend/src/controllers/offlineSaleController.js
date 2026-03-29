const OfflineSale = require('../models/OfflineSale');
const Product = require('../models/Product');

// Admin: get offline sales
const getOfflineSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const end = new Date(req.query.dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [sales, total] = await Promise.all([
      OfflineSale.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OfflineSale.countDocuments(filter),
    ]);

    res.json({ sales, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// Admin: create offline sale
const createOfflineSale = async (req, res, next) => {
  try {
    const { productId, productName, qty, sellPrice, costPrice, deductStock, notes } = req.body;

    if (!productName || !qty || sellPrice === undefined) {
      return res.status(400).json({ message: 'Product name, quantity, and sell price are required' });
    }

    // Deduct stock if requested and product exists
    if (deductStock && productId) {
      const product = await Product.findById(productId);
      if (product) {
        if (product.stock < qty) {
          return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
        }
        product.stock -= qty;
        product.soldCount += qty;
        await product.save();
      }
    }

    const sale = await OfflineSale.create({
      productId: productId || undefined,
      productName,
      qty,
      sellPrice,
      costPrice: costPrice || 0,
      deductStock: !!deductStock,
      notes: notes || '',
    });

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

// Admin: delete offline sale
const deleteOfflineSale = async (req, res, next) => {
  try {
    const sale = await OfflineSale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOfflineSales, createOfflineSale, deleteOfflineSale };
