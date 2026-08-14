'use strict';
const renderLayout = require('./layout');

/**
 * Bold — black + amber/yellow, heavy typography, high contrast
 */
module.exports = (invoice, numberToWords) => renderLayout(invoice, {
  font: "Arial, 'Helvetica Neue', sans-serif",
  accent: '#111827',
  strong: '#111827',
  onAccent: '#ffffff',
  rowStripe: '#fafaf9',
  grandTotalBg: '#f59e0b',
  grandTotalColor: '#111827',
  topBorderClass: 'top-border',
  headerStyle: 'border-bottom: 4px solid #111827;',
  titleStyle: 'color: #111827; letter-spacing: 3px;',
}, numberToWords);
