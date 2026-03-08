const Product = require('../models/Product');
const StockSubscription = require('../models/StockSubscription');
const { cloudinary } = require('../config/cloudinary');
const transporter = require('../config/mailer');

// Public: get products with pagination, filtering, search
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) filter.categoryId = req.query.category;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ nameAr: searchRegex }, { nameEn: searchRegex }];
    }

    if (req.query.featured === 'true') filter.isFeatured = true;

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Color filter
    if (req.query.color) filter.colors = req.query.color;

    // Size filter
    if (req.query.size) filter.sizes = req.query.size;

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'best_selling') sort = { soldCount: -1 };
    else if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'nameAr nameEn slug')
        .sort(sort)
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

// Public: get single product with related products
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'nameAr nameEn slug')
      .populate('relatedProducts', 'nameAr nameEn price images stock soldCount isFeatured');
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
    const { nameAr, nameEn, descriptionAr, descriptionEn, price, categoryId, stock, isFeatured, colors, sizes } = req.body;
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
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim()).filter(Boolean)) : [],
      sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()).filter(Boolean)) : [],
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

    const { nameAr, nameEn, descriptionAr, descriptionEn, price, categoryId, stock, isFeatured, existingImages, colors, sizes } = req.body;

    if (nameAr !== undefined) product.nameAr = nameAr;
    if (nameEn !== undefined) product.nameEn = nameEn;
    if (descriptionAr !== undefined) product.descriptionAr = descriptionAr;
    if (descriptionEn !== undefined) product.descriptionEn = descriptionEn;
    if (price !== undefined) product.price = price;
    if (categoryId !== undefined) product.categoryId = categoryId;
    const oldStock = product.stock;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim()).filter(Boolean);
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()).filter(Boolean);

    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages.filter(Boolean) : (existingImages ? [existingImages].filter(Boolean) : []);
    }
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map((f) => f.path)];
    }
    if (images.length > 0 || existingImages !== undefined) {
      product.images = images;
    }

    await product.save();

    // Back-in-stock email trigger
    if (oldStock <= 0 && product.stock > 0) {
      const subs = await StockSubscription.find({ productId: product._id, notified: false });
      for (const sub of subs) {
        try {
          await transporter.sendMail({
            from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
            to: sub.email,
            subject: `🎉 ${product.nameEn || product.nameAr} is back in stock!`,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><h2>Great news! 🎉</h2><p><strong>${product.nameEn || product.nameAr}</strong> is back in stock at TOOKA!</p><p>Hurry before it sells out again.</p><hr/><p style="color:#999;font-size:12px;">TOOKA 💕</p></div>`,
          });
          sub.notified = true;
          await sub.save();
        } catch (e) { console.error('Back-in-stock email error:', e.message); }
      }
    }

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
