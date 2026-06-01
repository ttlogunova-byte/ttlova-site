exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { amount, description, orderId } = JSON.parse(event.body);

  const SHOP_ID = '1370311';
  const SECRET_KEY = live_3DCwe0jLkNQwd9nSE1lROksWba2wAIv4uPT2I4p8YkY';

  const paymentData = {
    amount: { value: amount, currency: 'RUB' },
    confirmation: {
      type: 'redirect',
      return_url: 'https://ttlova.shop/?payment=success'
    },
    capture: true,
    description: description,
    metadata: { order_id: orderId }
  };

  try {
    const response = await fetch('https://api.yookassa.ru/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
        'Idempotence-Key': orderId
      },
      body: JSON.stringify(paymentData)
    });

    const payment = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: payment.confirmation.confirmation_url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
