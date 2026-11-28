const express = require('express');
const router = express.Router();
const RSVPController = require('../controllers/rsvpController');
const validateRSVP = require('../middlewares/validateRSVP');

// POST /api/rsvp - Submit RSVP
router.post('/', validateRSVP, RSVPController.submitRSVP);

// GET /api/rsvp - Retrieve all RSVPs (attendance confirmations only, without guest messages)
router.get('/', RSVPController.getRSVPs);

// DELETE /api/rsvp/:id - Remove a single RSVP confirmation
router.delete('/:id', RSVPController.deleteRSVP);

// DELETE /api/rsvp - Clear RSVP confirmations
router.delete('/', RSVPController.clearRSVPs);

module.exports = router;
