exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      service: 'wedding-invitation-netlify-function',
      time: new Date().toISOString(),
      platform: 'Netlify Serverless',
      makeWebhookConfigured: Boolean(process.env.MAKE_WEBHOOK_URL),
    }),
  };
};
