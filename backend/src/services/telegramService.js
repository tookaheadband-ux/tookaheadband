const { sendTelegramMessage, sendTelegramDocument } = require('../config/telegram');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Page = require('../models/Page');
const OfflineSale = require('../models/OfflineSale');
const Expense = require('../models/Expense');
const StockSubscription = require('../models/StockSubscription');
const ShippingZone = require('../models/ShippingZone');
const FlashSale = require('../models/FlashSale');
const Bundle = require('../models/Bundle');
const AdminSettings = require('../models/AdminSettings');

const sendNewOrderNotification = async (order) => {
  const itemsList = order.items
    .map((i) => `[${i.skuSnapshot || '—'}] ${i.productNameSnapshot} x${i.qty}`)
    .join('\n');

  const message = `🚨 <b>NEW ORDER</b>

<b>Name:</b> ${order.name}
<b>Phone:</b> ${order.phone}
${order.governorate ? `<b>Governorate:</b> ${order.governorate} — ${order.area}` : ''}
<b>Address:</b> ${order.address}
${order.email ? `<b>Email:</b> ${order.email}` : ''}
${order.notes ? `<b>Notes:</b> ${order.notes}` : ''}

<b>Items:</b>
${itemsList}

${order.shippingCost > 0 ? `<b>Shipping: ${order.shippingCost} EGP</b>\n` : ''}<b>Total: ${order.total} EGP</b>`;

  await sendTelegramMessage(message);
};

const sendLowStockAlert = async (product) => {
  const name = product.nameEn || product.nameAr || 'Unknown';
  const message = `🚨 <b>LOW STOCK</b>

<b>Product:</b> [${product.sku || '—'}] ${name}
<b>Remaining:</b> ${product.stock}`;

  await sendTelegramMessage(message);
};

const sendDailyReportToTelegram = async (pdfBuffer) => {
  const today = new Date().toISOString().split('T')[0];
  await sendTelegramDocument(pdfBuffer, `TOOKA_Report_${today}.pdf`, `📊 Daily Report — ${today}`);
};

const sendBackupToTelegram = async () => {
  const [products, categories, orders, coupons, reviews, pages, offlineSales, expenses, stockSubscriptions, shippingZones, flashSales, bundles, adminSettings] = await Promise.all([
    Product.find().lean(),
    Category.find().lean(),
    Order.find().lean(),
    Coupon.find().lean(),
    Review.find().lean(),
    Page.find().lean(),
    OfflineSale.find().lean(),
    Expense.find().lean(),
    StockSubscription.find().lean(),
    ShippingZone.find().lean(),
    FlashSale.find().lean(),
    Bundle.find().lean(),
    AdminSettings.find().lean(),
  ]);

  const backup = { products, categories, orders, coupons, reviews, pages, offlineSales, expenses, stockSubscriptions, shippingZones, flashSales, bundles, adminSettings };
  const today = new Date().toISOString().split('T')[0];
  const buffer = Buffer.from(JSON.stringify(backup, null, 2), 'utf-8');

  await sendTelegramDocument(buffer, `tooka-backup-${today}.json`, `💾 Auto Backup — ${today} (${orders.length} orders)`);
};

module.exports = { sendNewOrderNotification, sendLowStockAlert, sendDailyReportToTelegram, sendBackupToTelegram };
