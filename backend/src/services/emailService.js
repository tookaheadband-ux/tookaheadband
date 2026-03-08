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
    const storeUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackUrl = `${storeUrl}/track-order?orderId=${order._id}`;

    const itemsHtml = order.items.map((i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          ${i.imageSnapshot ? `<img src="${i.imageSnapshot}" width="50" height="50" style="border-radius:8px;object-fit:cover;vertical-align:middle;margin-right:10px;" />` : ''}
          <span style="font-weight:bold;color:#333;">${i.productNameSnapshot}</span>
          ${i.skuSnapshot ? `<br/><small style="color:#999;">${i.skuSnapshot}</small>` : ''}
        </td>
        <td style="padding:10px;text-align:center;color:#666;">x${i.qty}</td>
        <td style="padding:10px;text-align:right;font-weight:bold;color:#333;">${i.priceSnapshot * i.qty} EGP</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: `💖 Order Confirmed — #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">
          <!-- Header -->
          <div style="background:#FFC7D1;padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;color:#2C2621;letter-spacing:4px;text-transform:uppercase;">TOOKA</h1>
            <p style="margin:8px 0 0;color:#2C2621;font-size:14px;">Order Confirmed</p>
          </div>

          <!-- Body -->
          <div style="padding:32px 24px;">
            <h2 style="color:#333;margin-top:0;">Thank you, ${order.name}! 💖</h2>
            <p style="color:#666;font-size:15px;">We've received your order and will process it shortly. You can track your order status anytime using the button below.</p>

            <!-- Order ID Box -->
            <div style="background:#f9f9f9;border:2px dashed #FFC7D1;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">Your Order ID</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#333;letter-spacing:1px;">${order._id}</p>
            </div>

            <!-- Track Button -->
            <div style="text-align:center;margin:24px 0;">
              <a href="${trackUrl}" style="display:inline-block;background:#FFC7D1;color:#2C2621;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:1px;">
                Track My Order
              </a>
            </div>

            <!-- Items Table -->
            <h3 style="color:#333;border-bottom:2px solid #FFC7D1;padding-bottom:8px;">Order Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              ${itemsHtml}
            </table>

            <!-- Totals -->
            <div style="margin-top:16px;border-top:2px solid #f0f0f0;padding-top:16px;">
              ${order.discount > 0 ? `
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="color:#666;">Subtotal</span><span style="color:#666;">${order.subtotal} EGP</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="color:#16a34a;">Discount (${order.couponCode})</span><span style="color:#16a34a;">-${order.discount} EGP</span>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;color:#333;">
                <span>Total</span><span>${order.total} EGP</span>
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="margin-top:24px;background:#f9f9f9;border-radius:12px;padding:16px;">
              <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:2px;">Delivery Details</p>
              <p style="margin:0 0 4px;color:#333;"><strong>Address:</strong> ${order.address}</p>
              <p style="margin:0;color:#333;"><strong>Payment:</strong> Cash on Delivery</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f9f9f9;padding:20px 24px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0;color:#999;font-size:12px;">With love, TOOKA 💕 | Questions? Reply to this email or WhatsApp us</p>
          </div>
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
    const storeUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackUrl = `${storeUrl}/track-order?orderId=${order._id}`;

    await transporter.sendMail({
      from: `"TOOKA Store" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: `${msg.emoji} TOOKA - ${msg.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">
          <div style="background:#FFC7D1;padding:24px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#2C2621;letter-spacing:4px;text-transform:uppercase;">TOOKA</h1>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#333;margin-top:0;">${msg.emoji} ${msg.title}</h2>
            <p style="font-size:15px;color:#555;">${msg.text}</p>
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;"><strong>Order ID:</strong> <span style="color:#666;font-size:13px;">${order._id}</span></p>
              <p style="margin:0 0 8px;"><strong>Status:</strong> <span style="text-transform:uppercase;font-weight:bold;color:#e91e8c;">${newStatus}</span></p>
              <p style="margin:0 0 8px;"><strong>Total:</strong> ${order.total} EGP</p>
              <p style="margin:0;"><strong>Address:</strong> ${order.address}</p>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="${trackUrl}" style="display:inline-block;background:#FFC7D1;color:#2C2621;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                Track My Order
              </a>
            </div>
          </div>
          <div style="background:#f9f9f9;padding:16px 24px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0;color:#999;font-size:12px;">With love, TOOKA 💕</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('❌ Status update email error:', err.message);
  }
};

module.exports = { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer, sendOrderStatusUpdateToCustomer };
