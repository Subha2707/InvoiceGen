'use strict';
const renderLayout = require('./layout');

/**
 * Elegant — serif, warm gold, centred header
 */
module.exports = (invoice, numberToWords) => renderLayout(invoice, {
  font: "Georgia, 'Times New Roman', serif",
  accent: '#92680a',
  strong: '#92680a',
  onAccent: '#fff8e7',
  rowStripe: '#fdfbf5',
  grandTotalBg: '#92680a',
  grandTotalColor: '#fff8e7',
  topBorderClass: 'top-border',
}, numberToWords);
