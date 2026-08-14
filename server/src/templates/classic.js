'use strict';
const renderLayout = require('./layout');

/**
 * Classic — clean serif, neutral grey header bar
 */
module.exports = (invoice, numberToWords) => renderLayout(invoice, {
  font: "Georgia, 'Times New Roman', serif",
  accent: '#1e3a5f',
  strong: '#1e3a5f',
  onAccent: '#ffffff',
  rowStripe: '#f8fafc',
  grandTotalBg: '#1e3a5f',
  grandTotalColor: '#ffffff',
  topBorderClass: 'top-border',
}, numberToWords);
