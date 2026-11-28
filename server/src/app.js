const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rsvpRoutes = require('./routes/rsvpRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const config = require('./config/env');

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*', // Allow connections from frontend dev server or production preview
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'wedding-invitation-api',
    time: new Date().toISOString(),
    env: config.nodeEnv,
    makeWebhookConfigured: Boolean(config.makeWebhookUrl),
  });
});

// API Routes
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/cms', cmsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
