const AdminSettings = require('../models/AdminSettings');

const FEATURE_KEYS = [
  'feature_flash_sales',
  'feature_bundles',
  'feature_social_proof',
  'feature_gift_wrap',
  'feature_customer_db',
];

// Public: get all feature flags
const getFeatureFlags = async (req, res, next) => {
  try {
    const settings = await AdminSettings.find({ key: { $in: [...FEATURE_KEYS, 'gift_wrap_price'] } });
    const flags = {};
    FEATURE_KEYS.forEach((k) => { flags[k] = false; });
    flags.gift_wrap_price = 20;
    settings.forEach((s) => {
      if (FEATURE_KEYS.includes(s.key)) flags[s.key] = s.value === 'true';
      else if (s.key === 'gift_wrap_price') flags.gift_wrap_price = Number(s.value) || 20;
    });
    res.json(flags);
  } catch (err) {
    next(err);
  }
};

// Admin: update feature flags
const updateFeatureFlags = async (req, res, next) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await AdminSettings.findOneAndUpdate({ key }, { value: String(value) }, { upsert: true });
    }
    res.json({ message: 'Feature flags updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeatureFlags, updateFeatureFlags };
