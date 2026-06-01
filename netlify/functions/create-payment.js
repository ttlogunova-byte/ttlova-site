exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { amount, description, orderId } = body;

    const SHOP_ID = '1370311';
    const SECRET_KEY = 'live_3DCwe0jLkNQwd9nSE1lROksWba2wAIv4uPT2I4p8YkY';
    const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');

    const paymentData = {
      amount: { value: parseFloat(amount).toFixed(2), currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: 'https://ttlova.shop/?payment=success'
      },
      capture: true,
      description: description || 'Заказ TTLOVA'
    };

    const response = await fetch('https://api.yookassa.ru/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Idempotence-Key': orderId || String(Date.now())
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await response.json();

    if (payment.confirmation && payment.confirmation.confirmation_url) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ url: payment.confirmation.confirmation_url })
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: payment.description || payment.message || 'Unknown error',
          code: payment.code,
          type: payment.type,
          full: payment
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
