const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, default: 0 },
  },
  { _id: true }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    governorate: { type: String, required: true, unique: true },
    areas: [areaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
