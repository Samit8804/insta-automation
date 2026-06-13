const { Router } = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  pauseSchedule,
} = require('../controllers/scheduleController');

const router = Router();
router.use(auth);

router.get('/', getSchedules);
router.post('/', [
  body('interval').isIn(['15sec', '30min', '1hour', '2hours', '6hours', 'custom']),
  body('activeDays').isArray().withMessage('Active days must be an array'),
], createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.patch('/:id/pause', pauseSchedule);

module.exports = router;
