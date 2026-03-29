const mongoose = require('mongoose');

const offlineSaleSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    sellPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    deductStock: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfflineSale', offlineSaleSchema);
