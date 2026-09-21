import React, { useState, useEffect } from 'react';
import { 
  Server, Globe, Key, ShieldCheck, RefreshCw, Check, Copy, 
  Building, Mail, Phone, DollarSign, Bell, ExternalLink, Zap,
  AlertCircle, CheckCircle2, Sliders, Lock, Eye, EyeOff, Plus, Trash2, Edit3, X,
  Radio, PhoneCall, MessageSquare, Send, Database, Layers, CheckSquare,
  Network
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { SmppGatewayPage } from './SmppGatewayPage';

export function GatewaySettingsPage() {
  const { user } = useAuth();
  const { refreshBranding } = useBranding();
  const [activeTab, setActiveTab] = useState('rcs'); // 'rcs', 'voice', 'sms', 'whatsapp', 'masterData', 'branding'
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Connection Test States
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingVoiceConnection, setTestingVoiceConnection] = useState(false);
  const [voiceTestResult, setVoiceTestResult] = useState(null);

  // Dynamic Saved Providers State
  const [savedProviders, setSavedProviders] = useState([]);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerForm, setProviderForm] = useState({
    id: '',
    name: '',
    channel: 'RCS',
    baseUrl: '',
    apiKey: '',
    defaultBotId: '',
    defaultBotName: '',
    defaultTemplateId: '',
    senderId: '',
    dltEntityId: '',
    isActive: false
  });

  // Master Data State (Roles & Template Types)
  const [roles, setRoles] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ id: 0, roleName: '', roleCode: '', description: '', isSystemRole: false });
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeForm, setTypeForm] = useState({ id: 0, typeCode: '', displayName: '', channelType: 'RCS', description: '', isActive: true });

  // Gateway Configurations
  const [gatewayForm, setGatewayForm] = useState({
    provider: 'RCS Enterprise Cloud (Primary)',
    baseUrl: 'https://gateway.rcsflow.io/api/RCSApi',
    apiKey: 'A58463AEB7AE41CD9901D23D18BC2482883',
    defaultBotId: '',
    defaultBotName: '',
    defaultTemplateId: '',
    defaultMobile: '',
    rcsTRate: 0.20,
    rcsPRate: 0.20,
    bulkSmsRate: 0.15,
    voiceRate: 0.30,
    whatsappRate: 0.40,
    dlrWebhookUrl: 'http://10.25.215.137:5108/api/RCSApi/DeliveryReportCallback',
    chatReplyWebhookUrl: 'http://10.25.215.137:5108/api/RCSApi/CustomerReplyCallback'
  });

  const [voiceForm, setVoiceForm] = useState({
    provider: 'ExpressIVR Enterprise OBD',
    apiUrl: 'http://localhost:2014',
    apiKey: '',
    defaultUserId: 50002,
    defaultCli: '9999900119',
    webhookBaseUrl: 'http://10.25.215.137:5108',
    countryCode: '91',
    defaultSmsConfigJson: '{}'
  });

  const [brandingForm, setBrandingForm] = useState({
    companyName: 'SAAS',
    brandLogoUrl: '',
    webDomain: 'http://10.25.215.137:5173',
    apiDomain: 'http://10.25.215.137:5108',
    supportEmail: 'support@rcsflow.io',
    supportPhone: '+91 9999900000',
    termsUrl: '/terms',
    privacyUrl: '/privacy'
  });

  const [copiedField, setCopiedField] = useState('');

  // Fetch Current Settings & Master Data
  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const [resConfig, resRoles, resTypes] = await Promise.all([
        fetch('/api/Settings/gateway-config'),
        fetch('/api/MasterData/roles'),
        fetch('/api/MasterData/template-types')
      ]);

      if (resConfig.ok) {
        const json = await resConfig.json();
        if (json.gateway) setGatewayForm(json.gateway);
        if (json.voice) setVoiceForm(json.voice);
        if (json.branding) setBrandingForm(json.branding);
        if (json.savedProviders) setSavedProviders(json.savedProviders);
      }

      if (resRoles.ok) {
        const jsonRoles = await resRoles.json();
        if (jsonRoles.data) setRoles(jsonRoles.data);
      }

      if (resTypes.ok) {
        const jsonTypes = await resTypes.json();
        if (jsonTypes.data) setTemplateTypes(jsonTypes.data);
      }
    } catch (err) {
      console.warn('Failed to fetch gateway or master data settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Switch Active Provider
  const handleSelectProvider = async (providerId) => {
    const p = savedProviders.find(item => item.id === providerId);
    if (!p) return;

    try {
      const res = await fetch('/api/Settings/switch-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });

      if (res.ok) {
        setSaveSuccess(`Switched active gateway to: ${p.name}`);
        setTimeout(() => setSaveSuccess(''), 3000);
        fetchAllSettings();
        refreshBranding();
      }
    } catch (err) {
      console.error('Failed to switch provider:', err);
    }
  };

  // Open Add/Edit Provider Modal
  const openProviderModal = (provider = null, defaultChannel = 'RCS') => {
    if (provider) {
      setEditingProvider(provider);
      setProviderForm({ ...provider });
    } else {
      setEditingProvider(null);
      setProviderForm({
        id: '',
        name: '',
        channel: defaultChannel,
        baseUrl: '',
        apiKey: '',
        defaultBotId: '',
        defaultBotName: '',
        defaultTemplateId: '',
        senderId: '',
        dltEntityId: '',
        isActive: false
      });
    }
    setShowAddProviderModal(true);
  };

  // Save Provider Profile
  const handleSaveProvider = async (e) => {
    e.preventDefault();
    if (!providerForm.name || !providerForm.baseUrl) {
      alert('Provider Name and Base URL are required!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/Settings/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerForm)
      });

      if (res.ok) {
        setShowAddProviderModal(false);
        setSaveSuccess(`Gateway provider '${providerForm.name}' saved successfully!`);
        setTimeout(() => setSaveSuccess(''), 3000);
        fetchAllSettings();
      } else {
        const errJson = await res.json();
        alert(errJson.message || 'Failed to save provider');
      }
    } catch (err) {
      alert('Error saving provider: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Provider
  const handleDeleteProvider = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;

    try {
      const res = await fetch(`/api/Settings/providers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSaveSuccess(`Provider '${name}' deleted.`);
        setTimeout(() => setSaveSuccess(''), 3000);
        fetchAllSettings();
      }
    } catch (err) {
      console.error('Failed to delete provider:', err);
    }
  };

  // Test RCS Gateway Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/Settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: gatewayForm.baseUrl,
          apiKey: gatewayForm.apiKey
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Network error contacting API server: ' + err.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Test Voice Gateway Connection
  const handleTestVoiceConnection = async () => {
    setTestingVoiceConnection(true);
    setVoiceTestResult(null);
    try {
      const res = await fetch('/api/Settings/test-voice-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: voiceForm.apiUrl
        })
      });
      const data = await res.json();
      setVoiceTestResult(data);
    } catch (err) {
      setVoiceTestResult({
        success: false,
        message: 'Voice connection test error: ' + err.message
      });
    } finally {
      setTestingVoiceConnection(false);
    }
  };

  // Save All Settings
  const handleSaveAll = async () => {
    setLoading(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      const [resGw, resVoice, resBr] = await Promise.all([
        fetch('/api/Settings/gateway-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gatewayForm)
        }),
        fetch('/api/Settings/voice-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(voiceForm)
        }),
        fetch('/api/Settings/branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(brandingForm)
        })
      ]);

      if (resGw.ok && resVoice.ok && resBr.ok) {
        setSaveSuccess('All Gateway, Voice, and White-Label settings saved with instant hot-reload!');
        setTimeout(() => setSaveSuccess(''), 4000);
        refreshBranding();
      } else {
        setSaveError('Failed to update one or more settings.');
      }
    } catch (err) {
      setSaveError('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Master Data: Save Role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.roleName) {
      alert('Role Name is required!');
      return;
    }
    try {
      const res = await fetch('/api/MasterData/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      if (res.ok) {
        setShowRoleModal(false);
        setSaveSuccess('Role saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
        fetchAllSettings();
      }
    } catch (err) {
      alert('Error saving role: ' + err.message);
    }
  };

  // Master Data: Delete Role
  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete role '${name}'?`)) return;
    try {
      const res = await fetch(`/api/MasterData/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllSettings();
      } else {
        const err = await res.json();
        alert(err.message || 'Could not delete system role.');
      }
    } catch (err) {
      alert('Error deleting role: ' + err.message);
    }
  };

  // Master Data: Save Template Type
  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!typeForm.displayName) {
      alert('Display Name is required!');
      return;
    }
    try {
      const res = await fetch('/api/MasterData/template-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeForm)
      });
      if (res.ok) {
        setShowTypeModal(false);
        setSaveSuccess('Template Type saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
        fetchAllSettings();
      }
    } catch (err) {
      alert('Error saving template type: ' + err.message);
    }
  };

  // Master Data: Delete Template Type
  const handleDeleteType = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      const res = await fetch(`/api/MasterData/template-types/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAllSettings();
    } catch (err) {
      alert('Error deleting template type: ' + err.message);
    }
  };

  return (
    <div style={{ width: '100%', color: '#0f172a' }}>
      
      {/* Header Banner (Matching Users & Resellers Hierarchy standard) */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '12px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Server size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Telecom Gateways, Providers & Master Control
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                MULTI-CHANNEL ORCHESTRATOR
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Manage multiple upstream carrier gateways for RCS, Voice OBD, DLT SMS, and WhatsApp. Configure dynamic roles and branding.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={activeTab === 'voice' ? handleTestVoiceConnection : handleTestConnection}
            disabled={testingConnection || testingVoiceConnection}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Zap size={14} />
            {testingConnection || testingVoiceConnection ? 'Testing...' : 'Test Gateway'}
          </button>

          <button
            onClick={handleSaveAll}
            disabled={loading}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            Save & Apply Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          {saveSuccess}
        </div>
      )}

      {saveError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          {saveError}
        </div>
      )}

      {/* Test Connection Result Banner */}
      {testResult && (
        <div style={{
          background: testResult.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {testResult.success ? (
              <CheckCircle2 size={24} color="#16a34a" />
            ) : (
              <AlertCircle size={24} color="#dc2626" />
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: testResult.success ? '#15803d' : '#b91c1c' }}>
                {testResult.success ? 'RCS Carrier Gateway Live & Connected' : 'RCS Carrier Connection Notice'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Target: <code>{testResult.checkedUrl}</code> • Latency: <strong>{testResult.latencyMs}ms</strong>
              </div>
            </div>
          </div>

          {testResult.success && testResult.balances && (
            <div style={{ display: 'flex', gap: '16px', background: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', textAlign: 'center' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>RCS-T</span>
                <strong style={{ color: '#0284c7' }}>{testResult.balances.rcsT}</strong>
              </div>
              <div style={{ fontSize: '12px', textAlign: 'center' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>RCS-P</span>
                <strong style={{ color: '#16a34a' }}>{testResult.balances.rcsP}</strong>
              </div>
              <div style={{ fontSize: '12px', textAlign: 'center' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>Bulk SMS</span>
                <strong style={{ color: '#d97706' }}>{testResult.balances.bulkSms}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Test Result */}
      {voiceTestResult && (
        <div style={{
          background: voiceTestResult.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${voiceTestResult.success ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {voiceTestResult.success ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertCircle size={24} color="#dc2626" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: voiceTestResult.success ? '#15803d' : '#b91c1c' }}>
              {voiceTestResult.message}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Endpoint: <code>{voiceTestResult.checkedUrl}</code> • Latency: <strong>{voiceTestResult.latencyMs}ms</strong>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'rcs', label: 'RCS Messaging Gateway', icon: MessageSquare },
          { id: 'voice', label: 'Voice OBD & IVR Gateway', icon: PhoneCall },
          { id: 'sms', label: 'Bulk SMS & DLT Gateway', icon: Send },
          { id: 'whatsapp', label: 'WhatsApp Business API', icon: Radio },
          { id: 'smpp', label: 'Direct Telco SMPP Routing', icon: Network },
          { id: 'masterData', label: 'Master Data & System Roles', icon: Database },
          { id: 'branding', label: 'White-Label & Branding', icon: Building }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: isActive ? '#ffffff' : 'transparent',
                border: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                marginBottom: isActive ? '-6px' : '0',
                borderRadius: '10px 10px 0 0',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                color: isActive ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RCS TELECOM GATEWAY */}
      {activeTab === 'rcs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          
          {/* Active RCS Gateway Config Card */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#0284c7" />
              Active RCS Gateway Credentials
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Active Provider Name
              </label>
              <input
                type="text"
                value={gatewayForm.provider}
                onChange={e => setGatewayForm({ ...gatewayForm, provider: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                RCS API Base URL (Upstream Gateway)
              </label>
              <input
                type="text"
                value={gatewayForm.baseUrl}
                onChange={e => setGatewayForm({ ...gatewayForm, baseUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Master Gateway API Key / Auth Token
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={gatewayForm.apiKey}
                  onChange={e => setGatewayForm({ ...gatewayForm, apiKey: e.target.value })}
                  style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  RCS-T Rate (₹ per msg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gatewayForm.rcsTRate}
                  onChange={e => setGatewayForm({ ...gatewayForm, rcsTRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  RCS-P Rate (₹ per msg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gatewayForm.rcsPRate}
                  onChange={e => setGatewayForm({ ...gatewayForm, rcsPRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Delivery Callback (DLR Webhook URL)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={gatewayForm.dlrWebhookUrl}
                  onChange={e => setGatewayForm({ ...gatewayForm, dlrWebhookUrl: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(gatewayForm.dlrWebhookUrl, 'dlr')}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0 12px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {copiedField === 'dlr' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* RCS Provider Profiles Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#0284c7" />
                RCS Carrier Profiles
              </h3>
              <button
                onClick={() => openProviderModal(null, 'RCS')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Provider
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedProviders.filter(p => (p.channel || 'RCS') === 'RCS').map(p => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${p.isActive ? '#0284c7' : '#e2e8f0'}`,
                    background: p.isActive ? '#f0f9ff' : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                      {p.isActive && (
                        <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                      {p.baseUrl}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!p.isActive && (
                      <button
                        onClick={() => handleSelectProvider(p.id)}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => openProviderModal(p, 'RCS')}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(p.id, p.name)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOICE OBD & IVR GATEWAY */}
      {activeTab === 'voice' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={18} color="#7c3aed" />
              Voice OBD / IVR Gateway Configuration
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Voice Provider Name
              </label>
              <input
                type="text"
                value={voiceForm.provider}
                onChange={e => setVoiceForm({ ...voiceForm, provider: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Voice OBD API Dispatch URL
              </label>
              <input
                type="text"
                value={voiceForm.apiUrl}
                onChange={e => setVoiceForm({ ...voiceForm, apiUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Default User ID / Quota ID
                </label>
                <input
                  type="number"
                  value={voiceForm.defaultUserId}
                  onChange={e => setVoiceForm({ ...voiceForm, defaultUserId: parseInt(e.target.value) || 50002 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Default Outgoing CLI (Caller ID)
                </label>
                <input
                  type="text"
                  value={voiceForm.defaultCli}
                  onChange={e => setVoiceForm({ ...voiceForm, defaultCli: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Voice Webhook Base URL (Routing & Call Status)
              </label>
              <input
                type="text"
                value={voiceForm.webhookBaseUrl}
                onChange={e => setVoiceForm({ ...voiceForm, webhookBaseUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Per Voice Call Rate (₹ per minute/call)
              </label>
              <input
                type="number"
                step="0.01"
                value={gatewayForm.voiceRate}
                onChange={e => setGatewayForm({ ...gatewayForm, voiceRate: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Voice Providers Profiles */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={18} color="#7c3aed" />
                Voice OBD Gateways
              </h3>
              <button
                onClick={() => openProviderModal(null, 'VOICE')}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Voice Gateway
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedProviders.filter(p => p.channel === 'VOICE').map(p => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${p.isActive ? '#7c3aed' : '#e2e8f0'}`,
                    background: p.isActive ? '#f5f3ff' : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                      {p.isActive && (
                        <span style={{ background: '#7c3aed', color: '#ffffff', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                      {p.baseUrl}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!p.isActive && (
                      <button
                        onClick={() => handleSelectProvider(p.id)}
                        style={{ background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => openProviderModal(p, 'VOICE')}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProvider(p.id, p.name)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMS GATEWAY */}
      {activeTab === 'sms' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="#f59e0b" />
              Bulk SMS & DLT Gateway Settings
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Bulk SMS Rate (₹ per SMS)
              </label>
              <input
                type="number"
                step="0.01"
                value={gatewayForm.bulkSmsRate}
                onChange={e => setGatewayForm({ ...gatewayForm, bulkSmsRate: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#f59e0b" />
                SMS Gateways
              </h3>
              <button
                onClick={() => openProviderModal(null, 'SMS')}
                style={{ background: '#f59e0b', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add SMS Gateway
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedProviders.filter(p => p.channel === 'SMS').map(p => (
                <div key={p.id} style={{ padding: '14px', borderRadius: '12px', border: `1.5px solid ${p.isActive ? '#f59e0b' : '#e2e8f0'}`, background: p.isActive ? '#fffbeb' : '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                      {p.isActive && <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>ACTIVE</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>{p.baseUrl}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => openProviderModal(p, 'SMS')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteProvider(p.id, p.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHATSAPP GATEWAY */}
      {activeTab === 'whatsapp' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#16a34a" />
              WhatsApp Business API (Meta WABA)
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                WhatsApp Rate (₹ per msg)
              </label>
              <input
                type="number"
                step="0.01"
                value={gatewayForm.whatsappRate}
                onChange={e => setGatewayForm({ ...gatewayForm, whatsappRate: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="#16a34a" />
                WhatsApp Gateways
              </h3>
              <button
                onClick={() => openProviderModal(null, 'WHATSAPP')}
                style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add WhatsApp Gateway
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedProviders.filter(p => p.channel === 'WHATSAPP').map(p => (
                <div key={p.id} style={{ padding: '14px', borderRadius: '12px', border: `1.5px solid ${p.isActive ? '#16a34a' : '#e2e8f0'}`, background: p.isActive ? '#f0fdf4' : '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                      {p.isActive && <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>ACTIVE</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>{p.baseUrl}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => openProviderModal(p, 'WHATSAPP')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteProvider(p.id, p.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MASTER DATA & ENUMS */}
      {activeTab === 'masterData' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
          
          {/* Roles Master */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0284c7" />
                System Roles Master
              </h3>
              <button
                onClick={() => { setRoleForm({ id: 0, roleName: '', roleCode: '', description: '', isSystemRole: false }); setShowRoleModal(true); }}
                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add Role
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roles.map(r => (
                <div key={r.id} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{r.roleName}</strong>
                      <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                        ID: {r.id} • {r.roleCode}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{r.description}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => { setRoleForm({ ...r }); setShowRoleModal(true); }}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '5px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit3 size={13} />
                    </button>
                    {!r.isSystemRole && (
                      <button
                        onClick={() => handleDeleteRole(r.id, r.roleName)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Types Master */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#10b981" />
                Campaign & Template Types Master
              </h3>
              <button
                onClick={() => { setTypeForm({ id: 0, typeCode: '', displayName: '', channelType: 'RCS', description: '', isActive: true }); setShowTypeModal(true); }}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add Template Type
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templateTypes.map(t => (
                <div key={t.id} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{t.displayName}</strong>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        {t.channelType}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>[{t.typeCode}]</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t.description}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => { setTypeForm({ ...t }); setShowTypeModal(true); }}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '5px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteType(t.id, t.displayName)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WHITE-LABEL BRANDING */}
      {activeTab === 'branding' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="#0284c7" />
            White-Label Platform Identity & Custom Domains
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Company / Brand Name
              </label>
              <input
                type="text"
                value={brandingForm.companyName}
                onChange={e => setBrandingForm({ ...brandingForm, companyName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Custom Logo URL (PNG/SVG)
              </label>
              <input
                type="text"
                value={brandingForm.brandLogoUrl}
                onChange={e => setBrandingForm({ ...brandingForm, brandLogoUrl: e.target.value })}
                placeholder="https://yourdomain.com/logo.png"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Web Portal Domain URL
              </label>
              <input
                type="text"
                value={brandingForm.webDomain}
                onChange={e => setBrandingForm({ ...brandingForm, webDomain: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Backend API Server URL
              </label>
              <input
                type="text"
                value={brandingForm.apiDomain}
                onChange={e => setBrandingForm({ ...brandingForm, apiDomain: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Support Email Address
              </label>
              <input
                type="email"
                value={brandingForm.supportEmail}
                onChange={e => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Support Phone / Helpdesk
              </label>
              <input
                type="text"
                value={brandingForm.supportPhone}
                onChange={e => setBrandingForm({ ...brandingForm, supportPhone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DIRECT TELCO SMPP ROUTING */}
      {activeTab === 'smpp' && (
        <div style={{ marginTop: '-12px' }}>
          <SmppGatewayPage />
        </div>
      )}

      {/* Modal: Add/Edit Gateway Provider */}
      {showAddProviderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
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
            width: '100%',
            maxWidth: '540px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {editingProvider ? 'Edit Gateway Provider' : 'Add New Gateway Provider'}
              </h3>
              <button onClick={() => setShowAddProviderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProvider}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Channel Type
                </label>
                <select
                  value={providerForm.channel}
                  onChange={e => setProviderForm({ ...providerForm, channel: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="RCS">RCS Messaging</option>
                  <option value="VOICE">Voice OBD / IVR</option>
                  <option value="SMS">Bulk SMS / DLT</option>
                  <option value="WHATSAPP">WhatsApp Business API</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Provider Display Name
                </label>
                <input
                  type="text"
                  required
                  value={providerForm.name}
                  onChange={e => setProviderForm({ ...providerForm, name: e.target.value })}
                  placeholder="e.g. Tanla Telecom Carrier Hub"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  API Base Endpoint URL
                </label>
                <input
                  type="text"
                  required
                  value={providerForm.baseUrl}
                  onChange={e => setProviderForm({ ...providerForm, baseUrl: e.target.value })}
                  placeholder="https://api.carrier.com/v1"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  API Key / Auth Token
                </label>
                <input
                  type="text"
                  value={providerForm.apiKey}
                  onChange={e => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                  placeholder="API Key or Bearer Token"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProviderModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Role */}
      {showRoleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {roleForm.id > 0 ? 'Edit System Role' : 'Add Custom System Role'}
              </h3>
              <button onClick={() => setShowRoleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={roleForm.roleName}
                  onChange={e => setRoleForm({ ...roleForm, roleName: e.target.value })}
                  placeholder="e.g. Operations Manager"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Role Code
                </label>
                <input
                  type="text"
                  value={roleForm.roleCode}
                  onChange={e => setRoleForm({ ...roleForm, roleCode: e.target.value })}
                  placeholder="e.g. OperationsManager"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Template Type */}
      {showTypeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {typeForm.id > 0 ? 'Edit Template Type' : 'Add Campaign / Template Type'}
              </h3>
              <button onClick={() => setShowTypeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveType}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Channel
                </label>
                <select
                  value={typeForm.channelType}
                  onChange={e => setTypeForm({ ...typeForm, channelType: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="RCS">RCS Messaging</option>
                  <option value="VOICE">Voice OBD / IVR</option>
                  <option value="SMS">Bulk SMS</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={typeForm.displayName}
                  onChange={e => setTypeForm({ ...typeForm, displayName: e.target.value })}
                  placeholder="e.g. Rich Media Video Card"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Type Code Identifier
                </label>
                <input
                  type="text"
                  value={typeForm.typeCode}
                  onChange={e => setTypeForm({ ...typeForm, typeCode: e.target.value })}
                  placeholder="e.g. RichMediaVideo"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
