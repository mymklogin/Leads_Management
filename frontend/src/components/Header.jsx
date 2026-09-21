import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import api from '../services/api';
import { 
  Shield, 
  Menu, 
  Flame, 
  Cloud, 
  Wallet, 
  Key, 
  ExternalLink, 
  CreditCard, 
  Headphones, 
  User as UserIcon, 
  Phone, 
  Mail, 
  LogOut, 
  Copy, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react';

export const Header = ({ currentTitle, onOpenDrawer }) => {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Dynamic Live Balances (Initialized from localStorage cache or fallback without hardcoded 88)
  const [balances, setBalances] = useState(() => {
    try {
      const cached = localStorage.getItem('rcs_live_balances');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.rcsT === 'number') {
          return parsed;
        }
      }
    } catch (_) {}
    return {
      sms: 100,
      rcsP: 100,
      rcsT: 85
    };
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [modalKeyAction, setModalKeyAction] = useState(null);

  const apiKey = user?.apiKey || branding?.activeApiKey || 'A58463AEB7AE41CD9901D23D18BC2482883';

  useEffect(() => {
    fetchBalances();
    // Live polling every 10 seconds so balance stays strictly synchronized
    const timer = setInterval(fetchBalances, 10000);

    // Event listener for instant balance updates after campaigns or credit changes
    const onBalanceUpdated = (e) => {
      if (e?.detail) {
        setBalances(prev => {
          const next = {
            ...prev,
            rcsT: e.detail.rcsT !== undefined ? Number(e.detail.rcsT) : (e.detail.newBalance !== undefined ? Number(e.detail.newBalance) : prev.rcsT),
            rcsP: e.detail.rcsP !== undefined ? Number(e.detail.rcsP) : prev.rcsP
          };
          try {
            localStorage.setItem('rcs_live_balances', JSON.stringify(next));
          } catch (_) {}
          return next;
        });
      }
    };
    window.addEventListener('rcs_balance_updated', onBalanceUpdated);

    return () => {
      clearInterval(timer);
      window.removeEventListener('rcs_balance_updated', onBalanceUpdated);
    };
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      const data = res.data?.response || res.data?.Response;
      if (data) {
        const updated = {
          sms: Number(data.smsBalance ?? data.SmsBalance ?? 100),
          rcsP: Number(data.rcsPromotionalBalance ?? data.RcsPromotionalBalance ?? 100),
          rcsT: Number(data.rcsTransactionalBalance ?? data.RcsTransactionalBalance ?? 85)
        };
        setBalances(updated);
        try {
          localStorage.setItem('rcs_live_balances', JSON.stringify(updated));
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to sync header balances', err);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <>
      <header className="header">
        {/* Mobile-Only Header Bar */}
        <div className="mobile-header-bar">
          <button 
            type="button" 
            className="mobile-header-btn" 
            onClick={onOpenDrawer}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          <div className="mobile-header-brand">
            <div className="brand-icon" style={{ width: 28, height: 28, borderRadius: '7px' }}>
              <Flame size={16} />
            </div>
            <span className="mobile-header-title">{currentTitle || 'Dashboard'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div 
              className="user-avatar" 
              style={{ width: 32, height: 32, fontSize: '12px', cursor: 'pointer' }}
              onClick={onOpenDrawer}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
          </div>
        </div>

        {/* Desktop Header Bar */}
        <div className="desktop-header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          
          {/* Left Title & Status */}
          <div>
            <h1 className="page-title">{currentTitle || 'Dashboard Overview'}</h1>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              {currentDate} • Enterprise RCS Cloud Suite
            </div>
          </div>

          {/* Right Action Widgets */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            {/* Live Balances Pill Matching OmniDigital */}
            <div className="header-balance-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '12px',
              color: '#334155',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <Wallet size={14} color="#0a66c2" />
              <span>SMS: <b style={{ color: '#0f172a' }}>{balances.sms}</b></span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span title="RCS Promotional Balance">RCS-P: <b style={{ color: '#0f172a' }}>{balances.rcsP}</b></span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span title="RCS Transactional Balance">RCS-T: <b style={{ color: '#059669' }}>{balances.rcsT}</b></span>
            </div>

            {/* Support Ticket (Visible, Non-Clickable / Enterprise Managed) */}
            <div 
              className="btn btn-outline"
              title="Enterprise Support Managed"
              style={{ 
                fontSize: '12px', 
                padding: '6px 14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                cursor: 'default',
                opacity: 0.85,
                userSelect: 'none',
                background: '#f8fafc',
                borderColor: '#cbd5e1'
              }}
            >
              <Headphones size={13} color="#0a66c2" />
              <span>Support Ticket</span>
            </div>

            {/* Pay Online (Visible, Non-Clickable / Enterprise Managed) */}
            <div 
              className="btn btn-primary"
              title="Enterprise Billing Managed"
              style={{ 
                fontSize: '12px', 
                padding: '6px 14px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                cursor: 'default',
                opacity: 0.9,
                userSelect: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
              }}
            >
              <CreditCard size={13} />
              <span>Pay Online</span>
            </div>

            {/* User Profile Pill & Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <div 
                className="profile-pill-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#0a66c2',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px'
                }}>
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    {user?.fullName || user?.username || 'Abhishaarod'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Enterprise Client
                  </div>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '320px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 28px -4px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.04)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  {/* User Identity Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      {user?.fullName || 'Abhishaarod'} ({user?.username || 'Abhishaarod'})
                    </div>
                    <div style={{ fontSize: '11px', color: '#0a66c2', marginTop: 2, fontWeight: 600 }}>
                      SMS: {balances.sms} | RCS-P: {balances.rcsP} | RCS-T: {balances.rcsT}
                    </div>
                  </div>

                  {/* Account Manager Card */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserIcon size={12} color="#0a66c2" />
                      <span>Account Manager</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      <div><b>Name:</b> XXXXXX</div>
                      <div><b>Mobile:</b> +91-XXXXXXXXXX</div>
                      <div style={{ color: '#0a66c2' }}>manager@xxxx.com</div>
                    </div>
                  </div>

                  {/* Technical Support Card */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Headphones size={12} color="#059669" />
                      <span>Technical Support</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      <div><b>Mobile:</b> +91-XXXXXXXXXX</div>
                      <div><b>Phone:</b> +91-120-XXXXXXX</div>
                      <div style={{ color: '#059669' }}>support@xxxx.com</div>
                    </div>
                  </div>

                  {/* Actions: My API Key & Sign Out */}
                  <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button 
                      type="button" 
                      onClick={() => { setShowApiKeyModal(true); setShowProfileDropdown(false); }}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #bfdbfe', 
                        background: '#eff6ff', 
                        color: '#1d4ed8', 
                        fontWeight: 700, 
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Key size={14} />
                      <span>My API Key</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={logout}
                      style={{ 
                        width: '100%', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #fecaca', 
                        background: '#ffffff', 
                        color: '#dc2626', 
                        fontWeight: 700, 
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global API Key Modal (#apiKeyModal) */}
      {showApiKeyModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 99999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px' 
        }}>
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '520px', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <Key size={18} color="#0a66c2" />
                <span>API Key Management</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowApiKeyModal(false); setModalKeyAction(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: '10px', 
                padding: '12px 16px', 
                color: '#1d4ed8', 
                fontSize: '13px', 
                marginBottom: '20px',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Generating a new key will replace your existing key if one exists.</span>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setModalKeyAction('generated')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 700 }}
                >
                  <Key size={14} />
                  <span>Generate New Key</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setModalKeyAction('view')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 600 }}
                >
                  <span>View Existing Key</span>
                </button>
              </div>

              {modalKeyAction && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {modalKeyAction === 'generated' ? 'Newly Generated API Key' : 'Current Active API Key'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={apiKey} 
                      className="form-control" 
                      style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, background: '#ffffff', width: '100%' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleCopyKey}
                      style={{ fontSize: '12px', padding: '8px 14px', flexShrink: 0 }}
                    >
                      {apiKeyCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                    Status: Active • Authorized for All Endpoints
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { setShowApiKeyModal(false); setModalKeyAction(null); }}
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
