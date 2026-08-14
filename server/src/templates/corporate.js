'use strict';
const renderLayout = require('./layout');

/**
 * Corporate — professional navy/slate, structured layout
 */
module.exports = (invoice, numberToWords) => renderLayout(invoice, {
  font: "Arial, 'Helvetica Neue', sans-serif",
  accent: '#0f2d55',
  strong: '#0f2d55',
  onAccent: '#ffffff',
  rowStripe: '#f1f5f9',
  grandTotalBg: '#0f2d55',
  grandTotalColor: '#ffffff',
  topBorderClass: 'top-border',
  headerStyle: 'border-top: 5px solid #0f2d55; padding-top: 16px;',
}, numberToWords);
