const express = require('express');
const router = express.Router();
const RSVPController = require('../controllers/rsvpController');
const validateRSVP = require('../middlewares/validateRSVP');

// POST /api/rsvp - Submit RSVP
router.post('/', validateRSVP, RSVPController.submitRSVP);

// GET /api/rsvp - Retrieve all RSVPs
router.get('/', RSVPController.getRSVPs);

module.exports = router;
