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

      const { fullName, location, side = 'Nhà Trai (Chú Rể)', message = '', attendance = true } = body;

      // Validation
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

      if (!location || typeof location !== 'string' || location.trim().length < 2) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Vui lòng chọn hoặc nhập đơn vị / vị trí của bạn.',
          }),
        };
      }

      const trimmedName = fullName.trim();
      const trimmedLocation = location.trim();
      const trimmedSide = side ? String(side).trim() : 'Nhà Trai (Chú Rể)';
      const trimmedMessage = message ? String(message).trim() : '';
      const cacheKey = `${trimmedName.toLowerCase()}_${trimmedLocation.toLowerCase()}`;

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
        location: trimmedLocation,
        side: trimmedSide,
        message: trimmedMessage,
        attendance: attendance ? 'Tham dự' : 'Không tham dự',
        attendanceBool: Boolean(attendance),
        dateFormatted: formattedDate,
        submittedAt: submittedAt,
        source: 'Website Thiệp Cưới (Netlify)',
        // Formatted columns for Excel spreadsheet
        'Họ và Tên': trimmedName,
        'Địa Điểm': trimmedLocation,
        'Khách Của': trimmedSide,
        'Lời Chúc': trimmedMessage,
        'Xác Nhận': attendance ? 'Tham dự' : 'Không tham dự',
        'Thời Gian': formattedDate,
      };

      const webhookUrl = process.env.MAKE_WEBHOOK_URL;
      let webhookDelivered = false;

      if (webhookUrl && webhookUrl.trim()) {
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
        } catch (err) {
          console.error('Make.com webhook dispatch error:', err);
        }
      } else {
        console.warn('MAKE_WEBHOOK_URL is not set in Netlify environment variables.');
      }

      const guestRecord = {
        fullName: trimmedName,
        location: trimmedLocation,
        attendance: Boolean(attendance),
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
