const express = require('express');
const { register, login, googleAuth, googleAuthStart, googleAuthCallback, refreshToken, logout, forgotPassword, resetPassword, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/google', authLimiter, googleAuthStart);
router.get('/google/callback', googleAuthCallback);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
