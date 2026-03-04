const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nameAr: { type: String, default: '' },
    nameEn: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    stock: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Validate at least one language name exists
productSchema.pre('validate', function (next) {
  if (!this.nameAr && !this.nameEn) {
    return next(new Error('At least one language name (nameAr or nameEn) is required'));
  }
  next();
});

// Text index for search
productSchema.index({ nameAr: 'text', nameEn: 'text' });

module.exports = mongoose.model('Product', productSchema);
