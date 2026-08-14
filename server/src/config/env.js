require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

const requiredKeys = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
for (const key of requiredKeys) {
  if (!env[key]) {
    console.warn(`Warning: Missing required environment variable ${key}`);
  }
}

module.exports = env;
