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
    const { amount, description, orderId } = JSON.parse(event.body);

    const SHOP_ID = '1370311';
    const SECRET_KEY = 'live_3DCwe0jLkNQwd9nSE1lROksWba2wAIv4uPT2I4p8YkY';
    const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');

    const paymentData = {
      amount: { value: String(amount), currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: 'https://ttlova.shop/?payment=success'
      },
      capture: true,
      description: description
    };

    const response = await fetch('https://api.yookassa.ru/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Idempotence-Key': orderId
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await response.json();
    console.log('YooKassa response:', JSON.stringify(payment));

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
        body: JSON.stringify({ error: payment.description || 'No payment URL', details: payment })
      };
    }
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
