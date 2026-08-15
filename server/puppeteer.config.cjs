const { join } = require('path');

/**
 * Render does not persist $HOME/.cache between the build and runtime phases,
 * so Puppeteer's default Chromium location is empty in production. Store the
 * browser inside node_modules instead, which IS persisted and cached by Render.
 */
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};