'use strict';
const renderLayout = require('./layout');

/**
 * Modern — clean sans-serif, vivid blue, borderless table
 */
module.exports = (invoice, numberToWords) => renderLayout(invoice, {
  font: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  accent: '#2563eb',
  strong: '#1d4ed8',
  onAccent: '#ffffff',
  rowStripe: '#eff6ff',
  grandTotalBg: '#2563eb',
  grandTotalColor: '#ffffff',
  topBorderClass: 'top-border',
}, numberToWords);
