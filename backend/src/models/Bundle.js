const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema(
  {
    nameAr: { type: String, default: '' },
    nameEn: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    bundlePrice: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bundle', bundleSchema);
