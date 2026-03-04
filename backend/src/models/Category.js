const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    nameAr: { type: String, default: '' },
    nameEn: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
