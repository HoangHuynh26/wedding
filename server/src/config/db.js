const fs = require('fs').promises;
const path = require('path');
const config = require('./env');

const dbFilePath = path.resolve(__dirname, '../../', config.databaseUrl);

class Database {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      const dir = path.dirname(dbFilePath);
      await fs.mkdir(dir, { recursive: true });
      try {
        await fs.access(dbFilePath);
      } catch {
        await fs.writeFile(dbFilePath, JSON.stringify([], null, 2), 'utf-8');
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async readAll() {
    await this.init();
    try {
      const content = await fs.readFile(dbFilePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (error) {
      console.error('Error reading database file:', error);
      return [];
    }
  }

  async writeAll(data) {
    await this.init();
    try {
      await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing to database file:', error);
      throw error;
    }
  }
}

const db = new Database();

module.exports = db;
