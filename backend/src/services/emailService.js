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

const sendOrderStatusUpdateToCustomer = async (order, newStatus) => {
  if (!order.email) return;

  const statusMessages = {
    shipped: { emoji: '🚚', title: 'Your order is on the way!', text: 'Great news! Your order has been shipped and is heading to your address.' },
    delivered: { emoji: '✅', title: 'Your order has been delivered!', text: 'We hope you love your items! Thank you for shopping with us.' },
    canceled: { emoji: '❌', title: 'Your order has been canceled', text: 'Unfortunately, your order has been canceled. If this was unexpected, please contact us.' },
    pending: { emoji: '⏳', title: 'Your order is being processed', text: 'Your order status has been updated. We are processing it now.' },
  };

  const msg = statusMessages[newStatus] || statusMessages.pending;

  try {
    await transporter.sendMail({
      from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: `${msg.emoji} TOOKA - ${msg.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">${msg.emoji} ${msg.title}</h2>
          <p style="font-size: 16px; color: #555;">${msg.text}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Order Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #e91e8c;">${newStatus}</span></p>
            <p><strong>Total:</strong> ${order.total} EGP</p>
            <p><strong>Delivery Address:</strong> ${order.address}</p>
          </div>
          <hr />
          <p style="color: #999; font-size: 12px;">With love, TOOKA 💕</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Status update email error:', err.message);
  }
};

module.exports = { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdateToCustomer };
