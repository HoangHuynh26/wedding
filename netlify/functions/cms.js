// Serverless CMS endpoint for Netlify deployments (warm-instance memory + client localStorage sync)
let cachedSettings = null;
let cachedInvitations = [];

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const rawPath = event.path || '';
  const subPath = rawPath.replace(/^\/(\.netlify\/functions\/cms|api\/cms)/, '') || '/';

  try {
    if (subPath.startsWith('/settings')) {
      if (event.httpMethod === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, settings: cachedSettings }),
        };
      }
      if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
        const incoming = JSON.parse(event.body || '{}');
        cachedSettings = {
          ...(cachedSettings || {}),
          ...incoming,
          updatedAt: new Date().toISOString(),
        };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, settings: cachedSettings }),
        };
      }
    }

    if (subPath.startsWith('/invitations')) {
      if (event.httpMethod === 'GET') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            count: cachedInvitations.length,
            invitations: cachedInvitations,
          }),
        };
      }
      if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const record = {
          id: body.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          side: body.side === 'groom' ? 'groom' : 'bride',
          guestName: String(body.guestName || '').trim(),
          inviter: String(body.inviter || '').trim(),
          lang: body.lang || 'vi',
          langLabel: body.langLabel || 'Tiếng Việt',
          langFlag: body.langFlag || '🇻🇳',
          songId: body.songId || 'young-and-beautiful',
          songTitle: body.songTitle || 'Young and Beautiful',
          songArtist: body.songArtist || 'Lana Del Rey',
          url: String(body.url || '').trim(),
          createdAt: body.createdAt || new Date().toISOString(),
          createdDisplay: body.createdDisplay || '',
        };
        cachedInvitations = [record, ...cachedInvitations].slice(0, 5000);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            invitation: record,
            count: cachedInvitations.length,
          }),
        };
      }
      if (event.httpMethod === 'DELETE') {
        const idFromPath = subPath.replace(/^\/invitations\/?/, '').trim();
        const id = idFromPath || event.queryStringParameters?.id || '';
        const side = event.queryStringParameters?.side || '';
        if (id) {
          cachedInvitations = cachedInvitations.filter((x) => String(x.id) !== String(id));
        } else if (side) {
          cachedInvitations = cachedInvitations.filter((x) => x.side !== side);
        } else {
          cachedInvitations = [];
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, count: cachedInvitations.length }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, message: 'CMS endpoint not found' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  }
};
