const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'cms_settings.json');
const INVITATIONS_FILE = path.join(DATA_DIR, 'invitations.json');

async function readJsonFile(filePath, fallback) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

class CmsController {
  static async getSettings(req, res, next) {
    try {
      const settings = await readJsonFile(SETTINGS_FILE, null);
      return res.status(200).json({
        success: true,
        settings: settings || null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const incoming = req.body && typeof req.body === 'object' ? req.body : {};
      const existing = (await readJsonFile(SETTINGS_FILE, {})) || {};
      const merged = {
        ...existing,
        ...incoming,
        updatedAt: new Date().toISOString(),
      };
      await writeJsonFile(SETTINGS_FILE, merged);
      return res.status(200).json({
        success: true,
        settings: merged,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getInvitations(req, res, next) {
    try {
      const list = await readJsonFile(INVITATIONS_FILE, []);
      return res.status(200).json({
        success: true,
        count: Array.isArray(list) ? list.length : 0,
        invitations: Array.isArray(list) ? list : [],
      });
    } catch (err) {
      next(err);
    }
  }

  static async createInvitation(req, res, next) {
    try {
      const body = req.body || {};
      if (!body.guestName || !body.url) {
        return res.status(400).json({
          success: false,
          message: 'guestName and url are required.',
        });
      }
      const list = await readJsonFile(INVITATIONS_FILE, []);
      const safeList = Array.isArray(list) ? list : [];

      const record = {
        id: body.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        side: body.side === 'groom' ? 'groom' : 'bride',
        guestName: String(body.guestName).trim(),
        inviter: String(body.inviter || '').trim(),
        lang: body.lang || 'vi',
        langLabel: body.langLabel || 'Tiếng Việt',
        langFlag: body.langFlag || '🇻🇳',
        songId: body.songId || 'young-and-beautiful',
        songTitle: body.songTitle || 'Young and Beautiful',
        songArtist: body.songArtist || 'Lana Del Rey',
        url: String(body.url).trim(),
        createdAt: body.createdAt || new Date().toISOString(),
        createdDisplay:
          body.createdDisplay ||
          new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      };

      const updated = [record, ...safeList].slice(0, 5000);
      await writeJsonFile(INVITATIONS_FILE, updated);
      return res.status(201).json({
        success: true,
        invitation: record,
        count: updated.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteInvitation(req, res, next) {
    try {
      const { id } = req.params;
      const list = await readJsonFile(INVITATIONS_FILE, []);
      const safeList = Array.isArray(list) ? list : [];
      const updated = safeList.filter((item) => String(item.id) !== String(id));
      await writeJsonFile(INVITATIONS_FILE, updated);
      return res.status(200).json({
        success: true,
        count: updated.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async clearInvitations(req, res, next) {
    try {
      const side = req.query.side;
      const list = await readJsonFile(INVITATIONS_FILE, []);
      const safeList = Array.isArray(list) ? list : [];
      const updated = side ? safeList.filter((item) => item.side !== side) : [];
      await writeJsonFile(INVITATIONS_FILE, updated);
      return res.status(200).json({
        success: true,
        count: updated.length,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CmsController;
