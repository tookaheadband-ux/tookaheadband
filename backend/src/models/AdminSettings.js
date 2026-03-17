const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
