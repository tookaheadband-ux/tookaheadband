const PDFDocument = require('pdfkit');
const moment = require('moment-timezone');

const generateDailyReport = (orders) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const today = moment().tz('Africa/Cairo').format('YYYY-MM-DD');

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('TOKA — Daily Order Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text(`Date: ${today}`, { align: 'center' });
    doc.moveDown(1);

    if (!orders || orders.length === 0) {
      doc.fontSize(14).text('No orders today.', { align: 'center' });
      doc.end();
      return;
    }

    // Summary
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    doc.fontSize(12).font('Helvetica-Bold').text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ${totalRevenue} EGP`);
    doc.moveDown(1);

    // Orders table
    orders.forEach((order, idx) => {
      const orderDate = moment(order.createdAt).tz('Africa/Cairo').format('hh:mm A');
      const items = order.items.map((i) => `${i.productNameSnapshot} x${i.qty}`).join(', ');

      doc.font('Helvetica-Bold').fontSize(11).text(`#${idx + 1} — ${order.name} (${orderDate})`);
      doc.font('Helvetica').fontSize(10);
      doc.text(`Phone: ${order.phone}`);
      doc.text(`Address: ${order.address}`);
      doc.text(`Items: ${items}`);
      doc.text(`Total: ${order.total} EGP | Status: ${order.status}`);
      doc.moveDown(0.5);

      // Divider
      doc.strokeColor('#e0e0e0').lineWidth(0.5)
        .moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // Page break if near bottom
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.end();
  });
};

module.exports = { generateDailyReport };
