const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, CLIENT_URL } = require('../config/env');
const resend = require('../config/resend');

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const setTokens = async (res, user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth'
  });

  return accessToken;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({ name, email, password });
  const accessToken = await setTokens(res, user);

  res.status(201).json(new ApiResponse(201, { user: { id: user._id, name, email }, accessToken }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = await setTokens(res, user);
  res.status(200).json(new ApiResponse(200, { user: { id: user._id, name: user.name, email }, accessToken }, 'Logged in successfully'));
});

const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID
  });
  const { name, email, sub, picture } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      avatar: picture,
      authProvider: 'google'
    });
  } else if (!user.googleId) {
    user.googleId = sub;
    await user.save();
  }

  const accessToken = await setTokens(res, user);
  res.status(200).json(new ApiResponse(200, { user: { id: user._id, name, email }, accessToken }, 'Google auth successful'));
});

const googleAuthStart = asyncHandler(async (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET
    || GOOGLE_CLIENT_ID === 'your_google_client_id' || GOOGLE_CLIENT_SECRET === 'your_google_client_secret') {
    throw new ApiError(400, 'Google OAuth is not configured on the server');
  }

  const state = crypto.randomBytes(32).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 10 * 60 * 1000,
    path: '/'
  });

  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account'
  });

  res.redirect(url);
});

const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const cookieState = req.cookies.oauth_state;

  if (error || !state || state !== cookieState) {
    return res.redirect(`${CLIENT_URL}/login?error=${error || 'google_state_mismatch'}`);
  }
  res.clearCookie('oauth_state', { path: '/' });

  if (!code) {
    return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID
  });
  const { name, email, sub, picture } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      avatar: picture,
      authProvider: 'google'
    });
  } else if (!user.googleId) {
    user.googleId = sub;
    await user.save();
  }

  const accessToken = await setTokens(res, user);
  res.redirect(`${CLIENT_URL}/auth/google?token=${encodeURIComponent(accessToken)}`);
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Refresh token not found');
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const accessToken = await setTokens(res, user);
    res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  // Send email via resend
  await resend.emails.send({
    from: 'InvoiceGen <onboarding@resend.dev>',
    to: email,
    subject: 'Password Reset',
    text: `Your reset token is ${resetToken}`
  });

  res.status(200).json(new ApiResponse(200, null, 'Password reset email sent'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'User details retrieved'));
});

module.exports = {
  register,
  login,
  googleAuth,
  googleAuthStart,
  googleAuthCallback,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
