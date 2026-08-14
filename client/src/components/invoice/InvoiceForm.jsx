import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../api/axios';
import Loader from '../ui/Loader';
import ItemEditor from './ItemEditor';
import InvoicePreview from './InvoicePreview';
import Modal from '../ui/Modal';
import { calculateInvoiceTotals, formatCurrency } from '../../utils/invoiceCalc';
import { INVOICE_TEMPLATES, getErrorMessage } from '../../utils/constants';
import useFitScale from '../../hooks/useFitScale';

const emptyItem = () => ({ name: '', description: '', quantity: 1, unitPrice: 0, gstEnabled: false, gstPercentage: 0 });

const toInputItems = (items) => {
  if (!items || items.length === 0) return [emptyItem()];
  return items.map(item => ({
    name: item.name || '',
    description: item.description || '',
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    gstEnabled: !!item.gstEnabled,
    gstPercentage: item.gstPercentage || 0
  }));
};

const toServerItems = (items) => {
  return items
    .filter(item => item.name || item.unitPrice > 0)
    .map(item => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstEnabled: item.gstEnabled,
      gstPercentage: item.gstPercentage
    }));
};

const InvoiceForm = ({ invoice }) => {
  const navigate = useNavigate();
  const isEdit = !!invoice;

  const [clients, setClients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(max-width: 1100px)').matches ? false : true;
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const { ref: previewRef, scale } = useFitScale(794, [previewOpen]);
  const { ref: previewModalRef, scale: previewModalScale } = useFitScale(794, [previewModalOpen]);

  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDateMode, setDueDateMode] = useState(invoice?.dueDate ? 'custom' : '15');
  const [customDueDate, setCustomDueDate] = useState(invoice?.dueDate ? invoice.dueDate.split('T')[0] : '');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState(invoice?.status || 'pending');
  const [template, setTemplate] = useState(invoice?.template || profile?.defaultTemplate || 'classic');
  const [currency, setCurrency] = useState(invoice?.currency || 'INR');
  const [discountType, setDiscountType] = useState(invoice?.discount?.type || 'percentage');
  const [discountValue, setDiscountValue] = useState(invoice?.discount?.value || 0);
  const [shippingCharge, setShippingCharge] = useState(invoice?.shippingCharge || 0);
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [termsAndConditions, setTermsAndConditions] = useState(invoice?.termsAndConditions || '');
  const [items, setItems] = useState(toInputItems(invoice?.items));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, profileRes] = await Promise.all([
          api.get('/clients', { params: { limit: 100 } }),
          api.get('/business')
        ]);
        setClients(clientsRes.data.data.clients || []);
        const p = profileRes.data.data || null;
        setProfile(p);
        if (!isEdit) setTemplate(p?.defaultTemplate || 'classic');
      } catch (err) {
        setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to load data') });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit]);

  useEffect(() => {
    if (!issueDate) return;
    if (dueDateMode === 'custom') {
      setDueDate(customDueDate || '');
    } else {
      const d = new Date(issueDate);
      if (dueDateMode !== 'today') d.setDate(d.getDate() + parseInt(dueDateMode, 10));
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [issueDate, dueDateMode, customDueDate]);

  const selectedClient = clients.find(c => c._id === clientId);

  const totals = useMemo(() => {
    const sellerStateCode = profile?.stateCode;
    const clientStateCode = selectedClient?.billingAddress?.stateCode;
    return calculateInvoiceTotals(
      items,
      { type: discountType, value: discountValue },
      parseFloat(shippingCharge) || 0,
      sellerStateCode,
      clientStateCode
    );
  }, [items, discountType, discountValue, shippingCharge, profile, selectedClient]);

  const previewInvoice = useMemo(() => {
    const sellerSnapshot = profile || {};
    const clientSnapshot = selectedClient || {};
    return {
      invoiceNumber: invoice?.invoiceNumber,
      issueDate,
      dueDate,
      status,
      template,
      currency,
      sellerSnapshot,
      clientSnapshot,
      items: totals.items,
      isInterState: totals.isInterState,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      totalCgst: totals.totalCgst,
      totalSgst: totals.totalSgst,
      totalIgst: totals.totalIgst,
      totalTax: totals.totalTax,
      shippingCharge: totals.shippingCharge,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      notes,
      termsAndConditions
    };
  }, [profile, selectedClient, invoice, issueDate, dueDate, status, template, currency, totals, notes, termsAndConditions]);

  const buildPayload = () => ({
    clientId,
    issueDate,
    dueDate,
    status,
    template,
    currency,
    items: toServerItems(items),
    discount: { type: discountType, value: discountValue },
    shippingCharge: parseFloat(shippingCharge) || 0,
    notes,
    termsAndConditions
  });

  const handleSave = async (andGeneratePdf = false) => {
    if (!clientId) {
      setMessage({ type: 'error', text: 'Please select a client' });
      return;
    }
    if (toServerItems(items).length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item with a name or price' });
      return;
    }
    if (issueDate && dueDate && new Date(dueDate) < new Date(issueDate)) {
      setMessage({ type: 'error', text: 'Due date cannot be before issue date' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      let savedInvoice;
      if (isEdit) {
        const { data } = await api.put(`/invoices/${invoice._id}`, buildPayload());
        savedInvoice = data.data;
      } else {
        const { data } = await api.post('/invoices', buildPayload());
        savedInvoice = data.data;
      }

      if (andGeneratePdf) {
        setGenerating(true);
        const pdfRes = await api.get(`/invoices/${savedInvoice._id}/pdf`, {
          responseType: 'arraybuffer',
          headers: { Accept: 'application/pdf' },
        });
        const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${savedInvoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1500);
      }

      navigate('/invoices', {
        state: { toast: andGeneratePdf ? 'Invoice saved and PDF downloaded' : 'Invoice saved successfully' }
      });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to save invoice') });
      setSaving(false);
      setGenerating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{isEdit ? `Edit Invoice ${invoice.invoiceNumber}` : 'Create Invoice'}</h2>
          <p>
            Invoice number {isEdit ? invoice.invoiceNumber : ''} and issue date are auto-generated.
            {isEdit ? '' : ' A sequential number (INV-YYYY-XXXXX) is assigned on save.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline live-preview-btn"
          onClick={() => setPreviewModalOpen(true)}
        >
          <FiEye /> Live Preview
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="invoice-builder">
        <div className="invoice-form-panel glassmorphism">
          <section className="form-section">
            <h3>Invoice Details</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Client *</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">Select client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.clientName}{c.companyName ? ` (${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="form-hint empty-client-hint">
                    No clients saved yet. <Link to="/clients">Add a client</Link> first — the dropdown lists only your saved clients.
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <select value={dueDateMode} onChange={e => setDueDateMode(e.target.value)}>
                  <option value="today">Today</option>
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>
              {dueDateMode === 'custom' && (
                <div className="form-group">
                  <label>Custom Due Date</label>
                  <input type="date" value={customDueDate} onChange={e => setCustomDueDate(e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label>Template</label>
                <div className="template-selector">
                  {INVOICE_TEMPLATES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      className={`template-chip ${template === t.value ? 'active' : ''}`}
                      onClick={() => setTemplate(t.value)}
                    >
                      <span className={`template-swatch ${t.value}`} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <ItemEditor
              items={items}
              setItems={setItems}
              sellerStateCode={profile?.stateCode}
              clientStateCode={selectedClient?.billingAddress?.stateCode}
              currency={currency}
            />
            <p className="form-hint">
              {totals.isInterState
                ? 'Inter-state sale — IGST will be applied'
                : 'Intra-state sale — GST split into CGST + SGST'}
            </p>
          </section>

          <section className="form-section">
            <h3>Summary Settings</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Discount Type</label>
                <select value={discountType} onChange={e => setDiscountType(e.target.value)}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Value</label>
                <input type="number" min="0" step="0.01" value={discountValue}
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label>Shipping Charge (Optional)</label>
                <input type="number" min="0" step="0.01" value={shippingCharge}
                  onChange={e => setShippingCharge(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Thank you for your business." />
            </div>
            <div className="form-group">
              <label>Terms & Conditions</label>
              <textarea rows="2" value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)}
                placeholder="e.g. Payment due within the mentioned due date." />
            </div>
          </section>

          <section className="form-section">
            <h3>Calculated Summary</h3>
            <div className="summary-box">
              <div><span>Subtotal</span><span>{formatCurrency(totals.subtotal, currency)}</span></div>
              {totals.discountAmount > 0 && (
                <div><span>Discount ({discountValue}{discountType === 'percentage' ? '%' : ''})</span><span>-{formatCurrency(totals.discountAmount, currency)}</span></div>
              )}
              <div><span>CGST</span><span>{formatCurrency(totals.totalCgst, currency)}</span></div>
              <div><span>SGST</span><span>{formatCurrency(totals.totalSgst, currency)}</span></div>
              <div><span>IGST</span><span>{formatCurrency(totals.totalIgst, currency)}</span></div>
              <div><span>Shipping</span><span>{formatCurrency(totals.shippingCharge, currency)}</span></div>
              {totals.roundOff !== 0 && (
                <div><span>Round Off</span><span>{formatCurrency(totals.roundOff, currency)}</span></div>
              )}
              <div className="summary-total"><span>Grand Total</span><span>{formatCurrency(totals.grandTotal, currency)}</span></div>
            </div>
          </section>
        </div>

        <div className="invoice-preview-panel glassmorphism${previewOpen ? '' : ' collapsed'}">
          <div className="preview-header">
            <h3>Live Preview</h3>
            <button
              type="button"
              className="preview-toggle-btn"
              onClick={() => setPreviewOpen(!previewOpen)}
              title={previewOpen ? 'Hide preview' : 'Show preview'}
            >
              {previewOpen ? <FiEyeOff /> : <FiEye />}
              <span>{previewOpen ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>
          {previewOpen && (
            <div className="preview-scroll" ref={previewRef}>
              <div className="preview-scale">
                <InvoicePreview invoice={previewInvoice} scale={scale} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Live Preview"
        className="preview-modal"
      >
        <div className="preview-modal-top">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setPreviewModalOpen(false)}
          >
            <FiEyeOff /> Hide Preview
          </button>
        </div>
        <div className="preview-scroll preview-scroll-modal" ref={previewModalRef}>
          <div className="preview-scale">
            <InvoicePreview invoice={previewInvoice} scale={previewModalScale} />
          </div>
        </div>
      </Modal>

      <div className="form-actions sticky-actions">
        <button className="btn btn-outline" onClick={() => handleSave(false)} disabled={saving || generating}>
          {isEdit ? 'Save Changes' : 'Save Draft'}
        </button>
        <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving || generating}>
          {generating ? 'Generating PDF...' : saving ? 'Saving...' : 'Save & Generate PDF'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;