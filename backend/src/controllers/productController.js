const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// Public: get products with pagination, filtering, search
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};

    // Category filter
    if (req.query.category) {
      filter.categoryId = req.query.category;
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ nameAr: searchRegex }, { nameEn: searchRegex }];
    }

    // Featured filter
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'nameAr nameEn slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// Public: get single product
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'nameAr nameEn slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Public: get best sellers
const getBestSellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ soldCount: { $gt: 0 } })
      .sort({ soldCount: -1 })
      .limit(limit)
      .populate('categoryId', 'nameAr nameEn slug');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Admin: create product
const createProduct = async (req, res, next) => {
  try {
    const { nameAr, nameEn, descriptionAr, descriptionEn, price, categoryId, stock, isFeatured } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price,
      images,
      categoryId,
      stock: stock || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { nameAr, nameEn, descriptionAr, descriptionEn, price, categoryId, stock, isFeatured, existingImages } = req.body;

    if (nameAr !== undefined) product.nameAr = nameAr;
    if (nameEn !== undefined) product.nameEn = nameEn;
    if (descriptionAr !== undefined) product.descriptionAr = descriptionAr;
    if (descriptionEn !== undefined) product.descriptionEn = descriptionEn;
    if (price !== undefined) product.price = price;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;

    // Handle images: keep existing + add new uploads
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map((f) => f.path)];
    }
    if (images.length > 0 || existingImages !== undefined) {
      product.images = images;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images from cloudinary
    for (const imageUrl of product.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn('Could not delete image from Cloudinary:', e.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, getBestSellers, createProduct, updateProduct, deleteProduct };
