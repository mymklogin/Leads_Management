import React, { useState, useEffect } from 'react';
import { 
  Server, Shield, Radio, CheckCircle2, AlertCircle, Plus, Trash2, Edit3, X, 
  Copy, Check, RefreshCw, Key, Globe, Activity, Lock, Users, Zap, Terminal, Sliders
} from 'lucide-react';
import axios from 'axios';

export function ResellerSmppPage() {
  const [loading, setLoading] = useState(true);
  const [serverConfig, setServerConfig] = useState(null);
  const [liveBinds, setLiveBinds] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({
    id: '',
    systemId: '',
    resellerName: '',
    password: '',
    allowedIps: '*',
    bindMode: 'TRX',
    maxTps: 50,
    balanceCredits: 1000,
    status: 'ACTIVE',
    dltEntityId: ''
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    serverHost: '10.25.215.137',
    serverDomain: 'smpp.yourdomain.com',
    port: 2775,
    sslPort: 3550,
    enableTls: true,
    maxGlobalTps: 1000,
    strictIpCheck: true
  });

  useEffect(() => {
    fetchSmppServer();
    const interval = setInterval(fetchLiveBindsOnly, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchSmppServer = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ResellerConnectivity/smpp-server');
      if (res.data.success) {
        setServerConfig(res.data.config);
        setLiveBinds(res.data.liveBinds || []);
        setConfigForm(res.data.config);
      }
    } catch (err) {
      console.error('Failed to fetch SMPP Server config:', err);
      setSaveError('Failed to load Inbound SMPP Server settings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveBindsOnly = async () => {
    try {
      const res = await axios.get('/api/ResellerConnectivity/live-binds');
      if (res.data.success) {
        setLiveBinds(res.data.liveBinds || []);
      }
    } catch (err) {
      // silent
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setAccountForm({
      id: '',
      systemId: '',
      resellerName: '',
      password: '',
      allowedIps: '*',
      bindMode: 'TRX',
      maxTps: 50,
      balanceCredits: 1000,
      status: 'ACTIVE',
      dltEntityId: ''
    });
    setShowAccountModal(true);
  };

  const handleOpenEditModal = (acc) => {
    setEditingAccount(acc);
    setAccountForm({
      id: acc.id,
      systemId: acc.systemId,
      resellerName: acc.resellerName,
      password: acc.password,
      allowedIps: acc.allowedIps,
      bindMode: acc.bindMode,
      maxTps: acc.maxTps,
      balanceCredits: acc.balanceCredits,
      status: acc.status,
      dltEntityId: acc.dltEntityId
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      const res = await axios.post('/api/ResellerConnectivity/smpp-accounts', accountForm);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowAccountModal(false);
        fetchSmppServer();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Error saving Reseller SMPP account.');
    }
  };

  const handleDeleteAccount = async (id, systemId) => {
    if (!window.confirm(`Are you sure you want to delete Reseller SMPP account '${systemId}'?`)) return;
    try {
      const res = await axios.delete(`/api/ResellerConnectivity/smpp-accounts/${id}`);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchSmppServer();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to delete account.');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/ResellerConnectivity/smpp-server', configForm);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowConfigModal(false);
        fetchSmppServer();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to update server configuration.');
    }
  };

  if (loading && !serverConfig) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading Reseller Inbound SMPP Hub...</p>
      </div>
    );
  }

  const accounts = serverConfig?.accounts || [];
  const totalSent = accounts.reduce((acc, a) => acc + (a.totalSent || 0), 0);
  const activeAccountsCount = accounts.filter(a => a.status === 'ACTIVE').length;

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
            <Server size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Reseller Inbound SMPP Server Hub
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                INBOUND PORT 2775 • LISTENER ACTIVE
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Provision downstream client SMPP credentials, bind listeners on Port 2775, and monitor live socket sessions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenAddModal}
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
            <Plus size={15} /> Add Reseller Account
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Sliders size={14} /> Server Config
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

      {/* Inbound SMPP Server Parameters Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Terminal size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Your Server SMPP Inbound Endpoint (Give to Resellers)
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Resellers can enter these details in their SMS panel, Jasmin, or Kannel to route SMS via your server.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(`Host: ${serverConfig?.serverDomain || 'smpp.yourdomain.com'} | Port: ${serverConfig?.port || 2775} | Mode: TRX`, 'endpoint_all')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
          >
            {copiedId === 'endpoint_all' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            {copiedId === 'endpoint_all' ? 'Copied Details!' : 'Copy Connection Details'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Server Host / IP</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
              {serverConfig?.serverHost}
            </div>
            <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>{serverConfig?.serverDomain}</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Standard SMPP Port</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#0284c7', fontFamily: 'monospace' }}>
              {serverConfig?.port} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>(TCP Cleartext)</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>SSL/TLS: <strong>{serverConfig?.sslPort}</strong></div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Supported Bindings</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
              {serverConfig?.supportedBinds}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Transceiver / Transmitter / Receiver</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>Character Encodings</div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
              {serverConfig?.defaultEncoding}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>English GSM + Regional Unicode</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reseller Accounts</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {accounts.length} <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>({activeAccountsCount} Active)</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Live Connected Binds</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              {liveBinds.length} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Sockets</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total SMPP Packets</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {totalSent.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Firewall Enforcement</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: serverConfig?.strictIpCheck ? '#15803d' : '#d97706', marginTop: '4px' }}>
              {serverConfig?.strictIpCheck ? 'STRICT IP LOCK' : 'OPEN ACCESS'}
            </div>
          </div>
        </div>
      </div>

      {/* Reseller SMPP Accounts Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Provisioned Reseller SMPP Accounts
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Manage credentials, whitelist client server IPs, set TPS quotas, and track account status.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Account
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 14px' }}>System ID (Login)</th>
                <th style={{ padding: '12px 14px' }}>Reseller Name</th>
                <th style={{ padding: '12px 14px' }}>Allowed Server IPs</th>
                <th style={{ padding: '12px 14px' }}>Bind Mode</th>
                <th style={{ padding: '12px 14px' }}>Max TPS</th>
                <th style={{ padding: '12px 14px' }}>Balance Credits</th>
                <th style={{ padding: '12px 14px' }}>Traffic Sent</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, idx) => (
                <tr key={acc.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {acc.systemId}
                      <button
                        onClick={() => handleCopy(acc.systemId, acc.id + '_sys')}
                        title="Copy System ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8' }}
                      >
                        {copiedId === acc.id + '_sys' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>PE ID: {acc.dltEntityId || 'N/A'}</div>
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                    {acc.resellerName}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: acc.allowedIps === '*' ? '#fef3c7' : '#e0f2fe',
                      color: acc.allowedIps === '*' ? '#92400e' : '#0369a1',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}>
                      {acc.allowedIps}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800 }}>
                      {acc.bindMode}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                    {acc.maxTps} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TPS</span>
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 800, color: '#16a34a' }}>
                    ₹{acc.balanceCredits?.toLocaleString()}
                  </td>

                  <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#475569' }}>
                    <strong>{acc.totalSent?.toLocaleString()}</strong>
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: acc.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                      color: acc.status === 'ACTIVE' ? '#166534' : '#991b1b',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {acc.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEditModal(acc)}
                        title="Edit Account"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', color: '#475569' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.systemId)}
                        title="Delete Account"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                      >
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

      {/* Live Connected Binds Monitor */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Live Connected Reseller Binds (Real-Time Sockets)
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Auto-refreshing every 6 seconds
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '10px 12px' }}>Session ID</th>
                <th style={{ padding: '10px 12px' }}>System ID</th>
                <th style={{ padding: '10px 12px' }}>Reseller Name</th>
                <th style={{ padding: '10px 12px' }}>Client IP</th>
                <th style={{ padding: '10px 12px' }}>Bind State</th>
                <th style={{ padding: '10px 12px' }}>Throughput / Latency</th>
                <th style={{ padding: '10px 12px' }}>Connected Time</th>
              </tr>
            </thead>
            <tbody>
              {liveBinds.map((bind, i) => (
                <tr key={bind.sessionId || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748b' }}>{bind.sessionId}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>{bind.systemId}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>{bind.resellerName}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#475569' }}>{bind.clientIp}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                      {bind.state}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                    {bind.currentTps} TPS • <span style={{ color: '#16a34a' }}>{bind.latencyMs}ms</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{bind.connectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Account */}
      {showAccountModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Server size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {editingAccount ? 'Edit Reseller SMPP Account' : 'Add Reseller SMPP Account'}
                </h3>
              </div>
              <button onClick={() => setShowAccountModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveAccount} style={{ padding: '22px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Reseller / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Telecom & IT Hub"
                  value={accountForm.resellerName}
                  onChange={e => setAccountForm({ ...accountForm, resellerName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    System ID (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MANOJ_SMPP_PRIME"
                    value={accountForm.systemId}
                    onChange={e => setAccountForm({ ...accountForm, systemId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    SMPP Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Password"
                    value={accountForm.password}
                    onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Allowed Server IPs (Whitelist) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 114.143.22.10, 103.21.58.12 or * for any"
                  value={accountForm.allowedIps}
                  onChange={e => setAccountForm({ ...accountForm, allowedIps: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                  Comma-separated static IPs of the reseller server. Use <code>*</code> to permit all IPs.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Bind Mode
                  </label>
                  <select
                    value={accountForm.bindMode}
                    onChange={e => setAccountForm({ ...accountForm, bindMode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="TRX">TRX (Two-Way)</option>
                    <option value="TX">TX (Send Only)</option>
                    <option value="RX">RX (DLR Only)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Max Rate (TPS)
                  </label>
                  <input
                    type="number"
                    value={accountForm.maxTps}
                    onChange={e => setAccountForm({ ...accountForm, maxTps: parseInt(e.target.value) || 50 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={accountForm.status}
                    onChange={e => setAccountForm({ ...accountForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    DLT Entity ID (PE ID)
                  </label>
                  <input
                    type="text"
                    placeholder="1201159123456789012"
                    value={accountForm.dltEntityId}
                    onChange={e => setAccountForm({ ...accountForm, dltEntityId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Initial Balance Credits
                  </label>
                  <input
                    type="number"
                    value={accountForm.balanceCredits}
                    onChange={e => setAccountForm({ ...accountForm, balanceCredits: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Server Configuration */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Inbound SMPP Server Parameters
              </h3>
              <button onClick={() => setShowConfigModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Server Host IP</label>
                <input
                  type="text"
                  value={configForm.serverHost}
                  onChange={e => setConfigForm({ ...configForm, serverHost: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Server Domain (FQDN)</label>
                <input
                  type="text"
                  value={configForm.serverDomain}
                  onChange={e => setConfigForm({ ...configForm, serverDomain: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>TCP Port</label>
                  <input
                    type="number"
                    value={configForm.port}
                    onChange={e => setConfigForm({ ...configForm, port: parseInt(e.target.value) || 2775 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Max Global TPS</label>
                  <input
                    type="number"
                    value={configForm.maxGlobalTps}
                    onChange={e => setConfigForm({ ...configForm, maxGlobalTps: parseInt(e.target.value) || 1000 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="strictIp"
                  checked={configForm.strictIpCheck}
                  onChange={e => setConfigForm({ ...configForm, strictIpCheck: e.target.checked })}
                />
                <label htmlFor="strictIp" style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  Enforce Strict IP Whitelist (Drop unlisted IPs)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowConfigModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Save Config</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
