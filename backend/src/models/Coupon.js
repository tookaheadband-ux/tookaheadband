const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: 'Coupon has expired' };
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderTotal < this.minOrder) return { valid: false, message: `Minimum order is ${this.minOrder} EGP` };
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderTotal) {
  if (this.type === 'percentage') {
    return Math.round((orderTotal * this.value) / 100);
  }
  return Math.min(this.value, orderTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
