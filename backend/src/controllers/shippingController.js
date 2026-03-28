const ShippingZone = require('../models/ShippingZone');

// Public: get all shipping zones
const getShippingZones = async (req, res, next) => {
  try {
    const zones = await ShippingZone.find().sort({ governorate: 1 });
    res.json(zones);
  } catch (err) {
    next(err);
  }
};

// Admin: create a new shipping zone (governorate)
const createShippingZone = async (req, res, next) => {
  try {
    const { governorate, areas } = req.body;
    if (!governorate) return res.status(400).json({ message: 'Governorate name is required' });

    const existing = await ShippingZone.findOne({ governorate });
    if (existing) return res.status(400).json({ message: 'This governorate already exists' });

    const zone = await ShippingZone.create({ governorate, areas: areas || [] });
    res.status(201).json(zone);
  } catch (err) {
    next(err);
  }
};

// Admin: update a shipping zone (governorate name + areas)
const updateShippingZone = async (req, res, next) => {
  try {
    const { governorate, areas } = req.body;
    const zone = await ShippingZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Shipping zone not found' });

    if (governorate) zone.governorate = governorate;
    if (areas !== undefined) zone.areas = areas;
    await zone.save();
    res.json(zone);
  } catch (err) {
    next(err);
  }
};

// Admin: delete a shipping zone
const deleteShippingZone = async (req, res, next) => {
  try {
    const zone = await ShippingZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Shipping zone not found' });
    res.json({ message: 'Shipping zone deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone };
