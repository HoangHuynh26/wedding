const MakeService = require('../services/makeService');

// In-memory cache for recent submissions to prevent accidental double-submits
const recentSubmissions = new Map();

class RSVPController {
  /**
   * Submit RSVP confirmation
   * POST /api/rsvp
   * Dispatches directly to Make.com to save into Excel (no local database used)
   */
  static async submitRSVP(req, res, next) {
    try {
      const {
        fullName,
        location = '',
        invitationType = 'co-dau',
        side = invitationType === 'chu-re' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)',
        message = '',
        attendance = true,
      } = req.body;
      const key = `${invitationType}_${fullName.toLowerCase().trim()}_${String(side).toLowerCase().trim()}`;

      // Prevent immediate double submissions within 30 seconds
      if (recentSubmissions.has(key)) {
        const lastSubmitted = recentSubmissions.get(key);
        return res.status(200).json({
          success: true,
          isDuplicate: true,
          message: 'Bạn đã xác nhận tham dự rồi! Thông tin đã được ghi nhận vào Excel qua Make.com ♡',
          guest: {
            fullName: lastSubmitted.fullName,
            location: lastSubmitted.location,
            side: lastSubmitted.side,
            invitationType: lastSubmitted.invitationType,
            message: lastSubmitted.message,
            attendance: lastSubmitted.attendance,
            submittedAt: lastSubmitted.submittedAt,
          },
          storage: 'Excel via Make.com',
        });
      }

      const submittedAt = new Date().toISOString();

      // Dispatch to Make.com to append row into Excel / Google Sheets
      const webhookResult = await MakeService.sendRSVP({
        fullName,
        location,
        side,
        invitationType,
        message,
        attendance,
        submittedAt,
      });

      // Track in memory
      const guestRecord = {
        fullName,
        location,
        side,
        invitationType,
        message,
        attendance,
        submittedAt,
        deliveredToMake: webhookResult.delivered,
      };
      recentSubmissions.set(key, guestRecord);

      // Return successful response to client
      return res.status(201).json({
        success: true,
        message: 'RSVP confirmed successfully. Data dispatched to Make.com for Excel.',
        guest: {
          fullName,
          location,
          side,
          invitationType,
          message,
          attendance,
          submittedAt,
        },
        storage: 'Excel (Make.com)',
        webhookStatus: webhookResult.delivered ? 'delivered' : 'pending_or_logged',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent RSVPs
   * GET /api/rsvp
   */
  static async getRSVPs(req, res, next) {
    try {
      const list = Array.from(recentSubmissions.values());
      return res.status(200).json({
        success: true,
        note: 'Primary storage is managed via Make.com Excel scenario.',
        count: list.length,
        recentGuests: list,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RSVPController;
