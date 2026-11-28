const express = require('express');
const CmsController = require('../controllers/cmsController');

const router = express.Router();

router.get('/settings', CmsController.getSettings);
router.put('/settings', CmsController.updateSettings);

router.get('/invitations', CmsController.getInvitations);
router.post('/invitations', CmsController.createInvitation);
router.delete('/invitations/:id', CmsController.deleteInvitation);
router.delete('/invitations', CmsController.clearInvitations);

module.exports = router;
