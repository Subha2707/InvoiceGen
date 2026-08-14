import React, { useRef, useLayoutEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/invoiceCalc';
import numberToWords from '../../utils/numberToWords';

const InvoicePreview = ({ invoice, scale = 1 }) => {
  const seller = invoice.sellerSnapshot || {};
  const client = invoice.clientSnapshot || {};
  const billing = client ? client.billingAddress || {} : {};
  const shipping = client ? client.shippingAddress || {} : {};
  const items = invoice.items || [];
  const template = invoice.template || 'classic';

  const showShipping = !shipping.sameAsBilling;

  const baseWidth = 794;
  const baseHeight = 1123;

  const innerRef = useRef(null);
  const [sheetH, setSheetH] = useState(baseHeight);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setSheetH(el.offsetHeight || baseHeight);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    return () => ro && ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="invoice-preview-wrapper"
      data-template={template}
      style={{
        width: baseWidth * scale,
        height: sheetH * scale,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}
    >
      <div
        ref={innerRef}
        data-sheet
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          flexShrink: 0,
        }}
      >
        <div className="invoice-sheet">
        <div className="ip-header">
          <div className="ip-seller">
            {seller.logo?.data && (
              <img
                className="ip-logo"
                src={`data:${seller.logo.contentType};base64,${seller.logo.data}`}
                alt="logo"
              />
            )}
            <h2 className="ip-business">{seller.businessName || 'Your Business'}</h2>
            {seller.address && <p>{seller.address}</p>}
            <p>
              {[seller.email, seller.phone].filter(Boolean).join('  |  ')}
            </p>
            {seller.gstNumber && <p>GSTIN: {seller.gstNumber}</p>}
          </div>
          <div className="ip-meta">
            <h1 className="ip-title">INVOICE</h1>
            <p><span>Invoice No:</span> <strong>{invoice.invoiceNumber || 'Auto-generated'}</strong></p>
            <p><span>Issue Date:</span> {formatDate(invoice.issueDate)}</p>
            {invoice.dueDate && <p><span>Due Date:</span> {formatDate(invoice.dueDate)}</p>}
            <p><span>Status:</span> <strong className={`ip-status ip-status-${invoice.status || 'draft'}`}>{invoice.status || 'draft'}</strong></p>
          </div>
        </div>

        <div className="ip-parties">
          <div className="ip-bill-to">
            <h4>Bill To</h4>
            <p className="ip-party-name">{client.clientName || 'Client'}</p>
            {client.companyName && <p>{client.companyName}</p>}
            {billing.address && <p>{billing.address}</p>}
            <p>{[billing.state, billing.pincode].filter(Boolean).join(' - ')}</p>
            {client.gstNumber && <p>GSTIN: {client.gstNumber}</p>}
          </div>
          {showShipping && (
            <div className="ip-ship-to">
              <h4>Ship To</h4>
              <p className="ip-party-name">{shipping.receiverName || client.clientName}</p>
              {shipping.company && <p>{shipping.company}</p>}
              {shipping.address && <p>{shipping.address}</p>}
              <p>{[shipping.state, shipping.pincode].filter(Boolean).join(' - ')}</p>
              {shipping.phone && <p>Ph: {shipping.phone}</p>}
            </div>
          )}
        </div>

        <table className="ip-items">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Item</th>
              <th className="text-left">Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>GST %</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan="7" className="text-center">No items added yet</td></tr>
            )}
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td className="text-left">{item.name}</td>
                <td className="text-left">{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td>{item.gstEnabled && Number(item.gstPercentage) > 0 ? `${item.gstPercentage}%` : '0%'}</td>
                <td>{formatCurrency(item.totalPrice || item.quantity * item.unitPrice, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ip-bottom">
          <div className="ip-notes">
            {invoice.notes && (
              <div>
                <h4>Notes</h4>
                <p>{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <h4>Terms & Conditions</h4>
                <p>{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>

          <div className="ip-summary">
            <div className="ip-summary-inner">
              <div className="ip-sum-row"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
              {invoice.discountAmount > 0 && (
                <div className="ip-sum-row"><span>Discount</span><span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span></div>
              )}
              {invoice.totalCgst > 0 && <div className="ip-sum-row"><span>CGST</span><span>{formatCurrency(invoice.totalCgst, invoice.currency)}</span></div>}
              {invoice.totalSgst > 0 && <div className="ip-sum-row"><span>SGST</span><span>{formatCurrency(invoice.totalSgst, invoice.currency)}</span></div>}
              {invoice.totalIgst > 0 && <div className="ip-sum-row"><span>IGST</span><span>{formatCurrency(invoice.totalIgst, invoice.currency)}</span></div>}
              {invoice.shippingCharge > 0 && (
                <div className="ip-sum-row"><span>Shipping</span><span>{formatCurrency(invoice.shippingCharge, invoice.currency)}</span></div>
              )}
              {invoice.roundOff !== 0 && invoice.roundOff !== undefined && (
                <div className="ip-sum-row"><span>Round Off</span><span>{formatCurrency(invoice.roundOff, invoice.currency)}</span></div>
              )}
            </div>
            <div className="ip-grand-total-wrap">
              <div className="ip-grand-total"><span>Grand Total</span><span>{formatCurrency(invoice.grandTotal, invoice.currency)}</span></div>
              <p className="ip-in-words">{numberToWords(invoice.grandTotal)}</p>
            </div>
          </div>
        </div>

        <div className="ip-signature">
          <div className="ip-sig-box">
            {seller.signature?.data && (
              <img
                className="ip-sig-img"
                src={`data:${seller.signature.contentType};base64,${seller.signature.data}`}
                alt="signature"
              />
            )}
            <div className="ip-sig-authority">Authorized Signatory</div>
            <div className="ip-sig-line">
              {(seller.ownerName || seller.businessName) && (
                <span>{[seller.ownerName, seller.businessName].filter(Boolean).join(' · ')}</span>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
