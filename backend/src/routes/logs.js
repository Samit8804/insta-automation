const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getLogs, getLogsByGroup, createLog } = require('../controllers/logController');

const router = Router();
router.use(auth);

router.get('/', getLogs);
router.get('/group/:groupId', getLogsByGroup);
router.post('/', createLog);

module.exports = router;
