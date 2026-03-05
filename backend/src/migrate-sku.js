/**
 * One-time migration: generate SKU codes for existing products that don't have one.
 * Run with: node src/migrate-sku.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const products = await Product.find({ $or: [{ sku: null }, { sku: '' }, { sku: { $exists: false } }] });
  console.log(`Found ${products.length} products without SKU`);

  for (const product of products) {
    product.sku = undefined; // clear so the pre-save hook generates one
    await product.save();
    console.log(`  → ${product.nameEn || product.nameAr}: ${product.sku}`);
  }

  console.log('✅ Migration complete');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
