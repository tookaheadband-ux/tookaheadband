const mongoose = require('mongoose');

const stockSubscriptionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

stockSubscriptionSchema.index({ productId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('StockSubscription', stockSubscriptionSchema);
