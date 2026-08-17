import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';
import Avatar from '../components/ui/Avatar';
import { useToast } from '../components/ui/Toast';
import { useDebounce } from '../hooks/useDebounce';
import { INDIAN_STATES, getErrorMessage } from '../utils/constants';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const emptyForm = {
  clientName: '', companyName: '', gstNumber: '', email: '', phone: '',
  address: '', state: '', pincode: '',
  sameAsBilling: true,
  receiverName: '', s_company: '', s_address: '', s_state: '', s_pincode: '', s_phone: ''
};

const Clients = () => {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/clients', {
        params: { page, limit, search: debouncedSearch }
      });
      setClients(data.data.clients);
      setMeta(data.data.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load clients'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditingId(client._id);
    const ship = client.shippingAddress || {};
    setFormData({
      clientName: client.clientName || '',
      companyName: client.companyName || '',
      gstNumber: client.gstNumber || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.billingAddress?.address || '',
      state: client.billingAddress?.state || '',
      pincode: client.billingAddress?.pincode || '',
      sameAsBilling: ship.sameAsBilling !== false,
      receiverName: ship.receiverName || '',
      s_company: ship.company || '',
      s_address: ship.address || '',
      s_state: ship.state || '',
      s_pincode: ship.pincode || '',
      s_phone: ship.phone || ''
    });
    setError(null);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        clientName: formData.clientName,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        email: formData.email,
        phone: formData.phone,
        billingAddress: {
          address: formData.address,
          state: formData.state,
          pincode: formData.pincode
        },
        shippingAddress: {
          sameAsBilling: formData.sameAsBilling,
          receiverName: formData.receiverName,
          company: formData.s_company,
          address: formData.s_address,
          state: formData.s_state,
          pincode: formData.s_pincode,
          phone: formData.s_phone
        }
      };
      if (editingId) {
        await api.put(`/clients/${editingId}`, payload);
        toast.success('Client updated');
      } else {
        await api.post('/clients', payload);
        toast.success('Client added');
      }
      setModalOpen(false);
      fetchClients();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save client'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete client "${client.clientName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/clients/${client._id}`);
      toast.success('Client deleted');
      fetchClients();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete client'));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Clients</h2>
          <p>Manage your saved clients — {meta.totalItems} total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Client</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by client or company name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="glassmorphism table-container mt-4">
        {loading ? <Loader /> : (
          <>
            <Table
              columns={['Client Name', 'Company', 'Email', 'Phone', 'State', 'Actions']}
              data={clients}
              renderRow={(client, idx) => (
                <tr key={client._id} className="table-row">
                  <td>
                    <div className="client-cell">
                      <Avatar name={client.clientName} size={30} />
                      <div>
                        <strong>{client.clientName}</strong>
                        {client.gstNumber && <div className="table-sub">GST: {client.gstNumber}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{client.companyName || '-'}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{client.billingAddress?.state || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(client)}>
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(client)}>
                        <FiTrash2 />
                      </button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="grid-2">
            <div className="form-group">
              <label>Client Name *</label>
              <input name="clientName" value={formData.clientName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <h4 className="section-title">Billing Address</h4>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" rows="2" value={formData.address} onChange={handleChange} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>State</label>
              <select name="state" value={formData.state} onChange={handleChange}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group mt-2">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.sameAsBilling}
                onChange={e => setFormData({ ...formData, sameAsBilling: e.target.checked })}
              />
              Shipping address is same as billing
            </label>
          </div>

          {!formData.sameAsBilling && (
            <>
              <h4 className="section-title">Shipping Address</h4>
              <div className="grid-2">
                <div className="form-group">
                  <label>Receiver Name</label>
                  <input name="receiverName" value={formData.receiverName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="s_company" value={formData.s_company} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="s_address" rows="2" value={formData.s_address} onChange={handleChange} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>State</label>
                  <select name="s_state" value={formData.s_state} onChange={handleChange}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input name="s_pincode" value={formData.s_pincode} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="s_phone" value={formData.s_phone} onChange={handleChange} />
              </div>
            </>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary full-width mt-4" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Client' : 'Save Client'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;