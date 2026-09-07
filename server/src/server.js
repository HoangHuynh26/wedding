const app = require('./app');
const config = require('./config/env');

async function startServer() {
  try {
    app.listen(config.port, () => {
      console.log(`=============================================`);
      console.log(`💍 Wedding Invitation Server running on port ${config.port}`);
      console.log(`🌐 API Endpoint: http://localhost:${config.port}/api/rsvp`);
      console.log(`💓 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`📊 Storage Destination: Make.com -> Excel`);
      console.log(`🔔 Make.com Webhook: ${config.makeWebhookUrl ? 'Configured' : 'Not configured (fallback mode)'}`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
