const fs = require('fs').promises;
const path = require('path');
const MakeService = require('../services/makeService');

const DATA_DIR = path.resolve(__dirname, '../../data');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');
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
  for (const part of parts) map[part.type] = part.value;
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

async function readRsvpRecords() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(RSVPS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRsvpRecords(list) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RSVPS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

class RSVPController {
  /**
   * Submit RSVP confirmation
   * POST /api/rsvp
   * Simultaneously:
   * 1) Saves confirmation ONLY (strictly WITHOUT guest `message`) into the website's own store
   * 2) Sends full payload (WITH `message`) to Make.com Webhook -> Google Sheets
   */
  static async submitRSVP(req, res, next) {
    try {
      const {
        fullName,
        invitationType = 'bride',
        language = 'vi',
        side = invitationType === 'groom' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)',
        message = '',
        attendance = true,
      } = req.body;

      const key = `${invitationType}_${fullName.toLowerCase().trim()}_${String(side).toLowerCase().trim()}`;
      const now = new Date();

      if (recentSubmissions.has(key)) {
        const prev = recentSubmissions.get(key);
        if (now.getTime() - prev.ts < 30_000) {
          return res.status(200).json({
            success: true,
            isDuplicate: true,
            message: 'RSVP already confirmed and recorded.',
            guest: { ...prev.record, message },
            confirmation: prev.record,
          });
        }
      }

      const submittedAt = now.toISOString();
      const dateFormatted = formatDateTimeICT(now);

      // Website confirmation record — strictly NO `message` field stored on website!
      const websiteConfirmation = {
        id: `rsvp_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
        fullName: fullName.trim(),
        side: String(side).trim(),
        invitationType: invitationType === 'groom' ? 'groom' : 'bride',
        language,
        attendance: Boolean(attendance),
        dateFormatted,
        submittedAt,
      };

      const saveToWebsitePromise = (async () => {
        const list = await readRsvpRecords();
        const updated = [websiteConfirmation, ...list].slice(0, 5000);
        await writeRsvpRecords(updated);
        return websiteConfirmation;
      })();

      const sendToMakePromise = MakeService.sendRSVP({
        fullName,
        side,
        invitationType,
        language,
        message,
        attendance,
        submittedAt,
      });

      const [, webhookResult] = await Promise.all([saveToWebsitePromise, sendToMakePromise]);

      recentSubmissions.set(key, { ts: now.getTime(), record: websiteConfirmation });

      return res.status(201).json({
        success: true,
        message: 'RSVP confirmed on website and dispatched to Make.com.',
        guest: {
          ...websiteConfirmation,
          message,
        },
        confirmation: websiteConfirmation,
        webhookStatus: webhookResult.delivered ? 'delivered' : 'pending_or_logged',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rsvp
   * Returns website attendance confirmations ONLY (never includes guest `message`)
   */
  static async getRSVPs(req, res, next) {
    try {
      const list = await readRsvpRecords();
      const sanitized = list.map(({ message: _omitted, ...rest }) => rest);
      return res.status(200).json({
        success: true,
        count: sanitized.length,
        recentGuests: sanitized,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRSVP(req, res, next) {
    try {
      const { id } = req.params;
      const list = await readRsvpRecords();
      const updated = list.filter((item) => String(item.id) !== String(id));
      await writeRsvpRecords(updated);
      return res.status(200).json({
        success: true,
        count: updated.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearRSVPs(req, res, next) {
    try {
      const side = req.query.invitationType;
      const list = await readRsvpRecords();
      const updated = side ? list.filter((item) => item.invitationType !== side) : [];
      await writeRsvpRecords(updated);
      return res.status(200).json({
        success: true,
        count: updated.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RSVPController;
