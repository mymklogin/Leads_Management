import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserPlus, 
  X, 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';

export const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    companyName: '',
    dltEntityId: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 4 // default User
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Roles dynamically from DB/Backend
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      // Reset form on modal open
      setFormData({
        username: '',
        fullName: '',
        companyName: '',
        dltEntityId: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 4
      });
      setDocuments([]);
      setErrorMsg('');
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await api.get('/users/roles');
      if (res.data && Array.isArray(res.data)) {
        setRoles(res.data);
        if (res.data.length > 0) {
          // Default to User (4) or first available
          const defaultRole = res.data.find(r => r.id === 4) || res.data[res.data.length - 1];
          setFormData(prev => ({ ...prev, role: defaultRole.id }));
        }
      }
    } catch (err) {
      console.warn('Failed to load dynamic roles, using fallback roles', err);
      setRoles([
        { id: 2, name: 'Admin', label: 'Admin (Administrator)' },
        { id: 3, name: 'Reseller', label: 'Reseller (Telecom Partner)' },
        { id: 4, name: 'User', label: 'User / Client (Standard Client)' }
      ]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Handle Multi-Document Upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const newDocs = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    e.target.value = ''; // Reset input to allow selecting same file if desired
  };

  const handleRemoveDoc = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please fill in all required fields (Username, Full Name, Email, Password).');
      return;
    }

    // Alphanumeric username check
    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(formData.username.trim())) {
      setErrorMsg('Username must be alphanumeric (only letters, numbers, and underscores, e.g. "manoj", "rahul", "rohan_telecom").');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // Strict 10-digit Indian Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim() || !mobileRegex.test(formData.phoneNumber.trim())) {
      setErrorMsg('Invalid Mobile Number: Please enter a valid 10-digit Indian mobile number (e.g. 9876543210) starting with 6, 7, 8, or 9.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim() || formData.fullName.trim(),
        dltEntityId: formData.dltEntityId.trim() || undefined,
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        role: parseInt(formData.role, 10),
        allowedServices: formData.allowedServices && formData.allowedServices.length > 0
          ? formData.allowedServices
          : ['RCS-T', 'RCS-P'],
        documents: documents.map(d => d.name)
      };

      const res = await api.post('/users', payload);
      const createdUser = res.data;

      if (onSuccess) {
        onSuccess(createdUser);
      }
      onClose();
    } catch (err) {
      console.error('Create user error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create user account. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '620px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Create Subordinate Account / Client
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                Standardized enterprise onboarding with dynamic roles & multi-document KYC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#b91c1c',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Full Name & Company Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Rohan Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                🏢 Company / Business Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Acme Telecom Solutions Pvt Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Row 2: Username & Account Role (from DB) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Username <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="rohan_acme"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                🛡️ Account Role <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 800 }}>• DB Live</span>
              </label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={loadingRoles}
                style={{ fontSize: '13px', padding: '8px 12px', fontWeight: 600 }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.label || r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: DLT Entity ID & Email Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                🆔 DLT Entity ID / Reg No.
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="1201161304403738311"
                value={formData.dltEntityId}
                onChange={(e) => setFormData({ ...formData, dltEntityId: e.target.value })}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="rohan@acmetelecom.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Row 4: Password & Phone Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ fontSize: '13px', padding: '8px 36px 8px 12px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                📱 Mobile Number <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontSize: '10px', color: '#64748b' }}>(10 Digits)</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                maxLength={10}
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Row 5: Allowed Telecom Services */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  📡 Allowed Telecom Services
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                  Choose which telecom platforms & routes this account is permitted to access.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: 4 }}>RCS SMS</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('RCS-T')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('RCS-T') ? cur.filter(s => s !== 'RCS-T') : [...cur, 'RCS-T'] });
                    }}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Transactional (RCS-T)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('RCS-P')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('RCS-P') ? cur.filter(s => s !== 'RCS-P') : [...cur, 'RCS-P'] });
                    }}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>Promotional (RCS-P)</span>
                </label>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>Bulk SMS</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('BULKSMS-T')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('BULKSMS-T') ? cur.filter(s => s !== 'BULKSMS-T') : [...cur, 'BULKSMS-T'] });
                    }}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>Transactional (SMS-T)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('BULKSMS-P')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('BULKSMS-P') ? cur.filter(s => s !== 'BULKSMS-P') : [...cur, 'BULKSMS-P'] });
                    }}
                    style={{ accentColor: '#6366f1' }}
                  />
                  <span>Promotional (SMS-P)</span>
                </label>
              </div>

              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>WhatsApp SMS</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('WHATSAPP-T')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('WHATSAPP-T') ? cur.filter(s => s !== 'WHATSAPP-T') : [...cur, 'WHATSAPP-T'] });
                    }}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Transactional (WA-T)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedServices?.includes('WHATSAPP-P')}
                    onChange={() => {
                      const cur = formData.allowedServices || ['RCS-T', 'RCS-P'];
                      setFormData({ ...formData, allowedServices: cur.includes('WHATSAPP-P') ? cur.filter(s => s !== 'WHATSAPP-P') : [...cur, 'WHATSAPP-P'] });
                    }}
                    style={{ accentColor: '#059669' }}
                  />
                  <span>Promotional (WA-P)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 6: Multi-Document Upload Area ("User documnet upload ek v kare multiple v") */}
          <div style={{
            marginTop: 4,
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  📄 User Document Upload (Single or Multiple)
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                  GST Certificate, PAN Card, Business License, or KYC PDF/Images (ek ya multiple upload karein)
                </p>
              </div>
              <label style={{
                background: '#0284c7',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
              }}>
                <Upload size={13} />
                <span>+ Upload Files</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Uploaded Documents List */}
            {documents.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <FileText size={14} color="#0284c7" />
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                      {doc.name}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      ({doc.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove document"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '11px' }}>
                No documents attached yet. Click <b>+ Upload Files</b> to attach KYC/GST documents.
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 10,
            paddingTop: 12,
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
              style={{ fontSize: '13px', padding: '8px 16px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                padding: '8px 20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 3px 8px rgba(2, 132, 199, 0.3)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              <UserPlus size={15} />
              <span>{submitting ? 'Creating Account...' : 'Create & Register Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
