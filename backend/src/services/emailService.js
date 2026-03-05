const transporter = require('../config/mailer');

const sendOrderConfirmationToAdmin = async (order) => {
  try {
    const itemsList = order.items
      .map((i) => `• [${i.skuSnapshot || '—'}] ${i.productNameSnapshot} x${i.qty} — ${i.priceSnapshot} EGP`)
      .join('\n');

    await transporter.sendMail({
      from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 New Order from ${order.name}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ''}
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        <h3>Items:</h3>
        <pre>${itemsList}</pre>
        <p><strong>Total: ${order.total} EGP</strong></p>
      `,
    });
  } catch (err) {
    console.error('❌ Admin email error:', err.message);
  }
};

const sendOrderConfirmationToCustomer = async (order) => {
  if (!order.email) return;

  try {
    const itemsList = order.items
      .map((i) => `• [${i.skuSnapshot || '—'}] ${i.productNameSnapshot} x${i.qty} — ${i.priceSnapshot} EGP`)
      .join('\n');

    await transporter.sendMail({
      from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: '💖 Your TOOKA Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFC7D1;">Thank you for your order, ${order.name}! 💖</h2>
          <p>We've received your order and will process it shortly.</p>
          <h3>Order Details:</h3>
          <pre>${itemsList}</pre>
          <p><strong>Total: ${order.total} EGP</strong></p>
          <p><strong>Payment:</strong> Cash on Delivery</p>
          <p><strong>Delivery Address:</strong> ${order.address}</p>
          <hr />
          <p style="color: #999;">With love, TOOKA 💕</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Customer email error:', err.message);
  }
};

module.exports = { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer };
