import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import { INDIAN_STATES, INVOICE_TEMPLATES, getErrorMessage } from '../utils/constants';

const toPreview = (file) => {
  if (!file) return null;
  if (file.data && file.contentType) return `data:${file.contentType};base64,${file.data}`;
  return file.preview || null;
};

const ImagePreview = ({ src, label }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="img-preview-box">
      {src && !failed ? (
        <img src={src} alt={label} className="preview-img" onError={() => setFailed(true)} />
      ) : (
        <span className="img-placeholder">No {label} uploaded</span>
      )}
    </div>
  );
};

const BusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    gstNumber: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    pincode: '',
    defaultTemplate: 'classic',
    defaultCurrency: 'INR',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [savedLogo, setSavedLogo] = useState(null);
  const [savedSignature, setSavedSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/business');
        const profile = data.data || {};
        setFormData({
          businessName: profile.businessName || '',
          ownerName: profile.ownerName || '',
          gstNumber: profile.gstNumber || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          defaultTemplate: profile.defaultTemplate || 'classic',
          defaultCurrency: profile.defaultCurrency || 'INR',
        });
        setSavedLogo(profile.logo || null);
        setSavedSignature(profile.signature || null);
      } catch (err) {
        setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to load profile') });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const withPreview = Object.assign(file, { preview: URL.createObjectURL(file) });
    if (type === 'logo') setLogoFile(withPreview);
    else setSignatureFile(withPreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, value);
      });
      if (logoFile) fd.append('logo', logoFile);
      if (signatureFile) fd.append('signature', signatureFile);

      const { data } = await api.put('/business', fd);
      const profile = data.data;
      setFormData({
        businessName: profile.businessName || '',
        ownerName: profile.ownerName || '',
        gstNumber: profile.gstNumber || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        defaultTemplate: profile.defaultTemplate || 'classic',
        defaultCurrency: profile.defaultCurrency || 'INR',
      });
      setSavedLogo(profile.logo || null);
      setSavedSignature(profile.signature || null);
      setLogoFile(null);
      setSignatureFile(null);
      setMessage({ type: 'success', text: 'Business profile saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to save profile') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Business Profile</h2>
          <p>These details appear automatically on every invoice. Set them once.</p>
        </div>
        <span className="profile-badge">1</span>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="glassmorphism profile-form">
        <div className="grid-2">
          <div className="form-group">
            <label>Business Name *</label>
            <input type="text" name="businessName" value={formData.businessName}
              onChange={handleChange} placeholder="e.g. Acme Traders" required />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input type="text" name="ownerName" value={formData.ownerName}
              onChange={handleChange} placeholder="Full name of owner" />
          </div>
          <div className="form-group">
            <label>GST Number (Optional)</label>
            <input type="text" name="gstNumber" value={formData.gstNumber}
              onChange={handleChange} placeholder="e.g. 27AABCU9603R1ZM" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="billing@business.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone}
              onChange={handleChange} placeholder="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label>State *</label>
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="">Select state</option>
              {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode}
              onChange={handleChange} placeholder="e.g. 400001" />
          </div>
          <div className="form-group">
            <label>Default Template</label>
            <select name="defaultTemplate" value={formData.defaultTemplate} onChange={handleChange}>
              {INVOICE_TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange}
            placeholder="Street, Area, City" rows="2" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Company Logo</label>
            <input type="file" accept="image/*" onChange={e => handleFile(e, 'logo')} />
            {(savedLogo || logoFile) && (
              <ImagePreview src={logoFile ? logoFile.preview : toPreview(savedLogo)} label="logo" />
            )}
          </div>
          <div className="form-group">
            <label>Signature</label>
            <input type="file" accept="image/*" onChange={e => handleFile(e, 'signature')} />
            {(savedSignature || signatureFile) && (
              <ImagePreview src={signatureFile ? signatureFile.preview : toPreview(savedSignature)} label="signature" />
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfile;