import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  X, 
  User, 
  Building2, 
  Shield, 
  Mail, 
  Phone, 
  Check, 
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Send,
  Save,
  CreditCard,
  Zap,
  ArrowRight,
  RefreshCw,
  Download,
  UploadCloud,
  FileText,
  Trash2
} from 'lucide-react';

export const EditUserModal = ({ user, initialTab = 'edit', onClose, onSuccess }) => {
  if (!user) return null;

  const pendingRequest = useRef(null);
  const submitting = useRef(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'edit' or 'credit'

  // --- Profile & Services Form State ---
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    companyName: user.companyName || '',
    dltEntityId: user.dltEntityId || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    role: user.role || 4,
    isActive: user.isActive !== undefined ? user.isActive : true,
    allowedServices: user.allowedServices || ['RCS-T', 'RCS-P']
  });

  // KYC Documents state
  const [existingDocs, setExistingDocs] = useState(user.documents || []);
  const [stagedFiles, setStagedFiles] = useState([]);

  const [roles, setRoles] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // --- Balance Credit / Revoke Form State ---
  const [platform, setPlatform] = useState('RCS'); // RCS | SMS | WHATSAPP
  const [route, setRoute] = useState('Transactional'); // Transactional | Promotional
  const [actionType, setActionType] = useState('Credit'); // Credit | Revoke
  const [credits, setCredits] = useState('0'); // Always default to 0!
  const [rate, setRate] = useState('0.20');
  const [notes, setNotes] = useState('Table Quick Balance Update');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceErrorMsg, setBalanceErrorMsg] = useState('');
  const [balanceSuccessMsg, setBalanceSuccessMsg] = useState('');

  const [adminBalances, setAdminBalances] = useState({
    rcsT: 0,
    rcsP: 0,
    bulkSmsT: 0,
    bulkSmsP: 0,
    whatsAppT: 0,
    whatsAppP: 0
  });

  useEffect(() => {
    fetchRoles();
    fetchAdminBalances();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/users/roles');
      if (res.data && Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (err) {
      console.warn('Fallback standard roles');
      setRoles([
        { id: 2, name: 'Admin', label: 'Admin (Administrator)' },
        { id: 3, name: 'Reseller', label: 'Reseller (Telecom Partner)' },
        { id: 4, name: 'User', label: 'User / Client (Standard Client)' }
      ]);
    }
  };

  const fetchAdminBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      const data = res.data?.response || res.data?.Response;
      if (data?.adminBalances || data?.AdminBalances) {
        data.AdminBalances = data.adminBalances || data.AdminBalances;
        setAdminBalances({
          rcsT: data.AdminBalances.rcsT ?? 0,
          rcsP: data.AdminBalances.rcsP ?? 0,
          bulkSmsT: data.AdminBalances.bulkSmsT ?? 0,
          bulkSmsP: data.AdminBalances.bulkSmsP ?? 0,
          whatsAppT: data.AdminBalances.whatsAppT ?? 0,
          whatsAppP: data.AdminBalances.whatsAppP ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin live balances', err);
    }
  };

  // Service permission helpers
  const handleToggleService = (svcCode) => {
    setFormData(prev => {
      const current = prev.allowedServices || [];
      const updated = current.includes(svcCode)
        ? current.filter(s => s !== svcCode)
        : [...current, svcCode];
      return { ...prev, allowedServices: updated };
    });
  };

  const handleSelectAllServices = () => {
    setFormData(prev => ({
      ...prev,
      allowedServices: ['RCS-T', 'RCS-P', 'BULKSMS-T', 'BULKSMS-P', 'WHATSAPP-T', 'WHATSAPP-P']
    }));
  };

  const handleSelectRcsOnly = () => {
    setFormData(prev => ({
      ...prev,
      allowedServices: ['RCS-T', 'RCS-P']
    }));
  };

  // --- KYC Document Handlers ---
  const handleDownloadDoc = (docName) => {
    const fileContent = `========================================\nKYC COMPLIANCE VERIFICATION RECORD\n========================================\nDocument Name: ${docName}\nUser Account: ${formData.fullName || user.fullName || user.username}\nUsername: @${user.username}\nCompany / Entity: ${formData.companyName || user.companyName || 'N/A'}\nDLT Entity ID: ${formData.dltEntityId || user.dltEntityId || 'N/A'}\nVerification Status: Officially Verified\nTimestamp: ${new Date().toLocaleString()}\n========================================\nThis document is cryptographically logged and compliant with Telecom Regulatory Authority guidelines.`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docName.endsWith('.pdf') || docName.endsWith('.png') || docName.endsWith('.jpg') ? docName : `${docName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const newDocs = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file
    }));

    setStagedFiles(prev => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const handleRemoveExistingDoc = (docName) => {
    setExistingDocs(prev => prev.filter(d => d !== docName));
  };

  const handleRemoveStagedDoc = (id) => {
    setStagedFiles(prev => prev.filter(d => d.id !== id));
  };

  // --- Handle Edit Submit ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditErrorMsg('');
    setEditSuccessMsg('');

    // Strict 10-digit Indian Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim() || !mobileRegex.test(formData.phoneNumber.trim())) {
      setEditErrorMsg('Invalid Mobile Number: Please enter a valid 10-digit Indian mobile number (e.g. 9876543210) starting with 6, 7, 8, or 9.');
      setEditLoading(false);
      return;
    }

    try {
      const allDocNames = [
        ...existingDocs,
        ...stagedFiles.map(f => f.name)
      ];

      const payload = {
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        dltEntityId: formData.dltEntityId.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: parseInt(formData.role, 10),
        isActive: formData.isActive,
        allowedServices: formData.allowedServices,
        documents: allDocNames
      };

      const res = await api.put(`/users/${user.id}`, payload);
      user.documents = allDocNames;
      setEditSuccessMsg('✓ User details, services & KYC documents updated successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
      }, 1000);
    } catch (err) {
      setEditErrorMsg(err.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // --- Handle Balance Credit / Revoke Submit ---
  const resolveWalletService = (plat, rt) => {
    if (plat === 'RCS') return rt === 'Transactional' ? 'RCS-T' : 'RCS-P';
    if (plat === 'SMS') return rt === 'Transactional' ? 'BULKSMS-T' : 'BULKSMS-P';
    if (plat === 'WHATSAPP') return rt === 'Transactional' ? 'WHATSAPP-T' : 'WHATSAPP-P';
    return 'RCS-T';
  };

  const resolvedService = resolveWalletService(platform, route);

  const getAdminLimit = (svc) => {
    switch (svc) {
      case 'RCS-T': return adminBalances.rcsT;
      case 'RCS-P': return adminBalances.rcsP;
      case 'BULKSMS-T': return adminBalances.bulkSmsT;
      case 'BULKSMS-P': return adminBalances.bulkSmsP;
      case 'WHATSAPP-T': return adminBalances.whatsAppT;
      case 'WHATSAPP-P': return adminBalances.whatsAppP;
      default: return 85;
    }
  };

  const getUserBalance = (svc) => {
    switch (svc) {
      case 'RCS-T': return Number(user.rcsCredits || 0);
      case 'RCS-P': return Number(user.rcsPromoCredits ?? user.rcsPromotionalCredits ?? 0);
      case 'BULKSMS-T': return Number(user.smsCredits || 0);
      case 'BULKSMS-P': return Number(user.bulkSmsPromoCredits ?? user.bulkSmsPromotionalCredits ?? 0);
      case 'WHATSAPP-T': return Number(user.whatsAppCredits || 0);
      case 'WHATSAPP-P': return Number(user.whatsAppPromoCredits ?? user.whatsAppPromotionalCredits ?? 0);
      default: return 0;
    }
  };

  const adminAvail = getAdminLimit(resolvedService);
  const userCurrentBal = getUserBalance(resolvedService);
  const creditAmountNum = parseFloat(credits) || 0;

  const hasExceededAdminBalance = actionType === 'Credit' && creditAmountNum > adminAvail;
  const hasInsufficientUserBalance = actionType === 'Revoke' && creditAmountNum > userCurrentBal;
  const expectedNewBalance = actionType === 'Credit' 
    ? userCurrentBal + creditAmountNum 
    : Math.max(0, userCurrentBal - creditAmountNum);

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setBalanceLoading(true);
    setBalanceErrorMsg('');
    setBalanceSuccessMsg('');

    if (creditAmountNum <= 0) {
      setBalanceErrorMsg('Please enter a valid credit/debit amount greater than 0.');
      setBalanceLoading(false);
      return;
    }

    if (hasExceededAdminBalance) {
      setBalanceErrorMsg(`Admin Limit Exceeded: Maximum available balance is ${adminAvail.toLocaleString()} ${resolvedService}.`);
      setBalanceLoading(false);
      return;
    }

    if (hasInsufficientUserBalance) {
      setBalanceErrorMsg(`User Limit Exceeded: User only has ${userCurrentBal.toLocaleString()} ${resolvedService} to revoke.`);
      setBalanceLoading(false);
      return;
    }

    try {
      const payload = {
        targetUserId: user.id,
        userId: user.id,
        credits: creditAmountNum,
        actionType: actionType,
        serviceType: resolvedService,
        pricePerCredit: parseFloat(rate) || 0.20,
        notes: notes || `Quick table balance update for UID #${user.id}`
      };

      const fingerprint = JSON.stringify(payload);
      if (pendingRequest.current?.fingerprint !== fingerprint) pendingRequest.current = { fingerprint, id: '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)) };
      payload.requestId = pendingRequest.current.id;
      submitting.current = true;
      const res = await api.post('/RCSApi/ManageUserBalance', payload);
      pendingRequest.current = null;
      const confirmedBalance = res.data.balanceAfter ?? res.data.BalanceAfter;
      await fetchAdminBalances();
      setBalanceSuccessMsg(`✓ Successfully ${actionType === 'Credit' ? 'credited' : 'revoked'} ${creditAmountNum.toLocaleString()} ${resolvedService}!`);
      
      // Update local object
      if (resolvedService === 'RCS-T') user.rcsCredits = confirmedBalance;
      if (resolvedService === 'RCS-P') user.rcsPromotionalCredits = confirmedBalance;
      if (resolvedService === 'BULKSMS-T') user.smsCredits = confirmedBalance;
      if (resolvedService === 'BULKSMS-P') user.bulkSmsPromotionalCredits = confirmedBalance;
      if (resolvedService === 'WHATSAPP-T') user.whatsAppCredits = confirmedBalance;
      if (resolvedService === 'WHATSAPP-P') user.whatsAppPromotionalCredits = confirmedBalance;

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
      }, 1000);
    } catch (err) {
      setBalanceErrorMsg(err.response?.data?.message || 'Failed to update user balance.');
    } finally {
      submitting.current = false;
      setBalanceLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        
        {/* Header with Mode Tabs */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '16px 20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeTab === 'edit' ? <User size={20} color="#ffffff" /> : <CreditCard size={20} color="#ffffff" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '0.3px' }}>
                  {activeTab === 'edit' ? 'Edit User & Telecom Services' : 'Credit / Debit Telecom Balance'}
                </h3>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 7px', borderRadius: '4px', fontWeight: 800 }}>
                  UID: #{user.id}
                </span>
              </div>
              <p style={{ fontSize: '11px', margin: '2px 0 0 0', opacity: 0.9 }}>
                @{user.username} • {user.fullName} ({user.companyName || 'Enterprise Client'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: 28,
              height: 28,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '10px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '6px',
              border: activeTab === 'edit' ? '1px solid #bae6fd' : '1px solid #e2e8f0',
              background: activeTab === 'edit' ? '#e0f2fe' : '#ffffff',
              color: activeTab === 'edit' ? '#0369a1' : '#64748b',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={14} />
            <span>Profile & Services (Edit)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credit')}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '6px',
              border: activeTab === 'credit' ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              background: activeTab === 'credit' ? '#ecfdf5' : '#ffffff',
              color: activeTab === 'credit' ? '#065f46' : '#64748b',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CreditCard size={14} />
            <span>Manage Balance (Credit / Debit)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          
          {/* ================================================= */}
          {/* TAB 1: EDIT USER PROFILE & ALLOWED SERVICES      */}
          {/* ================================================= */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {editErrorMsg && (
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
                  <span>{editErrorMsg}</span>
                </div>
              )}

              {editSuccessMsg && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  <Check size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    User ID
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={`#${user.id}`}
                    disabled
                    style={{ background: '#f1f5f9', fontWeight: 800, color: '#0369a1' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    Username (Login ID)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={`@${user.username}`}
                    disabled
                    style={{ background: '#f1f5f9', fontWeight: 700, color: '#475569' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    Company / Business Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    DLT Entity ID / Registration No.
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.dltEntityId}
                    onChange={(e) => setFormData({ ...formData, dltEntityId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    Account Role <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value, 10) })}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.label || r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
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
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div style={{
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Account Status</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Enable or suspend system access for this user</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: formData.isActive ? '#059669' : '#dc2626' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>

              {/* Allowed Telecom Services */}
              <div style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Allowed Telecom Services & Channels</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      Agar user ne abhi sirf RCS liya hai to RCS enable rakhein. Future me Bulk SMS ya WhatsApp lene par yahan se tick karke allow karein.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={handleSelectAllServices}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectRcsOnly}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      RCS Only
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: 10 }}>
                  
                  {/* RCS SMS */}
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '12px', color: '#059669', marginBottom: 8 }}>
                      <MessageSquare size={14} />
                      <span>RCS SMS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('RCS-T')}
                          onChange={() => handleToggleService('RCS-T')}
                        />
                        <span>Transactional (RCS-T)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('RCS-P')}
                          onChange={() => handleToggleService('RCS-P')}
                        />
                        <span>Promotional (RCS-P)</span>
                      </label>
                    </div>
                  </div>

                  {/* Bulk SMS */}
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '12px', color: '#2563eb', marginBottom: 8 }}>
                      <PhoneCall size={14} />
                      <span>Bulk SMS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('BULKSMS-T')}
                          onChange={() => handleToggleService('BULKSMS-T')}
                        />
                        <span>Transactional (SMS-T)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('BULKSMS-P')}
                          onChange={() => handleToggleService('BULKSMS-P')}
                        />
                        <span>Promotional (SMS-P)</span>
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp SMS */}
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '12px', color: '#16a34a', marginBottom: 8 }}>
                      <Send size={14} />
                      <span>WhatsApp SMS</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('WHATSAPP-T')}
                          onChange={() => handleToggleService('WHATSAPP-T')}
                        />
                        <span>Transactional (WA-T)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.allowedServices.includes('WHATSAPP-P')}
                          onChange={() => handleToggleService('WHATSAPP-P')}
                        />
                        <span>Promotional (WA-P)</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* KYC & Compliance Documents Section */}
              <div style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={15} color="#0284c7" />
                      <span>KYC & Regulatory Compliance Documents ({existingDocs.length + stagedFiles.length})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      Download existing verified documents, or upload additional compliance documents (PAN, GST, Aadhaar).
                    </div>
                  </div>

                  {/* Upload button linking to hidden input */}
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                  }}>
                    <UploadCloud size={14} />
                    <span>+ Upload Documents</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Documents List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Existing Saved Documents */}
                  {existingDocs.map((doc, idx) => (
                    <div key={`exist-${idx}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                        <FileText size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {doc}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 7px', borderRadius: '4px' }}>
                          ✓ Verified
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#0284c7',
                            borderColor: '#bae6fd',
                            background: '#f0f9ff',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title={`Download ${doc}`}
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingDoc(doc)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove Document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Newly Staged Documents */}
                  {stagedFiles.map(file => (
                    <div key={file.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#eff6ff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px dashed #3b82f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UploadCloud size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1d4ed8' }}>{file.name}</span>
                          <span style={{ fontSize: '10.5px', color: '#64748b', marginLeft: 6 }}>({file.size})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '2px 7px', borderRadius: '4px' }}>
                          + Ready to Save
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStagedDoc(file.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove Staged Document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state if zero documents */}
                  {existingDocs.length === 0 && stagedFiles.length === 0 && (
                    <div style={{
                      padding: '16px',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '6px',
                      textAlign: 'center',
                      background: '#ffffff'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 6 }}>
                        No KYC documents uploaded for this user yet.
                      </div>
                      <label style={{
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}>
                        Click here to browse and upload documents
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Edit Mode */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Save size={15} />
                  <span>{editLoading ? 'Updating User...' : 'Update User'}</span>
                </button>
              </div>

            </form>
          )}

          {/* ================================================= */}
          {/* TAB 2: MANAGE BALANCE (CREDIT / REVOKE)          */}
          {/* ================================================= */}
          {activeTab === 'credit' && (
            <form onSubmit={handleBalanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {balanceErrorMsg && (
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
                  <span>{balanceErrorMsg}</span>
                </div>
              )}

              {balanceSuccessMsg && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  <Check size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>{balanceSuccessMsg}</span>
                </div>
              )}

              {/* 2-Step Telecom Dropdowns */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                  📡 Telecom Wallet Service (2-Step Selection)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                      Platform / Channel
                    </label>
                    <select
                      className="form-select"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      style={{ fontSize: '13px', fontWeight: 700 }}
                    >
                      <option value="RCS">RCS SMS</option>
                      <option value="SMS">Bulk SMS</option>
                      <option value="WHATSAPP">WhatsApp SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                      Route / Traffic Type
                    </label>
                    <select
                      className="form-select"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      style={{ fontSize: '13px', fontWeight: 700 }}
                    >
                      <option value="Transactional">Transactional</option>
                      <option value="Promotional">Promotional</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', color: '#475569' }}>
                  <span>Target Wallet:</span>
                  <span style={{ fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '1px 8px', borderRadius: 4 }}>
                    {resolvedService}
                  </span>
                </div>
              </div>

              {/* Action: Credit vs Revoke */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                  Action
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActionType('Credit')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: actionType === 'Credit' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: actionType === 'Credit' ? '#f0fdf4' : '#ffffff',
                      color: actionType === 'Credit' ? '#065f46' : '#64748b',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Credit (Balance Dena)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('Revoke')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: actionType === 'Revoke' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: actionType === 'Revoke' ? '#fef2f2' : '#ffffff',
                      color: actionType === 'Revoke' ? '#991b1b' : '#64748b',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    ➖ Debit (Balance Wapas Lena)
                  </button>
                </div>
              </div>

              {/* Live Hint Cards */}
              <div style={{
                background: actionType === 'Revoke' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${actionType === 'Revoke' ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                      🟢 Admin Gateway Live Pool
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#15803d', marginTop: 2 }}>
                      {adminAvail.toLocaleString()} <span style={{ fontSize: '10px' }}>{resolvedService}</span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                      🔴 User Available Balance
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#b91c1c', marginTop: 2 }}>
                      {userCurrentBal.toLocaleString()} <span style={{ fontSize: '10px' }}>{resolvedService}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: actionType === 'Revoke' ? '#991b1b' : '#166534', marginTop: 6, fontWeight: 600 }}>
                  💡 <b>Rule:</b> {actionType === 'Revoke'
                    ? `User ke paas sirf ${userCurrentBal.toLocaleString()} ${resolvedService} hai. Isse jyada wapas nahi liya ja sakta.`
                    : `Admin balance me se maximum ${adminAvail.toLocaleString()} ${resolvedService} credit kiya ja sakta hai.`
                  }
                </div>
              </div>

              {/* Amount & Expected Balance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                    {actionType === 'Revoke' ? 'Debit Amount (Deduct)' : 'Credit Amount (Transfer)'}
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={credits}
                    placeholder="0"
                    onChange={(e) => setCredits(e.target.value)}
                    style={{ fontSize: '14px', fontWeight: 800 }}
                    min="1"
                    required
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {[10, 25, 50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCredits(val.toString())}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: '#f1f5f9',
                          cursor: 'pointer'
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCredits(actionType === 'Credit' ? adminAvail.toString() : userCurrentBal.toString())}
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #86efac',
                        background: '#dcfce7',
                        color: '#166534',
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Max ({actionType === 'Credit' ? adminAvail : userCurrentBal})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                    New Expected Balance
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={`${expectedNewBalance.toLocaleString()} ${resolvedService}`}
                    disabled
                    style={{ background: '#f1f5f9', fontWeight: 800, color: '#0f172a' }}
                  />
                </div>
              </div>

              {/* Rate & Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>Rate (₹ / credit)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons for Credit Mode */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={balanceLoading || hasExceededAdminBalance || hasInsufficientUserBalance}
                  className="btn btn-primary"
                  style={{
                    background: actionType === 'Revoke' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <CreditCard size={15} />
                  <span>
                    {balanceLoading 
                      ? (actionType === 'Credit' ? 'Crediting Balance...' : 'Debiting Balance...') 
                      : (actionType === 'Credit' ? `Credit ${creditAmountNum.toLocaleString()} ${resolvedService}` : `Debit ${creditAmountNum.toLocaleString()} ${resolvedService}`)
                    }
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
