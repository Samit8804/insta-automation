const router = require('express').Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/aiReplyController');

router.get('/settings', auth, ctrl.getSettings);
router.put('/settings', auth, ctrl.updateSettings);
router.get('/models', auth, ctrl.getModels);
router.post('/trigger', auth, ctrl.triggerReply);

module.exports = router;
