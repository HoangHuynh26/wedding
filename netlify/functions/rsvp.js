// In-memory cache across serverless warm invocations
const recentSubmissions = new Map();

function formatDateTimeICT(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 1. Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // 2. Handle GET /api/rsvp
  if (event.httpMethod === 'GET') {
    const list = Array.from(recentSubmissions.values());
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        note: 'Primary storage is dispatched directly to Make.com -> Excel.',
        count: list.length,
        recentGuests: list,
      }),
    };
  }

  // 3. Handle POST /api/rsvp
  if (event.httpMethod === 'POST') {
    try {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid JSON request body.',
          }),
        };
      }

      const {
        fullName,
        side,
        invitationType: rawInvitationType,
        language: rawLanguage,
        attendance = true,
        message = '',
      } = body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Please enter a valid full name (at least 2 characters).',
          }),
        };
      }

      const normalizedType = String(rawInvitationType || '').trim().toLowerCase();
      const invitationType =
        normalizedType === 'groom' || normalizedType === 'chu-re' || normalizedType === 'nha-trai'
          ? 'groom'
          : 'bride';

      const normLang = String(rawLanguage || '').trim().toLowerCase();
      const language =
        normLang === 'vi' ? 'vi' : normLang === 'zh' || normLang.startsWith('zh-') ? 'zh' : 'en';

      const defaultSideByLang = {
        en: invitationType === 'groom' ? "Groom's Side" : "Bride's Side",
        vi: invitationType === 'groom' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)',
        zh: invitationType === 'groom' ? '男方亲友（新郎方）' : '女方亲友（新娘方）',
      };

      const trimmedName = fullName.trim();
      const defaultSide = defaultSideByLang[language] || defaultSideByLang.en;
      const trimmedSide = side && String(side).trim() ? String(side).trim() : defaultSide;
      const trimmedMessage = typeof message === 'string' ? message.trim() : '';
      const confirmedAttendance = Boolean(attendance);
      const cacheKey = `${invitationType}_${trimmedName.toLowerCase()}_${trimmedSide.toLowerCase()}`;

      // Duplicate prevention within warm instance
      if (recentSubmissions.has(cacheKey)) {
        const last = recentSubmissions.get(cacheKey);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            isDuplicate: true,
            message: 'RSVP already confirmed and recorded.',
            guest: last,
            storage: 'Excel via Make.com',
          }),
        };
      }

      const now = new Date();
      const formattedDate = formatDateTimeICT(now);
      const submittedAt = now.toISOString();

      // 100% English schema keys & system values; only user/language data varies by language
      const formattedPayload = {
        fullName: trimmedName,
        side: trimmedSide,
        invitationType,
        language,
        attendance: confirmedAttendance,
        message: trimmedMessage,
        dateFormatted: formattedDate,
        submittedAt,
        source: 'Wedding Invitation Website',
      };

      const webhookUrl = (process.env.MAKE_WEBHOOK_URL || '').trim();
      let webhookDelivered = false;

      if (webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Wedding-Invitation-Netlify-Functions/1.0',
            },
            body: JSON.stringify(formattedPayload),
          });

          webhookDelivered = res.ok;
          if (!res.ok) {
            console.error(`Make.com webhook returned HTTP ${res.status}`);
          }
        } catch (err) {
          console.error('Make.com webhook dispatch error:', err);
        }
      } else if (webhookUrl) {
        console.error('MAKE_WEBHOOK_URL must be an HTTP(S) Custom Webhook URL (https://hook.eu1.make.com/...).');
      } else {
        console.warn('MAKE_WEBHOOK_URL is not set in Netlify environment variables.');
      }

      const guestRecord = {
        fullName: trimmedName,
        side: trimmedSide,
        invitationType,
        language,
        message: trimmedMessage,
        attendance: confirmedAttendance,
        submittedAt,
        deliveredToMake: webhookDelivered,
      };

      recentSubmissions.set(cacheKey, guestRecord);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'RSVP confirmed successfully. Data dispatched to Make.com for Excel.',
          guest: guestRecord,
          storage: 'Excel (Make.com)',
          webhookStatus: webhookDelivered ? 'delivered' : 'pending_or_logged',
        }),
      };
    } catch (error) {
      console.error('RSVP Serverless Function Error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'An error occurred while processing the RSVP confirmation.',
          error: error.message,
        }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
