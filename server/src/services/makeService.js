const axios = require('axios');
const config = require('../config/env');

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

class MakeService {
  /**
   * Send RSVP payload to Make.com Webhook with 100% English schema keys & system values.
   * Only guest-provided / localized data values (fullName, side, message) follow the invitation language.
   */
  static async sendRSVP(payload) {
    const webhookUrl = config.makeWebhookUrl;
    const now = new Date();
    const formattedDate = formatDateTimeICT(now);

    const rawType = String(payload.invitationType || '').trim().toLowerCase();
    const invitationType =
      rawType === 'groom' || rawType === 'chu-re' || rawType === 'nha-trai' ? 'groom' : 'bride';

    const rawLang = String(payload.language || '').trim().toLowerCase();
    const language =
      rawLang === 'vi' ? 'vi' : rawLang === 'zh' || rawLang.startsWith('zh-') ? 'zh' : 'en';

    const defaultSideByLang = {
      en: invitationType === 'groom' ? "Groom's Side" : "Bride's Side",
      vi: invitationType === 'groom' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)',
      zh: invitationType === 'groom' ? '男方亲友（新郎方）' : '女方亲友（新娘方）',
    };
    const defaultSide = defaultSideByLang[language] || defaultSideByLang.en;

    const formattedPayload = {
      fullName: payload.fullName,
      side: payload.side || defaultSide,
      invitationType,
      language,
      attendance: payload.attendance !== undefined ? Boolean(payload.attendance) : true,
      message: payload.message || '',
      dateFormatted: formattedDate,
      submittedAt: payload.submittedAt || now.toISOString(),
      source: 'Wedding Invitation Website',
    };

    const trimmedWebhook = (webhookUrl || '').trim();
    if (!trimmedWebhook || !/^https?:\/\//i.test(trimmedWebhook)) {
      console.warn('⚠️ [MakeService] MAKE_WEBHOOK_URL must be an HTTP(S) Custom Webhook URL (e.g. https://hook.eu1.make.com/...).');
      console.log('📋 [MakeService] Payload prepared for Make.com:', formattedPayload);
      return {
        delivered: false,
        message: 'Webhook URL not configured or invalid (must start with https://).',
        excelData: formattedPayload,
      };
    }

    try {
      console.log(`🚀 [MakeService] Sending RSVP to Make.com for row: "${formattedPayload.fullName}"...`);

      const response = await axios.post(trimmedWebhook, formattedPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Wedding-Invitation-RSVP/1.0',
        },
        timeout: 6000,
      });

      console.log(`✅ [MakeService] Delivered to Make.com successfully with HTTP status ${response.status}`);
      return {
        delivered: true,
        status: response.status,
        message: 'Sent to Make.com successfully',
        excelData: formattedPayload,
      };
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ [MakeService] Webhook request timed out (exceeded 6s).');
        return {
          delivered: false,
          error: 'TIMEOUT',
          message: 'Webhook request timed out',
          excelData: formattedPayload,
        };
      }

      if (error.response) {
        console.error(`❌ [MakeService] Make.com rejected with status ${error.response.status}:`, error.response.data);
        return {
          delivered: false,
          status: error.response.status,
          message: `Make.com rejected with status ${error.response.status}`,
          excelData: formattedPayload,
        };
      }

      console.error('⚠️ [MakeService] Network error communicating with Make.com:', error.message);
      return {
        delivered: false,
        error: error.message,
        message: 'Network error communicating with webhook endpoint',
        excelData: formattedPayload,
      };
    }
  }
}

module.exports = MakeService;
