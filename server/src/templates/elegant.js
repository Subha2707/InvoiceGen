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
  headerStyle: 'flex-direction: column; align-items: center; text-align: center; gap: 6px;',
  titleStyle: 'letter-spacing: 7px; font-size: 26px;',
  extraCss: `
    .brand { text-align: center; }
    .brand-logo { margin-left: auto; margin-right: auto; }
    .doc-head { text-align: center; min-width: 0; width: 100%; padding-top: 10px; }
    .sheet { border-top: 2px solid #92680a; border-bottom: 2px solid #92680a; padding-top: 14px; padding-bottom: 14px; }
  `,
}, numberToWords);
