exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { event: eventType, object: payment } = body;

    if (eventType === 'payment.succeeded') {
      const TOKEN = '8984520183:AAFPTnnESDEQEILtamvQDb0HMhZJptGzaL4';
      const CHAT_ID = '6716786160';

      const amount = payment.amount.value;
      const description = payment.description || 'Заказ TTLOVA';
      const paymentId = payment.id;
      const method = payment.payment_method?.type || 'неизвестно';

      const text = `✅ ОПЛАТА ПОЛУЧЕНА!

💰 Сумма: ${amount} ₽
📦 ${description}
💳 Способ: ${method}
🔑 ID платежа: ${paymentId}

Отправляй заказ!`;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: text })
      });
    }

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
