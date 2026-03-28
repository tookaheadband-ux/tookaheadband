const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, index: true },
    nameAr: { type: String, default: '' },
    nameEn: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    stock: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const generateSku = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `TK-${code}`;
};

productSchema.pre('save', async function (next) {
  if (this.sku) return next();
  let sku;
  let exists = true;
  while (exists) {
    sku = generateSku();
    exists = await mongoose.model('Product').findOne({ sku });
  }
  this.sku = sku;
  next();
});

productSchema.pre('validate', function (next) {
  if (!this.nameAr && !this.nameEn) {
    return next(new Error('At least one language name (nameAr or nameEn) is required'));
  }
  next();
});

productSchema.index({ nameAr: 'text', nameEn: 'text' });

module.exports = mongoose.model('Product', productSchema);
