const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
