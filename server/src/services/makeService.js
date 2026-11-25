const axios = require('axios');
const config = require('../config/env');

class MakeService {
  /**
   * Send RSVP payload to Make.com Webhook to save directly into Excel
   * @param {Object} payload
   * @param {string} payload.fullName
   * @param {string} payload.location
   * @param {boolean} payload.attendance
   * @param {string} payload.submittedAt
   * @returns {Promise<{ delivered: boolean, message: string, status?: number }>}
   */
  static async sendRSVP(payload) {
    const webhookUrl = config.makeWebhookUrl;

    const now = new Date();
    // Format timestamp in VN time for clean Excel reading (e.g. 07/09/2026 15:30:00)
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

    let invitationType;
    if (payload.invitationType === 'chu-re' || payload.invitationType === 'groom') {
      invitationType = 'chu-re';
    } else {
      invitationType = 'co-dau';
    }

    const defaultSide = invitationType === 'chu-re' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)';

    // Payload formatted specifically for Make.com -> Google Sheets
    const formattedPayload = {
      fullName: payload.fullName,
      side: payload.side || defaultSide,
      invitationType,
      message: payload.message || '',
      dateFormatted: formattedDate,
      submittedAt: payload.submittedAt || now.toISOString(),
      source: 'Website Thiệp Cưới',
      // Convenience fields for Google Sheets table headers in Vietnamese
      'Họ và Tên': payload.fullName,
      'Khách Của': payload.side || defaultSide,
      'Loại Thiệp': invitationType,
      'Lời Chúc': payload.message || '',
      'Thời Gian': formattedDate,
    };

    const trimmedWebhook = (webhookUrl || '').trim();
    if (!trimmedWebhook || !/^https?:\/\//i.test(trimmedWebhook)) {
      console.warn('⚠️ [MakeService] MAKE_WEBHOOK_URL must be an HTTP(S) Custom Webhook URL (e.g. https://hook.eu1.make.com/...).');
      console.log('📋 [MakeService] Payload prepared for Google Sheets:', formattedPayload);
      return {
        delivered: false,
        message: 'Webhook URL not configured or invalid (must start with https://).',
        excelData: formattedPayload,
      };
    }

    try {
      console.log(`🚀 [MakeService] Sending RSVP to Make.com for Excel row: "${formattedPayload.fullName}"...`);

      const response = await axios.post(webhookUrl, formattedPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Wedding-Invitation-RSVP-Excel/1.0',
        },
        timeout: 6000, // 6s timeout
      });

      console.log(`✅ [MakeService] Delivered to Make.com successfully with HTTP status ${response.status}`);
      return {
        delivered: true,
        status: response.status,
        message: 'Sent to Make.com successfully to save to Excel',
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
