import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import InvoicePreview from '../components/invoice/InvoicePreview';
import StatusBadge from '../components/ui/StatusBadge';
import { getErrorMessage } from '../utils/constants';
import useFitScale from '../hooks/useFitScale';
import { FiDownload, FiEdit2, FiCopy, FiTrash2, FiCheckCircle, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const { ref: previewRef, scale } = useFitScale();
  const { ref: previewModalRef, scale: previewModalScale } = useFitScale(794, [previewModalOpen]);

  const fetchInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Invoice not found'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const downloadPdf = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'arraybuffer',
        headers: { Accept: 'application/pdf' },
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Delay revoke so browser has time to start the download
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to download PDF') });
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await api.patch(`/invoices/${id}/status`, { status: newStatus });
      setInvoice(data.data);
      setMessage({ type: 'success', text: `Invoice marked as ${newStatus}` });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update status') });
    } finally {
      setBusy(false);
    }
  };

  const duplicateInvoice = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/invoices/${id}/duplicate`);
      navigate(`/invoices/edit/${data.data._id}`, { state: { toast: 'Invoice duplicated' } });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to duplicate invoice') });
      setBusy(false);
    }
  };

  const deleteInvoice = async () => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/invoices/${id}`);
      navigate('/invoices', { state: { toast: 'Invoice deleted' } });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to delete invoice') });
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link to="/invoices" className="back-link"><FiArrowLeft /> Back to Invoices</Link>
          <h2 className="mt-2">{invoice.invoiceNumber}</h2>
          <p>
            Issued: {new Date(invoice.issueDate).toLocaleDateString('en-IN')}
            {invoice.dueDate && <> · Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</>}
            {' '}· <StatusBadge status={invoice.status} />
          </p>
        </div>
        <div className="table-actions">
          <button className="btn btn-outline view-live-preview-btn" onClick={() => setPreviewModalOpen(true)}>
            <FiEye /> Live Preview
          </button>
          <button className="btn" onClick={downloadPdf} disabled={busy}>
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="invoice-view-grid">
        <div className="glassmorphism invoice-view-preview" ref={previewRef}>
          <InvoicePreview invoice={invoice} scale={scale} />
        </div>

        <div className="invoice-actions-panel glassmorphism">
          <h3>Actions</h3>
          <button className="btn btn-primary full-width" onClick={downloadPdf} disabled={busy}>
            <FiDownload /> Download PDF
          </button>
          <Link to={`/invoices/edit/${id}`} className="btn btn-outline full-width">
            <FiEdit2 /> Edit Invoice
          </Link>
          <button className="btn btn-outline full-width" onClick={duplicateInvoice} disabled={busy}>
            <FiCopy /> Duplicate
          </button>
          <hr className="panel-divider" />
          <h4>Update Status</h4>
          <div className="status-actions">
            <button
              className="btn btn-sm btn-success"
              disabled={busy || invoice.status === 'paid'}
              onClick={() => updateStatus('paid')}
            >
              <FiCheckCircle /> Mark Paid
            </button>
            <button
              className="btn btn-sm"
              disabled={busy || invoice.status === 'pending'}
              onClick={() => updateStatus('pending')}
            >
              Mark Pending
            </button>
          </div>
          <hr className="panel-divider" />
          <button className="btn btn-danger full-width" onClick={deleteInvoice} disabled={busy}>
            <FiTrash2 /> Delete Invoice
          </button>
        </div>
      </div>

      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Invoice Preview"
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
            <InvoicePreview invoice={invoice} scale={previewModalScale} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceView;