const { Router } = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleGroup,
} = require('../controllers/groupController');

const router = Router();
router.use(auth);

router.get('/', getGroups);
router.post('/', [
  body('groupName').trim().notEmpty().withMessage('Group name is required'),
  body('targetGroup').trim().notEmpty().withMessage('Target group is required'),
], createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.patch('/:id/toggle', toggleGroup);

module.exports = router;
