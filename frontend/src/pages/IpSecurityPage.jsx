import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, Lock, Globe, Plus, Trash2, Edit3, X, 
  CheckCircle2, AlertCircle, RefreshCw, Filter, Server, Activity, Sliders, Check
} from 'lucide-react';
import axios from 'axios';

export function IpSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [policyConfig, setPolicyConfig] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState('ips'); // 'ips' or 'domains'

  // Policy Form
  const [policyForm, setPolicyForm] = useState({
    enforceStrictIpWhitelist: true,
    blockUnauthorizedOrigins: true,
    enableRateLimiting: true,
    maxRequestsPerMinutePerIp: 120
  });

  // Modal IP
  const [showIpModal, setShowIpModal] = useState(false);
  const [editingIp, setEditingIp] = useState(null);
  const [ipForm, setIpForm] = useState({
    id: '',
    ipAddress: '',
    assignedTo: '',
    userEmail: '',
    serviceScope: 'REST_API',
    description: '',
    isActive: true
  });

  // Modal Domain
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainForm, setDomainForm] = useState({
    id: '',
    domainUrl: '',
    resellerName: '',
    allowCors: true,
    allowWebhooks: true,
    isActive: true
  });

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ResellerConnectivity/security-policy');
      if (res.data.success) {
        setPolicyConfig(res.data.policy);
        setPolicyForm({
          enforceStrictIpWhitelist: res.data.policy.enforceStrictIpWhitelist,
          blockUnauthorizedOrigins: res.data.policy.blockUnauthorizedOrigins,
          enableRateLimiting: res.data.policy.enableRateLimiting,
          maxRequestsPerMinutePerIp: res.data.policy.maxRequestsPerMinutePerIp
        });
      }
    } catch (err) {
      console.error('Failed to fetch security policy:', err);
      setSaveError('Failed to load Firewall & IP Security settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    try {
      setSaveError('');
      const updated = {
        ...policyConfig,
        ...policyForm
      };
      const res = await axios.post('/api/ResellerConnectivity/security-policy', updated);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchPolicy();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to save Security Policies.');
    }
  };

  // IP Operations
  const handleOpenAddIp = () => {
    setEditingIp(null);
    setIpForm({
      id: '',
      ipAddress: '',
      assignedTo: '',
      userEmail: '',
      serviceScope: 'ALL',
      description: '',
      isActive: true
    });
    setShowIpModal(true);
  };

  const handleOpenEditIp = (ip) => {
    setEditingIp(ip);
    setIpForm({
      id: ip.id,
      ipAddress: ip.ipAddress,
      assignedTo: ip.assignedTo,
      userEmail: ip.userEmail,
      serviceScope: ip.serviceScope,
      description: ip.description,
      isActive: ip.isActive
    });
    setShowIpModal(true);
  };

  const handleSaveIp = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      const res = await axios.post('/api/ResellerConnectivity/whitelisted-ips', ipForm);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowIpModal(false);
        fetchPolicy();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to save IP address.');
    }
  };

  const handleDeleteIp = async (id, ipAddr) => {
    if (!window.confirm(`Remove whitelisted IP '${ipAddr}'?`)) return;
    try {
      const res = await axios.delete(`/api/ResellerConnectivity/whitelisted-ips/${id}`);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchPolicy();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to delete IP address.');
    }
  };

  // Domain Operations
  const handleOpenAddDomain = () => {
    setDomainForm({
      id: '',
      domainUrl: '',
      resellerName: '',
      allowCors: true,
      allowWebhooks: true,
      isActive: true
    });
    setShowDomainModal(true);
  };

  const handleSaveDomain = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      const res = await axios.post('/api/ResellerConnectivity/whitelisted-domains', domainForm);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowDomainModal(false);
        fetchPolicy();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to save domain.');
    }
  };

  const handleDeleteDomain = async (id, domUrl) => {
    if (!window.confirm(`Remove whitelisted domain '${domUrl}'?`)) return;
    try {
      const res = await axios.delete(`/api/ResellerConnectivity/whitelisted-domains/${id}`);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchPolicy();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to delete domain.');
    }
  };

  if (loading && !policyConfig) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading Firewall & IP Security...</p>
      </div>
    );
  }

  const ips = policyConfig?.whitelistedIps || [];
  const domains = policyConfig?.whitelistedDomains || [];

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
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                IP & Domain Firewall Whitelist Manager
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                PROTECTION ACTIVE • ZERO TRUST
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Lock down REST APIs and SMPP sockets with whitelisted reseller server IPs and verified origin domains.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={activeTab === 'ips' ? handleOpenAddIp : handleOpenAddDomain}
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
            <Plus size={15} /> {activeTab === 'ips' ? 'Add Whitelisted IP' : 'Add Whitelisted Domain'}
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

      {/* Security Policies Control Card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Global Firewall & Zero-Trust Enforcement Policies
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Toggle automatic blocking and rate-limiting rules across all incoming API/SMPP traffic.
              </p>
            </div>
          </div>
          <button
            onClick={handleSavePolicy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
          >
            <Sliders size={15} /> Apply Policy Settings
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              id="enforceIp"
              style={{ marginTop: '3px' }}
              checked={policyForm.enforceStrictIpWhitelist}
              onChange={e => setPolicyForm({ ...policyForm, enforceStrictIpWhitelist: e.target.checked })}
            />
            <div>
              <label htmlFor="enforceIp" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                Strict IP Enforcement
              </label>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Reject all requests from non-whitelisted IPs with HTTP 403 Forbidden.
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              id="blockOrigin"
              style={{ marginTop: '3px' }}
              checked={policyForm.blockUnauthorizedOrigins}
              onChange={e => setPolicyForm({ ...policyForm, blockUnauthorizedOrigins: e.target.checked })}
            />
            <div>
              <label htmlFor="blockOrigin" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                Origin Domain Lock
              </label>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Block unlisted CORS browser origins from calling APIs.
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              id="enableRate"
              style={{ marginTop: '3px' }}
              checked={policyForm.enableRateLimiting}
              onChange={e => setPolicyForm({ ...policyForm, enableRateLimiting: e.target.checked })}
            />
            <div>
              <label htmlFor="enableRate" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>
                Rate Limiting Shield
              </label>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Limit traffic per IP to prevent spam or flood attacks.
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Max RPM / IP</div>
            <input
              type="number"
              value={policyForm.maxRequestsPerMinutePerIp}
              onChange={e => setPolicyForm({ ...policyForm, maxRequestsPerMinutePerIp: parseInt(e.target.value) || 120 })}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800, boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: IPs vs Domains */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('ips')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: activeTab === 'ips' ? '#ffffff' : 'transparent',
            border: activeTab === 'ips' ? '2px solid #0284c7' : '2px solid transparent',
            borderBottom: activeTab === 'ips' ? '2px solid #ffffff' : '2px solid transparent',
            marginBottom: activeTab === 'ips' ? '-4px' : '0',
            borderRadius: '10px 10px 0 0',
            fontWeight: activeTab === 'ips' ? 800 : 600,
            fontSize: '13.5px',
            color: activeTab === 'ips' ? '#0284c7' : '#64748b',
            cursor: 'pointer'
          }}
        >
          <Shield size={16} /> Whitelisted Server IPs ({ips.length})
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: activeTab === 'domains' ? '#ffffff' : 'transparent',
            border: activeTab === 'domains' ? '2px solid #0284c7' : '2px solid transparent',
            borderBottom: activeTab === 'domains' ? '2px solid #ffffff' : '2px solid transparent',
            marginBottom: activeTab === 'domains' ? '-4px' : '0',
            borderRadius: '10px 10px 0 0',
            fontWeight: activeTab === 'domains' ? 800 : 600,
            fontSize: '13.5px',
            color: activeTab === 'domains' ? '#0284c7' : '#64748b',
            cursor: 'pointer'
          }}
        >
          <Globe size={16} /> Whitelisted Domains & CORS ({domains.length})
        </button>
      </div>

      {/* TAB 1: WHITELISTED IPS */}
      {activeTab === 'ips' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Authorized Server IPs & Subnets
            </h3>
            <button
              onClick={handleOpenAddIp}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={15} /> Add IP Address
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>IP / Subnet CIDR</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Reseller / User</th>
                  <th style={{ padding: '12px 14px' }}>Service Scope</th>
                  <th style={{ padding: '12px 14px' }}>Description / Datacenter</th>
                  <th style={{ padding: '12px 14px' }}>Requests Handled</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ips.map((ip, idx) => (
                  <tr key={ip.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', fontSize: '13.5px' }}>
                        {ip.ipAddress}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ip.assignedTo}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{ip.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800 }}>
                        {ip.serviceScope}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12.5px' }}>
                      {ip.description || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                      {ip.requestCount?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: ip.isActive ? '#dcfce7' : '#fee2e2', color: ip.isActive ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                        {ip.isActive ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => handleOpenEditIp(ip)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteIp(ip.id, ip.ipAddress)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WHITELISTED DOMAINS */}
      {activeTab === 'domains' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Whitelisted Origin Domains (CORS & Webhooks)
            </h3>
            <button
              onClick={handleOpenAddDomain}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={15} /> Add Domain
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 14px' }}>Domain URL</th>
                  <th style={{ padding: '12px 14px' }}>Reseller / Owner</th>
                  <th style={{ padding: '12px 14px' }}>CORS API Access</th>
                  <th style={{ padding: '12px 14px' }}>Webhooks Allowed</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((dom, idx) => (
                  <tr key={dom.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                      {dom.domainUrl}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {dom.resellerName}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: dom.allowCors ? '#dcfce7' : '#fee2e2', color: dom.allowCors ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        {dom.allowCors ? 'PERMITTED' : 'DENIED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: dom.allowWebhooks ? '#dcfce7' : '#fee2e2', color: dom.allowWebhooks ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        {dom.allowWebhooks ? 'PERMITTED' : 'DENIED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: dom.isActive ? '#dcfce7' : '#fee2e2', color: dom.isActive ? '#166534' : '#991b1b', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                        {dom.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteDomain(dom.id, dom.domainUrl)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit IP */}
      {showIpModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {editingIp ? 'Edit Whitelisted IP' : 'Add Authorized Server IP'}
                </h3>
              </div>
              <button onClick={() => setShowIpModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveIp} style={{ padding: '22px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  IP Address or Subnet (CIDR) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 114.143.22.10 or 103.21.58.0/24"
                  value={ipForm.ipAddress}
                  onChange={e => setIpForm({ ...ipForm, ipAddress: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Assigned Reseller / User *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manoj Telecom"
                    value={ipForm.assignedTo}
                    onChange={e => setIpForm({ ...ipForm, assignedTo: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Service Scope
                  </label>
                  <select
                    value={ipForm.serviceScope}
                    onChange={e => setIpForm({ ...ipForm, serviceScope: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="ALL">ALL Services (API + SMPP)</option>
                    <option value="REST_API">REST API Only</option>
                    <option value="SMPP_SERVER">SMPP Server Only</option>
                    <option value="WEBHOOKS">Webhooks Callback Only</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  User Contact Email
                </label>
                <input
                  type="email"
                  placeholder="tech@reseller.com"
                  value={ipForm.userEmail}
                  onChange={e => setIpForm({ ...ipForm, userEmail: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Description / Server Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Mumbai Datacenter Gateway Node"
                  value={ipForm.description}
                  onChange={e => setIpForm({ ...ipForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowIpModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Save IP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Domain */}
      {showDomainModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Add Whitelisted Origin Domain</h3>
              <button onClick={() => setShowDomainModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDomain}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Origin Domain URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://resellerpanel.com"
                  value={domainForm.domainUrl}
                  onChange={e => setDomainForm({ ...domainForm, domainUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Reseller Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Manoj Telecom"
                  value={domainForm.resellerName}
                  onChange={e => setDomainForm({ ...domainForm, resellerName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  <input type="checkbox" checked={domainForm.allowCors} onChange={e => setDomainForm({ ...domainForm, allowCors: e.target.checked })} />
                  Allow CORS Browser API
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  <input type="checkbox" checked={domainForm.allowWebhooks} onChange={e => setDomainForm({ ...domainForm, allowWebhooks: e.target.checked })} />
                  Allow Webhook Delivery
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowDomainModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Save Domain</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
