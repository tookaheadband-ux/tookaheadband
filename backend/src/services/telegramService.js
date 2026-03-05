const { sendTelegramMessage, sendTelegramDocument } = require('../config/telegram');

const sendNewOrderNotification = async (order) => {
  const itemsList = order.items
    .map((i) => `[${i.skuSnapshot || '—'}] ${i.productNameSnapshot} x${i.qty}`)
    .join('\n');

  const message = `🚨 <b>NEW ORDER</b>

<b>Name:</b> ${order.name}
<b>Phone:</b> ${order.phone}
<b>Address:</b> ${order.address}
${order.email ? `<b>Email:</b> ${order.email}` : ''}
${order.notes ? `<b>Notes:</b> ${order.notes}` : ''}

<b>Items:</b>
${itemsList}

<b>Total: ${order.total} EGP</b>`;

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

module.exports = { sendNewOrderNotification, sendLowStockAlert, sendDailyReportToTelegram };
