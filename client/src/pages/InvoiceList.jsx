import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import Loader from '../components/ui/Loader';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency, formatDate } from '../utils/invoiceCalc';
import { getErrorMessage } from '../utils/constants';
import { FiDownload, FiEdit2, FiEye, FiTrash2, FiCopy, FiFilter } from 'react-icons/fi';

const InvoiceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.toast || null);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/invoices', {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status: status || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        }
      });
      setInvoices(data.data.invoices);
      setMeta(data.data.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load invoices'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, dateFrom, dateTo]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const downloadPdf = async (invoice) => {
    setBusyId(invoice._id);
    try {
      const res = await api.get(`/invoices/${invoice._id}/pdf`, {
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
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to download PDF'));
    } finally {
      setBusyId(null);
    }
  };

  const duplicateInvoice = async (invoice) => {
    setBusyId(invoice._id);
    try {
      const { data } = await api.post(`/invoices/${invoice._id}/duplicate`);
      navigate(`/invoices/edit/${data.data._id}`, { state: { toast: 'Invoice duplicated — review and save' } });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to duplicate invoice'));
      setBusyId(null);
    }
  };

  const deleteInvoice = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    setBusyId(invoice._id);
    try {
      await api.delete(`/invoices/${invoice._id}`);
      setToast('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete invoice'));
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get('/invoices/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoices.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to export CSV'));
    }
  };

  return (
    <div className="page-container">
      {toast && <div className="alert alert-success">{toast}</div>}

      <div className="page-header">
        <div>
          <h2>Invoices</h2>
          <p>{meta.totalItems} total invoices</p>
        </div>
        <div className="table-actions">
          <button className="btn btn-outline" onClick={exportCsv}>Export CSV</button>
          <Link to="/invoices/create" className="btn btn-primary">+ New Invoice</Link>
        </div>
      </div>

      <div className="list-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by invoice number or client name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel glassmorphism">
          <div className="grid-3">
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label>From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
          {(status || dateFrom || dateTo) && (
            <button className="btn btn-sm btn-outline mt-2"
              onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="glassmorphism table-container mt-4">
        {loading ? <Loader label="Loading invoices..." /> : (
          <>
            <Table
              columns={['Invoice No', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions']}
              data={invoices}
              renderRow={(inv) => (
                <tr key={inv._id}>
                  <td>
                    <Link to={`/invoices/view/${inv._id}`} className="link-primary">{inv.invoiceNumber}</Link>
                    {inv.clientSnapshot?.companyName && (
                      <div className="table-sub">{inv.clientSnapshot.companyName}</div>
                    )}
                  </td>
                  <td>{inv.clientSnapshot?.clientName || inv.client?.clientName || '-'}</td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{inv.dueDate ? formatDate(inv.dueDate) : '-'}</td>
                  <td className="text-right">{formatCurrency(inv.grandTotal, inv.currency)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div className="row-actions">
                      <Link className="icon-btn" title="View" to={`/invoices/view/${inv._id}`}><FiEye /></Link>
                      <Link className="icon-btn" title="Edit" to={`/invoices/edit/${inv._id}`}><FiEdit2 /></Link>
                      <button className="icon-btn" title="Download PDF" disabled={busyId === inv._id}
                        onClick={() => downloadPdf(inv)}><FiDownload /></button>
                      <button className="icon-btn" title="Duplicate" disabled={busyId === inv._id}
                        onClick={() => duplicateInvoice(inv)}><FiCopy /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" disabled={busyId === inv._id}
                        onClick={() => deleteInvoice(inv)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              )}
            />
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;