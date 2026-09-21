import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, Plus, Trash2, Edit3, X, 
  RefreshCw, Check, Copy, Zap, Server, Hash, FileCheck, Filter, Key
} from 'lucide-react';
import axios from 'axios';

export function SenderIdAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [senderIds, setSenderIds] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [verifyingId, setVerifyingId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Lookup Tool State
  const [lookupHeader, setLookupHeader] = useState('');
  const [lookupEntity, setLookupEntity] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSenderId, setEditingSenderId] = useState(null);
  const [form, setForm] = useState({
    id: '',
    senderId: '',
    resellerId: '',
    resellerName: '',
    dltEntityId: '',
    serviceCategory: 'Transactional',
    preferredOperator: 'Jio',
    dailyQuota: 50000,
    status: 'APPROVED',
    description: ''
  });

  useEffect(() => {
    fetchSenderIds();
  }, []);

  const fetchSenderIds = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ResellerConnectivity/sender-ids');
      if (res.data.success) {
        setSenderIds(res.data.senderIds || []);
      }
    } catch (err) {
      console.error('Failed to fetch sender IDs:', err);
      setSaveError('Failed to load Sender ID allocations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSenderId(null);
    setForm({
      id: '',
      senderId: '',
      resellerId: 'reseller-' + Math.floor(100 + Math.random() * 900),
      resellerName: '',
      dltEntityId: '',
      serviceCategory: 'Transactional',
      preferredOperator: 'Jio',
      dailyQuota: 50000,
      status: 'APPROVED',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sid) => {
    setEditingSenderId(sid);
    setForm({ ...sid });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      const res = await axios.post('/api/ResellerConnectivity/sender-ids', form);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowModal(false);
        fetchSenderIds();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to save Sender ID allocation.');
    }
  };

  const handleDelete = async (id, headerName) => {
    if (!window.confirm(`Delete Sender ID allocation for '${headerName}'?`)) return;
    try {
      const res = await axios.delete(`/api/ResellerConnectivity/sender-ids/${id}`);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchSenderIds();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to delete Sender ID.');
    }
  };

  const handleVerify = async (sid) => {
    try {
      setVerifyingId(sid.id);
      setVerifyResult(null);
      const res = await axios.post('/api/ResellerConnectivity/verify-header', {
        senderId: sid.senderId,
        entityId: sid.dltEntityId
      });
      setVerifyResult(res.data);
    } catch (err) {
      setSaveError('DLT validation check failed.');
    } finally {
      setVerifyingId('');
    }
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupHeader) return;
    try {
      setLookupLoading(true);
      setVerifyResult(null);
      const res = await axios.post('/api/ResellerConnectivity/verify-header', {
        senderId: lookupHeader,
        entityId: lookupEntity || '1201159123456789012'
      });
      setVerifyResult(res.data);
    } catch (err) {
      setSaveError('DLT Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  if (loading && senderIds.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading DLT Sender ID Allocations...</p>
      </div>
    );
  }

  const approvedCount = senderIds.filter(s => s.status === 'APPROVED').length;
  const totalDailyQuota = senderIds.reduce((acc, s) => acc + (s.dailyQuota || 0), 0);
  const totalSentToday = senderIds.reduce((acc, s) => acc + (s.sentToday || 0), 0);

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* Sleek Enterprise Blue Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '14px 22px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Key size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                DLT Sender ID & Header Allocation Hub
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                TRAI DLT COMPLIANCE ACTIVE
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Allocate approved 6-character TRAI DLT Headers to resellers and client accounts with strict entity locking.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenAdd}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <Plus size={15} /> Allocate New Header
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 700, fontSize: '13.5px' }}>
          <CheckCircle2 size={20} /> {saveSuccess}
        </div>
      )}
      {saveError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 700, fontSize: '13.5px' }}>
          <AlertCircle size={20} /> {saveError}
        </div>
      )}

      {/* Live DLT Lookup Tool */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              TRAI DLT Header Verification & Lookup
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Instantly verify if a 6-character Sender ID is approved on Jio/Airtel/BSNL/Vil DLT registry.
            </p>
          </div>
        </div>

        <form onSubmit={handleLookupSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Header / Sender ID (e.g. AX-MANOJB)"
            value={lookupHeader}
            onChange={e => setLookupHeader(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', minWidth: '240px' }}
          />
          <input
            type="text"
            placeholder="DLT Principal Entity ID (Optional)"
            value={lookupEntity}
            onChange={e => setLookupEntity(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', minWidth: '260px' }}
          />
          <button
            type="submit"
            disabled={lookupLoading}
            style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {lookupLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            Verify Header
          </button>
        </form>

        {verifyResult && (
          <div style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#16a34a" />
              <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700 }}>
                {verifyResult.message}
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
              {verifyResult.dltStatus}
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hash size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Allocated Headers</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {senderIds.length} <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>({approvedCount} Approved)</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Daily Quota Assigned</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {totalDailyQuota.toLocaleString()} SMS
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sent Today</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {totalSentToday.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Sender IDs Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Allocated Sender IDs (Headers)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Each header is bound to a specific reseller, DLT Entity ID, and operator routing priority.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} /> Allocate Header
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 14px' }}>Sender ID (Header)</th>
                <th style={{ padding: '12px 14px' }}>Assigned Reseller</th>
                <th style={{ padding: '12px 14px' }}>DLT Entity ID</th>
                <th style={{ padding: '12px 14px' }}>Service Category</th>
                <th style={{ padding: '12px 14px' }}>Operator Route</th>
                <th style={{ padding: '12px 14px' }}>Daily Quota Utilization</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {senderIds.map((sid, idx) => {
                const percent = Math.min(100, Math.round(((sid.sentToday || 0) / (sid.dailyQuota || 1)) * 100));
                return (
                  <tr key={sid.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 900, color: '#0284c7', fontFamily: 'monospace', fontSize: '14px' }}>
                        {sid.senderId}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{sid.description || 'General Header'}</div>
                    </td>

                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {sid.resellerName}
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#475569', fontSize: '12px' }}>
                      {sid.dltEntityId || '1201159123456789012'}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: sid.serviceCategory === 'Transactional' ? '#dbeafe' : '#fef3c7',
                        color: sid.serviceCategory === 'Transactional' ? '#1e40af' : '#92400e',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800
                      }}>
                        {sid.serviceCategory}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                        {sid.preferredOperator} SMPP
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', minWidth: '150px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                        <span>{sid.sentToday?.toLocaleString() || 0}</span>
                        <span style={{ color: '#64748b' }}>{sid.dailyQuota?.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: percent > 80 ? '#ef4444' : '#10b981', borderRadius: 3 }} />
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: sid.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: sid.status === 'APPROVED' ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                        {sid.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleVerify(sid)}
                          disabled={verifyingId === sid.id}
                          title="Verify DLT PE ID"
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7', cursor: 'pointer', fontWeight: 700, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {verifyingId === sid.id ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                          Check
                        </button>
                        <button onClick={() => handleOpenEdit(sid)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(sid.id, sid.senderId)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Header */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Hash size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {editingSenderId ? 'Edit Sender ID Allocation' : 'Allocate New DLT Sender ID'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Sender ID (6-Chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="e.g. AX-MANOJB"
                    value={form.senderId}
                    onChange={e => setForm({ ...form, senderId: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Assigned Reseller / User *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Manoj Telecom"
                    value={form.resellerName}
                    onChange={e => setForm({ ...form, resellerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  DLT Principal Entity ID (PE ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="1201159123456789012"
                  value={form.dltEntityId}
                  onChange={e => setForm({ ...form, dltEntityId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Service Category
                  </label>
                  <select
                    value={form.serviceCategory}
                    onChange={e => setForm({ ...form, serviceCategory: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Transactional">Transactional (OTP & Alerts)</option>
                    <option value="Service Implicit">Service Implicit</option>
                    <option value="Service Explicit">Service Explicit</option>
                    <option value="Promotional">Promotional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Preferred Operator Route
                  </label>
                  <select
                    value={form.preferredOperator}
                    onChange={e => setForm({ ...form, preferredOperator: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Jio">Reliance Jio DLT</option>
                    <option value="Airtel">Bharti Airtel Enterprise</option>
                    <option value="BSNL">BSNL National DLT</option>
                    <option value="Vodafone">Vodafone Idea</option>
                    <option value="PrivateGSM">Private GSM Pool</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Daily Quota (SMS)
                  </label>
                  <input
                    type="number"
                    value={form.dailyQuota}
                    onChange={e => setForm({ ...form, dailyQuota: parseInt(e.target.value) || 50000 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Approval Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING_DLT">PENDING DLT</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Description / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Critical 2FA OTP notifications for Banking customer"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Save Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
