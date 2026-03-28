require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pageRoutes = require('./routes/pageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const couponRoutes = require('./routes/couponRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://tookaheadbands.com',
    'https://www.tookaheadbands.com',
    'https://tookaheadbandfrontend.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection before each request (for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shipping-zones', shippingRoutes);

// Public: site settings (contact info for footer)
app.get('/api/site-settings', async (req, res) => {
  try {
    const AdminSettings = require('./models/AdminSettings');
    const keys = ['contact_email', 'contact_phone'];
    const settings = await AdminSettings.find({ key: { $in: keys } });
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    if (!result.contact_email) result.contact_email = 'tookaheadband@gmail.com';
    if (!result.contact_phone) result.contact_phone = '+201557788876';
    res.json(result);
  } catch (err) {
    res.json({ contact_email: 'tookaheadband@gmail.com', contact_phone: '+201557788876' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Daily report cron job — runs every day at 11:00 PM Cairo time
const scheduleDailyReport = () => {
  const Order = require('./models/Order');
  const moment = require('moment-timezone');
  const { generateDailyReport } = require('./services/pdfService');
  const { sendDailyReportToTelegram } = require('./services/telegramService');

  cron.schedule('0 23 * * *', async () => {
    try {
      const todayStart = moment().tz('Africa/Cairo').startOf('day').toDate();
      const todayEnd = moment().tz('Africa/Cairo').endOf('day').toDate();

      const orders = await Order.find({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }).sort({ createdAt: 1 });

      if (orders.length === 0) {
        const { sendTelegramMessage } = require('./config/telegram');
        await sendTelegramMessage('📊 <b>Daily Report</b>\n\nNo orders today.');
        return;
      }

      const pdfBuffer = await generateDailyReport(orders);
      await sendDailyReportToTelegram(pdfBuffer);
      console.log(`📊 Daily report sent: ${orders.length} orders`);
    } catch (err) {
      console.error('Daily report cron error:', err);
    }
  }, { timezone: 'Africa/Cairo' });

  console.log('⏰ Daily report scheduled at 11:00 PM Cairo time');
};

// Schedule daily report (local dev only)
if (require.main === module) {
  scheduleDailyReport();
}

// Start server (local dev)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TOKA Backend running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
