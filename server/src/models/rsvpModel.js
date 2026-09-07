const db = require('../config/db');

class RSVPModel {
  static async create({ fullName, location, attendance = true, submittedAt = new Date().toISOString() }) {
    const list = await db.readAll();
    const newRecord = {
      id: `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      location: location.trim(),
      attendance: Boolean(attendance),
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    list.push(newRecord);
    await db.writeAll(list);
    return newRecord;
  }

  static async findAll() {
    return await db.readAll();
  }

  static async findByGuest(fullName, location) {
    const list = await db.readAll();
    const cleanName = fullName.trim().toLowerCase();
    const cleanLocation = location ? location.trim().toLowerCase() : '';

    return list.find(
      (item) =>
        item.fullName.toLowerCase() === cleanName &&
        (!cleanLocation || item.location.toLowerCase() === cleanLocation)
    );
  }

  static async count() {
    const list = await db.readAll();
    return list.length;
  }
}

module.exports = RSVPModel;
