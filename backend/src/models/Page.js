const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    titleAr: { type: String, default: '' },
    titleEn: { type: String, default: '' },
    contentAr: { type: String, default: '' },
    contentEn: { type: String, default: '' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
