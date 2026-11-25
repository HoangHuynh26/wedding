// In-memory cache across serverless warm invocations
const recentSubmissions = new Map();

exports.handler = async function (event, context) {
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
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Dữ liệu gửi lên không đúng định dạng JSON.',
          }),
        };
      }

      const { fullName, side, invitationType: rawInvitationType, message = '' } = body;

      // Validation: only fullName is required; message (lời chúc) is completely optional
      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Vui lòng nhập họ và tên hợp lệ (ít nhất 2 ký tự).',
          }),
        };
      }

      const normalizedType = String(rawInvitationType || '').trim().toLowerCase();
      let invitationType;
      if (normalizedType === 'chu-re' || normalizedType === 'groom' || normalizedType === 'nha-trai') {
        invitationType = 'chu-re';
      } else {
        invitationType = 'co-dau';
      }

      const trimmedName = fullName.trim();
      const defaultSide = invitationType === 'chu-re' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)';
      const trimmedSide = side && String(side).trim() ? String(side).trim() : defaultSide;
      const trimmedMessage = typeof message === 'string' ? message.trim() : '';
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
            message: 'Bạn đã xác nhận tham dự rồi! Thông tin đã được ghi nhận vào Excel qua Make.com ♡',
            guest: last,
            storage: 'Excel via Make.com',
          }),
        };
      }

      const now = new Date();
      // Format in Vietnam Time (ICT, UTC+7) for clean Excel formatting
      const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      const submittedAt = now.toISOString();

      const formattedPayload = {
        fullName: trimmedName,
        side: trimmedSide,
        invitationType,
        message: trimmedMessage,
        dateFormatted: formattedDate,
        submittedAt,
        source: 'Website Thiệp Cưới (Netlify)',
        // Formatted columns for Make.com -> Google Sheets
        'Họ và Tên': trimmedName,
        'Khách Của': trimmedSide,
        'Loại Thiệp': invitationType,
        'Lời Chúc': trimmedMessage,
        'Thời Gian': formattedDate,
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
        console.error('MAKE_WEBHOOK_URL must be an HTTP(S) Custom Webhook URL (https://hook.eu1.make.com/...), not a Mailhook email address.');
      } else {
        console.warn('MAKE_WEBHOOK_URL is not set in Netlify environment variables.');
      }

      const guestRecord = {
        fullName: trimmedName,
        side: trimmedSide,
        invitationType,
        message: trimmedMessage,
        attendance: true,
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
          message: 'Đã có lỗi xảy ra khi xử lý xác nhận RSVP.',
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
