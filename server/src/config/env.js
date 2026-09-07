const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  makeWebhookUrl: process.env.MAKE_WEBHOOK_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
};

module.exports = config;
