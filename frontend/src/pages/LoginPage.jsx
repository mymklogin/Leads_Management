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
  Laptop,
  Sparkles,
  PhoneCall,
  Send,
  Users
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('superadmin');
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

  const fillSuperAdmin = () => {
    setUsername('superadmin');
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
            borderRadius: '8px',
            background: '#0a66c2',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(10, 102, 194, 0.3)'
          }}>
            <Flame size={22} />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0a66c2', letterSpacing: '-0.3px' }}>
              Leads<span style={{ color: '#1e293b' }}>Engine</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 18, marginRight: 8, fontSize: '13.5px', color: '#64748b', fontWeight: 600 }}>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PhoneCall size={14} /> Voice OBD
            </span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Send size={14} /> RCS Messaging
            </span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
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
            Demo Credentials
          </button>
        </div>
      </header>

      {/* Hero Section: 2 Columns */}
      <main className="login-hero">
        
        {/* Left Column: Form & Heading */}
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <h1 style={{ 
            fontSize: '40px', 
            fontWeight: 500, 
            color: '#8f5849', 
            lineHeight: 1.2, 
            marginBottom: '28px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Explore leads and grow your business network
          </h1>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '8px',
                    border: '1px solid #94a3b8',
                    fontSize: '15px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s'
                  }}
                  placeholder="superadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: '8px',
                    border: '1px solid #94a3b8',
                    fontSize: '15px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s'
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              By clicking Sign in, you agree to the Leads Engine{' '}
              <span style={{ color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }}>User Agreement</span>,{' '}
              <span style={{ color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>, and{' '}
              <span style={{ color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }}>Cookie Policy</span>.
            </p>

            {/* Primary Sign In Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '13px', 
                borderRadius: '28px',
                fontSize: '15px',
                fontWeight: 700,
                background: '#0a66c2',
                borderColor: '#0a66c2',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(10, 102, 194, 0.3)',
                marginTop: '6px'
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          {/* Quick SuperAdmin Button */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={fillSuperAdmin}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '28px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} color="#0a66c2" />
              <span>Use Default SuperAdmin (superadmin / Admin@123)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Chandra Aakar (Crescent / Arched Dome) with Laptop & 100% Delivery */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '20px'
        }}>
          {/* Semicircular / Arched "Chandra Aakar" Backdrop */}
          <div style={{
            width: '470px',
            height: '500px',
            borderRadius: '235px 235px 40px 40px', // Chandra Aakar / Crescent Arch
            background: 'linear-gradient(180deg, #fef3c7 0%, #fef9c3 30%, #e0f2fe 100%)',
            boxShadow: '0 20px 40px -15px rgba(254, 243, 199, 0.8), 0 10px 30px -10px rgba(10, 102, 194, 0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            border: '2px solid rgba(255,255,255,0.8)'
          }}>
            
            {/* Background Decorative Sun / Ambient Element */}
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

            {/* Floating Metric 1 (Top Right) */}
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

            {/* Floating Metric 2 (Mid Left) - 100% Delivery (Jio replaced with 100% Delivery) */}
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
              {/* Laptop Screen & Glow */}
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
                {/* Simulated UI Screen on Laptop */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <span style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: 600 }}>Leads Management Hub</span>
                </div>

                {/* Dashboard graph lines inside laptop */}
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

              {/* Laptop Keyboard Base */}
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

              {/* Desk Surface */}
              <div style={{
                width: '410px',
                height: '12px',
                background: '#e2e8f0',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }} />
            </div>

            {/* Floating Metric 3 (Bottom Right) */}
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
