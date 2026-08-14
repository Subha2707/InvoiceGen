'use strict';

const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const esc = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const gstLabel = (item) => {
  if (item.gstEnabled && Number(item.gstPercentage) > 0) {
    const v = Number(item.gstPercentage);
    return (v % 1 ? v.toFixed(2) : v.toFixed(0)) + '%';
  }
  return '0%';
};

/**
 * @param {object} invoice  - sanitized invoice plain object
 * @param {object} theme    - { accent, strong, onAccent, rowStripe, font, headerBg, headerStyle }
 * @param {Function} numberToWords
 */
const renderLayout = (invoice, theme, numberToWords) => {
  const s = invoice.sellerSnapshot || {};
  const c = invoice.clientSnapshot || {};
  const billing = c.billingAddress || {};
  const shipping = c.shippingAddress || {};
  const showShipping = shipping && !shipping.sameAsBilling && (shipping.address || shipping.receiverName);
  const items = invoice.items || [];

  const accent = theme.accent || '#1f2937';
  const strong = theme.strong || accent;
  const onAccent = theme.onAccent || '#ffffff';
  const rowStripe = theme.rowStripe || '#f9fafb';
  const font = theme.font || "'Helvetica Neue', Arial, sans-serif";

  // Extra per-template overrides
  const headerBg = theme.headerBg || 'transparent';
  const headerStyle = theme.headerStyle || '';
  const titleStyle = theme.titleStyle || '';
  const extraCss = theme.extraCss || '';
  const grandTotalBg = theme.grandTotalBg || 'transparent';
  const grandTotalColor = theme.grandTotalColor || accent;

  const itemRows = items.length === 0
    ? `<tr><td class="no-items" colspan="7">No items added</td></tr>`
    : items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td class="text-left">${esc(item.name || '—')}</td>
          <td class="text-left">${esc(item.description || '')}</td>
          <td>${esc(item.quantity ?? 0)}</td>
          <td>${esc(formatCurrency(item.unitPrice, invoice.currency))}</td>
          <td>${esc(gstLabel(item))}</td>
          <td>${esc(formatCurrency(item.totalPrice ?? (item.quantity * item.unitPrice), invoice.currency))}</td>
        </tr>`).join('');

  const summaryRows = [
    `<div class="sum-row"><span>Subtotal</span><span>${esc(formatCurrency(invoice.subtotal, invoice.currency))}</span></div>`,
    invoice.discountAmount > 0
      ? `<div class="sum-row"><span>Discount${invoice.discount?.type === 'percentage' && invoice.discount?.value ? ` (${invoice.discount.value}%)` : ''}</span><span>− ${esc(formatCurrency(invoice.discountAmount, invoice.currency))}</span></div>`
      : '',
    invoice.totalCgst > 0
      ? `<div class="sum-row"><span>CGST</span><span>${esc(formatCurrency(invoice.totalCgst, invoice.currency))}</span></div>`
      : '',
    invoice.totalSgst > 0
      ? `<div class="sum-row"><span>SGST</span><span>${esc(formatCurrency(invoice.totalSgst, invoice.currency))}</span></div>`
      : '',
    invoice.totalIgst > 0
      ? `<div class="sum-row"><span>IGST</span><span>${esc(formatCurrency(invoice.totalIgst, invoice.currency))}</span></div>`
      : '',
    invoice.shippingCharge > 0
      ? `<div class="sum-row"><span>Shipping</span><span>${esc(formatCurrency(invoice.shippingCharge, invoice.currency))}</span></div>`
      : '',
    invoice.roundOff && invoice.roundOff !== 0
      ? `<div class="sum-row"><span>Round Off</span><span>${esc(formatCurrency(invoice.roundOff, invoice.currency))}</span></div>`
      : '',
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${esc(invoice.invoiceNumber || '')}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${font};
      color: #1f2937;
      font-size: 12.5px;
      line-height: 1.6;
      background: #fff;
    }

    /* ── Sheet ── */
    .sheet { padding: 0; }

    /* ── Header ── */
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      margin-bottom: 20px;
      gap: 16px;
      background: ${headerBg};
      ${headerStyle}
    }
    .top-border { border-bottom: 2px solid ${strong}; }
    .brand { flex: 1; min-width: 0; }
    .brand-logo { max-height: 68px; max-width: 170px; margin-bottom: 8px; display: block; object-fit: contain; }
    .brand-name { font-size: 19px; font-weight: 800; letter-spacing: 0.2px; color: #111827; word-break: break-word; }
    .brand-info { color: #4b5563; font-size: 11.5px; margin-top: 2px; }

    .doc-head { text-align: right; flex-shrink: 0; min-width: 200px; }
    .doc-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 4px;
      color: ${accent};
      margin-bottom: 10px;
      ${titleStyle}
    }
    .meta { font-size: 11.5px; color: #6b7280; line-height: 1.7; }
    .meta strong { color: #111827; font-weight: 600; }

    /* ── Parties ── */
    .parties { display: flex; gap: 40px; margin-bottom: 20px; }
    .party { flex: 1; min-width: 0; }
    .party h3 {
      font-size: 10.5px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: ${accent};
      border-bottom: 1.5px solid #e5e7eb;
      padding-bottom: 4px; margin-bottom: 7px;
    }
    .party p { font-size: 12px; color: #374151; margin: 2px 0; }
    .party strong { font-weight: 700; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th {
      background: ${accent};
      color: ${onAccent};
      padding: 9px 11px;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
      letter-spacing: 0.3px;
    }
    thead th:first-child { text-align: left; }
    thead th:nth-child(2) { text-align: left; }
    thead th:nth-child(3) { text-align: left; }
    tbody td {
      padding: 8px 11px;
      font-size: 12px;
      border-bottom: 1px solid #e5e7eb;
      text-align: right;
      vertical-align: top;
    }
    tbody td:first-child { text-align: left; }
    tbody td.text-left { text-align: left; }
    tbody tr:nth-child(even) { background: ${rowStripe}; }
    td.no-items { text-align: center; color: #9ca3af; padding: 20px 0; }

    /* ── Footer row ── */
    .foot { display: flex; justify-content: flex-end; align-items: flex-start; gap: 24px; margin-top: 4px; }
    .notes-sec { flex: 1; min-width: 0; padding-right: 8px; }
    .notes-sec h4 {
      font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px;
      color: ${accent}; margin: 10px 0 4px;
    }
    .notes-sec h4:first-child { margin-top: 0; }
    .notes-sec p { font-size: 11.5px; color: #4b5563; white-space: pre-wrap; margin-bottom: 6px; }

    /* ── Summary ── */
    .summary {
      width: 280px;
      flex-shrink: 0;
      border: 1px solid #e5e7eb;
      border-top: 3px solid ${accent};
      background: #fcfcfd;
      border-radius: 6px;
      overflow: hidden;
    }
    .summary-inner { padding: 12px 14px; }
    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 12px;
    }
    .sum-row span:last-child { font-weight: 600; }
    .sum-grand-wrap {
      background: ${grandTotalBg !== 'transparent' ? grandTotalBg : accent};
      padding: 10px 14px;
      margin-top: 2px;
    }
    .sum-grand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14.5px;
      font-weight: 800;
      color: ${grandTotalBg !== 'transparent' ? '#111827' : onAccent};
    }
    .words {
      font-size: 10.5px;
      color: ${grandTotalBg !== 'transparent' ? '#4b5563' : 'rgba(255,255,255,0.8)'};
      font-style: italic;
      margin-top: 5px;
    }

    /* ── Signature ── */
    .signature { margin-top: 44px; display: flex; justify-content: flex-end; }
    .sig-box { width: 220px; text-align: center; }
    .sig-img { max-height: 56px; max-width: 190px; display: block; margin: 0 auto 3px; object-fit: contain; }
    .sig-authority { font-size: 12.5px; font-weight: 700; color: #111827; }
    .sig-line { border-top: 1.5px solid #374151; margin-top: 7px; padding-top: 5px; }
    .sig-line span { font-size: 11px; color: #4b5563; }

    ${extraCss}
  </style>
</head>
<body>
  <div class="sheet">

    <div class="top ${theme.topBorderClass || 'top-border'}">
      <div class="brand">
        ${s.logo && s.logo.data ? `<img class="brand-logo" src="data:${esc(s.logo.contentType || 'image/png')};base64,${s.logo.data}" alt="logo" />` : ''}
        <div class="brand-name">${esc(s.businessName || 'Your Business')}</div>
        ${s.address ? `<div class="brand-info">${esc(s.address)}</div>` : ''}
        ${(s.email || s.phone) ? `<div class="brand-info">${esc([s.email, s.phone].filter(Boolean).join('  |  '))}</div>` : ''}
        ${s.gstNumber ? `<div class="brand-info">GSTIN: ${esc(s.gstNumber)}</div>` : ''}
      </div>
      <div class="doc-head">
        <div class="doc-title">INVOICE</div>
        <div class="meta">
          <div>Invoice No: <strong>${esc(invoice.invoiceNumber || '—')}</strong></div>
          ${invoice.issueDate ? `<div>Issue Date: <strong>${esc(fmtDate(invoice.issueDate))}</strong></div>` : ''}
          ${invoice.dueDate ? `<div>Due Date: <strong>${esc(fmtDate(invoice.dueDate))}</strong></div>` : ''}
          ${invoice.status ? `<div>Status: <strong>${esc(invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1))}</strong></div>` : ''}
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>Bill To</h3>
        <p><strong>${esc(c.clientName || 'Client')}</strong></p>
        ${c.companyName ? `<p>${esc(c.companyName)}</p>` : ''}
        ${billing.address ? `<p>${esc(billing.address)}</p>` : ''}
        ${(billing.city || billing.state) ? `<p>${esc([billing.city, billing.state].filter(Boolean).join(', '))}${billing.pincode ? ` - ${esc(billing.pincode)}` : ''}</p>` : ''}
        ${c.gstNumber ? `<p>GSTIN: ${esc(c.gstNumber)}</p>` : ''}
      </div>
      ${showShipping ? `
      <div class="party">
        <h3>Ship To</h3>
        <p><strong>${esc(shipping.receiverName || c.clientName || 'Receiver')}</strong></p>
        ${shipping.company ? `<p>${esc(shipping.company)}</p>` : ''}
        ${shipping.address ? `<p>${esc(shipping.address)}</p>` : ''}
        ${(shipping.city || shipping.state) ? `<p>${esc([shipping.city, shipping.state].filter(Boolean).join(', '))}${shipping.pincode ? ` - ${esc(shipping.pincode)}` : ''}</p>` : ''}
        ${shipping.phone ? `<p>Ph: ${esc(shipping.phone)}</p>` : ''}
      </div>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>GST</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="foot">
      <div class="notes-sec">
        ${invoice.notes ? `<h4>Notes</h4><p>${esc(invoice.notes)}</p>` : ''}
        ${invoice.termsAndConditions ? `<h4>Terms &amp; Conditions</h4><p>${esc(invoice.termsAndConditions)}</p>` : ''}
      </div>
      <div class="summary">
        <div class="summary-inner">
          ${summaryRows}
        </div>
        <div class="sum-grand-wrap">
          <div class="sum-grand">
            <span>Grand Total</span>
            <span>${esc(formatCurrency(invoice.grandTotal, invoice.currency))}</span>
          </div>
          <div class="words">${esc(numberToWords(invoice.grandTotal))}</div>
        </div>
      </div>
    </div>

    <div class="signature">
      <div class="sig-box">
        ${s.signature && s.signature.data ? `<img class="sig-img" src="data:${esc(s.signature.contentType || 'image/png')};base64,${s.signature.data}" alt="signature" />` : ''}
        <div class="sig-authority">Authorized Signatory</div>
        <div class="sig-line">
          ${(s.ownerName || s.businessName) ? `<span>${esc([s.ownerName, s.businessName].filter(Boolean).join(' · '))}</span>` : ''}
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
};

module.exports = renderLayout;
