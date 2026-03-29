const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    discountedPrice: { type: Number, required: true, min: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlashSale', flashSaleSchema);
