const https = require('https');

const sendTelegramMessage = (text) => {
  return new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn('⚠️ Telegram not configured, skipping message');
      return resolve();
    }

    const data = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', (err) => {
      console.error('Telegram error:', err.message);
      resolve(); // don't fail the order over telegram
    });

    req.write(data);
    req.end();
  });
};

const sendTelegramDocument = (buffer, filename, caption) => {
  return new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn('⚠️ Telegram not configured, skipping document');
      return resolve();
    }

    const boundary = '----FormBoundary' + Date.now();
    const crlf = '\r\n';

    let body = '';
    body += `--${boundary}${crlf}`;
    body += `Content-Disposition: form-data; name="chat_id"${crlf}${crlf}`;
    body += `${chatId}${crlf}`;

    if (caption) {
      body += `--${boundary}${crlf}`;
      body += `Content-Disposition: form-data; name="caption"${crlf}${crlf}`;
      body += `${caption}${crlf}`;
    }

    body += `--${boundary}${crlf}`;
    body += `Content-Disposition: form-data; name="document"; filename="${filename}"${crlf}`;
    body += `Content-Type: application/pdf${crlf}${crlf}`;

    const bodyStart = Buffer.from(body, 'utf-8');
    const bodyEnd = Buffer.from(`${crlf}--${boundary}--${crlf}`, 'utf-8');
    const payload = Buffer.concat([bodyStart, buffer, bodyEnd]);

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });

    req.on('error', (err) => {
      console.error('Telegram document error:', err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

module.exports = { sendTelegramMessage, sendTelegramDocument };
