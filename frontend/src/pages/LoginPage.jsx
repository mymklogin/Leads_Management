import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  PhoneCall,
  Send,
  Users,
  Shield,
  Check
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('Abhishaarod');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAbhishaarod = () => {
    setUsername('Abhishaarod');
    setPassword('Admin@123');
    setError('');
  };

  const fillSuperAdmin = () => {
    setUsername('superadmin');
    setPassword('Admin@123');
    setError('');
  };

  const fillAdmin = () => {
    setUsername('admin');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="login-container">
      {/* Top Navbar */}
      <header className="login-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: '#0a66c2',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)'
          }}>
            <Flame size={22} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0a66c2', letterSpacing: '-0.3px' }}>
              Leads<span style={{ color: '#1e293b' }}>Engine</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-login-nav">
          <div style={{ display: 'flex', gap: 18, marginRight: 8, fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PhoneCall size={14} /> Voice OBD
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Send size={14} /> RCS Messaging
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={14} /> Leads CRM
            </span>
          </div>

          <button 
            type="button"
            className="btn btn-outline"
            onClick={fillSuperAdmin}
            style={{ 
              borderRadius: '24px', 
              fontSize: '13px', 
              fontWeight: 700, 
              padding: '7px 18px', 
              borderColor: '#0a66c2', 
              color: '#0a66c2' 
            }}
          >
            Autofill Demo
          </button>
        </div>

        {/* Mobile Quick Action Pill */}
        <div className="mobile-login-quick-pill">
          <button 
            type="button" 
            onClick={fillSuperAdmin}
            style={{
              background: '#e0f2fe',
              color: '#0a66c2',
              border: '1px solid #bae6fd',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <ShieldCheck size={13} />
            <span>SuperAdmin</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="login-hero">
        
        {/* Form Container (Desktop: Left Column | Mobile: Full App Card) */}
        <div className="login-form-card">
          
          {/* Mobile App Header Badge */}
          <div className="mobile-login-hero-header">
            <div className="mobile-app-badge">
              <span className="live-pulse-dot" style={{ width: 6, height: 6 }}></span>
              <span>Cloud Enterprise Multi-Channel</span>
            </div>
            <h1 className="mobile-app-title">Welcome Back</h1>
            <p className="mobile-app-subtitle">
              Sign in to manage OBD dialers, RCS bots, SMS gateways, and live CRM leads.
            </p>
          </div>

          {/* Desktop Heading */}
          <h1 className="desktop-login-heading">
            Explore leads and grow your business network
          </h1>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter superadmin or admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input-field"
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Admin@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input-field"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms text */}
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.4 }}>
              By continuing, you agree to the LeadsEngine{' '}
              <span style={{ color: '#0a66c2', fontWeight: 600 }}>Security Policy</span> and Terms.
            </p>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Account'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick 1-Tap Demo Credentials Selector */}
          <div className="login-quick-demo-section">
            <div className="quick-demo-label">ONE-TAP DEMO ACCOUNTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <button 
                type="button" 
                className={`quick-account-card ${username === 'superadmin' ? 'selected' : ''}`}
                onClick={fillSuperAdmin}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="account-role-tag">SuperAdmin</span>
                  {username === 'superadmin' && <Check size={14} color="#0a66c2" />}
                </div>
                <div className="account-user-name">superadmin</div>
                <div className="account-pass-hint">Admin@123</div>
              </button>

              <button 
                type="button" 
                className={`quick-account-card ${username === 'admin' ? 'selected' : ''}`}
                onClick={fillAdmin}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="account-role-tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>Admin</span>
                  {username === 'admin' && <Check size={14} color="#4338ca" />}
                </div>
                <div className="account-user-name">admin</div>
                <div className="account-pass-hint">Admin@123</div>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Security Pill */}
          <div className="mobile-login-footer-security">
            <span>🔒 Neon Cloud PostgreSQL Secured</span>
            <span>•</span>
            <span>v2.4 Production</span>
          </div>

        </div>

        {/* Right Column: Desktop Illustration (Hidden on Mobile) */}
        <div className="login-desktop-illustration">
          {/* Semicircular / Arched "Chandra Aakar" Backdrop */}
          <div style={{
            width: '470px',
            height: '500px',
            borderRadius: '235px 235px 40px 40px',
            background: 'linear-gradient(180deg, #fef3c7 0%, #fef9c3 30%, #e0f2fe 100%)',
            boxShadow: '0 20px 40px -15px rgba(254, 243, 199, 0.8), 0 10px 30px -10px rgba(10, 102, 194, 0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            border: '2px solid rgba(255,255,255,0.8)'
          }}>
            
            {/* Ambient Sun */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#fef08a',
              opacity: 0.6
            }} />

            {/* Floating Metric 1 */}
            <div style={{
              position: 'absolute',
              top: '45px',
              right: '25px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '12px',
              fontWeight: 700,
              color: '#0a66c2',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>4,933 Live RCS Credits</span>
            </div>

            {/* Floating Metric 2 */}
            <div style={{
              position: 'absolute',
              top: '180px',
              left: '-10px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#059669',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>100% Delivery</span>
            </div>

            {/* Central Laptop & Workspace Illustration */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              marginBottom: '28px'
            }}>
              <div style={{
                width: '270px',
                height: '168px',
                background: '#1e293b',
                borderRadius: '12px 12px 0 0',
                border: '3px solid #334155',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.28)',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <span style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: 600 }}>Leads Management Hub</span>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: '70px', padding: '0 8px' }}>
                  <div style={{ flex: 1, height: '40%', background: '#0a66c2', borderRadius: '3px' }} />
                  <div style={{ flex: 1, height: '70%', background: '#38bdf8', borderRadius: '3px' }} />
                  <div style={{ flex: 1, height: '55%', background: '#0a66c2', borderRadius: '3px' }} />
                  <div style={{ flex: 1, height: '90%', background: '#10b981', borderRadius: '3px' }} />
                  <div style={{ flex: 1, height: '60%', background: '#38bdf8', borderRadius: '3px' }} />
                  <div style={{ flex: 1, height: '100%', background: '#0a66c2', borderRadius: '3px' }} />
                </div>

                <div style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: 700, textAlign: 'center' }}>
                  Real-Time Multi-Tenant Console
                </div>
              </div>

              <div style={{
                width: '330px',
                height: '14px',
                background: '#94a3b8',
                borderRadius: '0 0 14px 14px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ width: '42px', height: '4px', background: '#64748b', borderRadius: '2px' }} />
              </div>

              <div style={{
                width: '410px',
                height: '12px',
                background: '#e2e8f0',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }} />
            </div>

            {/* Floating Metric 3 */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '8px 14px',
              borderRadius: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#dc2626',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}>
              <span>🔥 Hot Leads Verified</span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
