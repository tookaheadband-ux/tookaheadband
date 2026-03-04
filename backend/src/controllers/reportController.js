const Order = require('../models/Order');
const moment = require('moment-timezone');
const { generateDailyReport } = require('../services/pdfService');
const { sendDailyReportToTelegram } = require('../services/telegramService');

// Admin: generate and send daily report
const sendDailyReport = async (req, res, next) => {
  try {
    const todayStart = moment().tz('Africa/Cairo').startOf('day').toDate();
    const todayEnd = moment().tz('Africa/Cairo').endOf('day').toDate();

    const orders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).sort({ createdAt: 1 });

    const pdfBuffer = await generateDailyReport(orders);
    await sendDailyReportToTelegram(pdfBuffer);

    res.json({ message: `Daily report sent. ${orders.length} orders included.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendDailyReport };
