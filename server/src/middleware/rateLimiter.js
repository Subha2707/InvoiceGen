const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many auth requests from this IP, please try again after 15 minutes'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many PDF generations from this IP, please try again after 15 minutes'
});

module.exports = {
  authLimiter,
  apiLimiter,
  pdfLimiter
};
