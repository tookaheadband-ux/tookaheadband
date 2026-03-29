const Bundle = require('../models/Bundle');

// Public: get active bundles
const getActiveBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find({ isActive: true }).populate('products', 'nameAr nameEn price images stock sku');
    res.json(bundles);
  } catch (err) {
    next(err);
  }
};

// Admin: get all bundles
const adminGetBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find().sort({ createdAt: -1 }).populate('products', 'nameAr nameEn price images sku');
    res.json(bundles);
  } catch (err) {
    next(err);
  }
};

// Admin: create bundle
const adminCreateBundle = async (req, res, next) => {
  try {
    const { nameAr, nameEn, descriptionAr, descriptionEn, products, bundlePrice, image } = req.body;
    if (!products || products.length === 0 || !bundlePrice) {
      return res.status(400).json({ message: 'Products and bundle price are required' });
    }
    const bundle = await Bundle.create({ nameAr, nameEn, descriptionAr, descriptionEn, products, bundlePrice, image });
    res.status(201).json(bundle);
  } catch (err) {
    next(err);
  }
};

// Admin: update bundle
const adminUpdateBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json(bundle);
  } catch (err) {
    next(err);
  }
};

// Admin: delete bundle
const adminDeleteBundle = async (req, res, next) => {
  try {
    await Bundle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bundle deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActiveBundles, adminGetBundles, adminCreateBundle, adminUpdateBundle, adminDeleteBundle };
