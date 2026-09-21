import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { 
  Sun, 
  CloudSun, 
  Sunset, 
  Moon, 
  Cloud, 
  MessageSquare, 
  MessageCircle, 
  Code2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check 
} from 'lucide-react';

// Time Period Themes Configuration
const THEMES = {
  morning: {
    key: 'morning',
    name: 'Morning Sunrise',
    greeting: 'Good Morning!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    iconShadow: '0 6px 18px rgba(249, 115, 22, 0.35)',
    leftCardBg: 'linear-gradient(150deg, #f97316 0%, #ea580c 45%, #db2777 100%)',
    buttonBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    buttonShadow: '0 6px 20px rgba(239, 68, 68, 0.35)',
    accentColor: '#ea580c',
    skyBg: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 35%, #fde68a 70%, #ffedd5 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fff3b0 35%, #fcd34d 75%, #f59e0b 100%)',
    sunGlow: '0 0 70px 30px rgba(251, 191, 36, 0.5), 0 0 140px 70px rgba(245, 158, 11, 0.25)',
    sunPosition: { top: '18%', right: '16%' },
    isNight: false
  },
  afternoon: {
    key: 'afternoon',
    name: 'Afternoon Clear Sky',
    greeting: 'Good Afternoon!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    iconShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
    leftCardBg: 'linear-gradient(150deg, #0284c7 0%, #0369a1 40%, #1d4ed8 100%)',
    buttonBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
    buttonShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
    accentColor: '#0284c7',
    skyBg: 'linear-gradient(180deg, #dbeafe 0%, #bae6fd 35%, #93c5fd 70%, #bfdbfe 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #fffdf0 0%, #ffeb7a 40%, #ffd043 85%, #fbb42c 100%)',
    sunGlow: '0 0 65px 25px rgba(255, 230, 100, 0.45), 0 0 130px 65px rgba(255, 215, 0, 0.25)',
    sunPosition: { top: '16%', right: '18%' },
    isNight: false
  },
  evening: {
    key: 'evening',
    name: 'Evening Sunset',
    greeting: 'Good Evening!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    iconShadow: '0 6px 18px rgba(139, 92, 246, 0.35)',
    leftCardBg: 'linear-gradient(150deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)',
    buttonBg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
    buttonShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
    accentColor: '#7c3aed',
    skyBg: 'linear-gradient(180deg, #fce7f3 0%, #fed7aa 40%, #e9d5ff 75%, #fbcfe8 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #fb923c 45%, #ea580c 80%, #be185d 100%)',
    sunGlow: '0 0 65px 25px rgba(251, 146, 60, 0.5), 0 0 130px 65px rgba(219, 39, 119, 0.25)',
    sunPosition: { top: '22%', right: '15%' },
    isNight: false
  },
  night: {
    key: 'night',
    name: 'Midnight Starry',
    greeting: 'Good Night!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    iconShadow: '0 6px 18px rgba(59, 130, 246, 0.35)',
    leftCardBg: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)',
    buttonBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    buttonShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
    accentColor: '#38bdf8',
    skyBg: 'linear-gradient(180deg, #090d16 0%, #0f172a 40%, #1e1b4b 80%, #090d16 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e0f2fe 40%, #bae6fd 75%, #7dd3fc 100%)',
    sunGlow: '0 0 55px 22px rgba(186, 230, 253, 0.5), 0 0 110px 50px rgba(56, 189, 248, 0.25)',
    sunPosition: { top: '16%', right: '20%' },
    isNight: true
  }
};

// Determines active theme according to real-time clock
const detectThemeByTime = () => {
  const hour = new Date().getHours();
  // Morning: 5:00 AM - 11:59 AM
  if (hour >= 5 && hour < 12) return 'morning';
  // Afternoon: 12:00 PM - 4:59 PM
  if (hour >= 12 && hour < 17) return 'afternoon';
  // Evening: 5:00 PM - 7:59 PM
  if (hour >= 17 && hour < 20) return 'evening';
  // Night: 8:00 PM - 4:59 AM
  return 'night';
};

// Stylized Fluffy Vector Cloud Component
const FluffyCloud = ({ width = 140, height = 75, opacity = 0.85, style = {}, className = '' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 160 85"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ ...style, opacity, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.06))' }}
  >
    <path
      d="M30 65C18.9543 65 10 56.0457 10 45C10 34.6548 17.8447 26.1437 28.0268 25.1009C30.6558 13.7915 40.8354 5.5 53 5.5C64.6738 5.5 74.524 13.0645 77.5855 23.636C80.8986 21.3283 84.9392 20 89.3 20C99.2411 20 107.3 28.0589 107.3 38C107.3 38.3377 107.288 38.6727 107.265 39.0044C114.394 40.2641 119.8 46.5053 119.8 54C119.8 62.2843 113.084 69 104.8 69L30 69C30 67.6667 30 66.3333 30 65Z"
      fill="#ffffff"
    />
  </svg>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const { branding } = useBranding();
  
  // Credentials matching OmniDigital live mockups
  const [username, setUsername] = useState('Abhishaarod');
  const [password, setPassword] = useState('admin@@123');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic Time Theme System
  const [themeMode, setThemeMode] = useState('auto'); // 'auto' | 'morning' | 'afternoon' | 'evening' | 'night'
  const [activeThemeKey, setActiveThemeKey] = useState(detectThemeByTime);
  const [currentClockStr, setCurrentClockStr] = useState('');

  // Auto-transition timer (checks time every 15-30 seconds)
  useEffect(() => {
    const updateTimeState = () => {
      const now = new Date();
      setCurrentClockStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (themeMode === 'auto') {
        const detected = detectThemeByTime();
        setActiveThemeKey(detected);
      }
    };

    updateTimeState();
    const interval = setInterval(updateTimeState, 15000); // 15s check
    return () => clearInterval(interval);
  }, [themeMode]);

  const activeTheme = THEMES[activeThemeKey] || THEMES.afternoon;

  const handleSelectThemeMode = (mode) => {
    setThemeMode(mode);
    if (mode === 'auto') {
      setActiveThemeKey(detectThemeByTime());
    } else {
      setActiveThemeKey(mode);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password.trim());
    } catch (err) {
      console.error('Login failure:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Weather Icon Component based on active theme
  const renderWeatherIcon = () => {
    switch (activeThemeKey) {
      case 'morning':
        return <Sun size={24} color="#ffffff" />;
      case 'afternoon':
        return <CloudSun size={24} color="#ffffff" />;
      case 'evening':
        return <Sunset size={24} color="#ffffff" />;
      case 'night':
        return <Moon size={24} color="#ffffff" />;
      default:
        return <CloudSun size={24} color="#ffffff" />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: activeTheme.skyBg,
      transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>

      {/* Embedded CSS Animations for Cloud Drift, Sun Glow & Spinner */}
      <style>{`
        @keyframes cloudFloatLeftRight {
          0% {
            transform: translate3d(0px, 0px, 0);
          }
          50% {
            transform: translate3d(55px, -10px, 0);
          }
          100% {
            transform: translate3d(0px, 0px, 0);
          }
        }

        @keyframes cloudFloatSlow {
          0% {
            transform: translate3d(0px, 0px, 0);
          }
          50% {
            transform: translate3d(-60px, 8px, 0);
          }
          100% {
            transform: translate3d(0px, 0px, 0);
          }
        }

        @keyframes cloudDriftHorizon {
          0% {
            transform: translate3d(-200px, 0, 0);
          }
          100% {
            transform: translate3d(calc(100vw + 200px), 0, 0);
          }
        }

        @keyframes sunGlowPulse {
          0% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.95;
          }
        }

        @keyframes omniButtonSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .omni-cloud-1 {
          animation: cloudFloatLeftRight 16s ease-in-out infinite;
        }

        .omni-cloud-2 {
          animation: cloudFloatSlow 22s ease-in-out infinite;
        }

        .omni-cloud-3 {
          animation: cloudFloatLeftRight 18s ease-in-out infinite reverse;
        }

        .omni-cloud-horizon {
          animation: cloudDriftHorizon 65s linear infinite;
        }

        .omni-sun-orb {
          animation: sunGlowPulse 8s ease-in-out infinite;
        }

        .omni-feature-pill:hover {
          background: rgba(255, 255, 255, 0.22) !important;
          transform: translateX(4px);
        }

        .omni-theme-pill {
          transition: all 0.2s ease;
        }
        .omni-theme-pill:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {/* 1. CELESTIAL ORB (SUN / MOON WITH REALISTIC 3D GLOW) */}
      <div 
        className="omni-sun-orb"
        style={{
          position: 'absolute',
          top: activeTheme.sunPosition.top,
          right: activeTheme.sunPosition.right,
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: activeTheme.sunGradient,
          boxShadow: activeTheme.sunGlow,
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Night-time Starry Particles */}
      {activeTheme.isNight && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '12%', left: '20%', width: 3, height: 3, background: '#ffffff', borderRadius: '50%', boxShadow: '0 0 6px #fff' }} />
          <div style={{ position: 'absolute', top: '25%', left: '35%', width: 2, height: 2, background: '#ffffff', borderRadius: '50%', boxShadow: '0 0 4px #fff' }} />
          <div style={{ position: 'absolute', top: '18%', left: '60%', width: 3, height: 3, background: '#ffffff', borderRadius: '50%', boxShadow: '0 0 6px #fff' }} />
          <div style={{ position: 'absolute', top: '35%', left: '78%', width: 2, height: 2, background: '#ffffff', borderRadius: '50%', boxShadow: '0 0 4px #fff' }} />
          <div style={{ position: 'absolute', top: '70%', left: '15%', width: 3, height: 3, background: '#ffffff', borderRadius: '50%', boxShadow: '0 0 5px #fff' }} />
        </div>
      )}

      {/* 2. ANIMATED FLOATING CLOUDS ("jo esme white sky jaisa hai o edhar udhar jata aata rhata hai") */}
      {/* Cloud 1: Bottom-Left (Identical to reference screenshot media_1789558964584.png) */}
      <div style={{ position: 'absolute', bottom: '34%', left: '2%', zIndex: 1, pointerEvents: 'none' }}>
        <FluffyCloud width={135} height={70} opacity={0.92} className="omni-cloud-1" />
      </div>

      {/* Cloud 2: Top-Left Floating gently */}
      <div style={{ position: 'absolute', top: '12%', left: '8%', zIndex: 1, pointerEvents: 'none' }}>
        <FluffyCloud width={160} height={82} opacity={0.8} className="omni-cloud-2" />
      </div>

      {/* Cloud 3: Mid-Right floating near Sun */}
      <div style={{ position: 'absolute', top: '28%', right: '7%', zIndex: 1, pointerEvents: 'none' }}>
        <FluffyCloud width={145} height={74} opacity={0.75} className="omni-cloud-3" />
      </div>

      {/* Cloud 4: Bottom-Right subtle ambient cloud */}
      <div style={{ position: 'absolute', bottom: '12%', right: '14%', zIndex: 1, pointerEvents: 'none' }}>
        <FluffyCloud width={150} height={76} opacity={0.82} className="omni-cloud-2" />
      </div>

      {/* Cloud 5: Horizontal Drifter across the horizon */}
      <div style={{ position: 'absolute', top: '48%', left: 0, zIndex: 0, pointerEvents: 'none' }}>
        <FluffyCloud width={180} height={90} opacity={0.5} className="omni-cloud-horizon" />
      </div>

      {/* 3. CENTER DUAL-PANEL LOGIN CARD (MATCHING EXACT OMNIDIGITAL GEOMETRY) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '840px',
        width: '92%',
        borderRadius: '26px',
        background: '#ffffff',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        margin: '20px 0'
      }}>

        {/* LEFT COLUMN: VIBRANT DYNAMIC HERO PANEL */}
        <div style={{
          width: '45%',
          background: activeTheme.leftCardBg,
          padding: '36px 30px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Subtle Ambient Glow Circles on Card */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            pointerEvents: 'none'
          }} />

          {/* Top Badge & Content */}
          <div>
            {/* OMNI PANEL Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '20px',
              padding: '4px 12px',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              marginBottom: '18px'
            }}>
              <Cloud size={13} fill="#ffffff" />
              <span>{(branding?.companyName || 'ENTERPRISE').toUpperCase()} PANEL</span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.22,
              margin: '0 0 10px 0',
              letterSpacing: '-0.3px'
            }}>
              Empowering<br />Communication.
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.5,
              margin: '0 0 24px 0',
              fontWeight: 400
            }}>
              One secure platform for messaging, engagement and cloud delivery.
            </p>

            {/* 3 Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              
              <div 
                className="omni-feature-pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageSquare size={16} color="#ffffff" />
                <span>Bulk SMS & RCS</span>
              </div>

              <div 
                className="omni-feature-pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                <MessageCircle size={16} color="#ffffff" />
                <span>WhatsApp Business</span>
              </div>

              <div 
                className="omni-feature-pill"
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                <Code2 size={16} color="#ffffff" />
                <span>Web & Cloud Solutions</span>
              </div>

            </div>
          </div>

          {/* Bottom Stats */}
          <div style={{ display: 'flex', gap: 28, marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.2px' }}>2000+</div>
              <div style={{ fontSize: '9.5px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.8px', marginTop: 1 }}>CLIENTS</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.2px' }}>5000+</div>
              <div style={{ fontSize: '9.5px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.8px', marginTop: 1 }}>PROJECTS</div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div style={{
          width: '55%',
          background: '#ffffff',
          padding: '36px 36px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          {/* Header Row: Icon + Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '22px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: activeTheme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: activeTheme.iconShadow,
              transition: 'background 0.8s ease, box-shadow 0.8s ease',
              flexShrink: 0
            }}>
              {renderWeatherIcon()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '21px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.2px' }}>
                {activeTheme.greeting}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {activeTheme.greetingSub}
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Field 1: USERNAME */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.6px',
                marginBottom: '6px',
                display: 'block'
              }}>
                USERNAME
              </label>
              <div style={{
                position: 'relative',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                <div style={{ paddingLeft: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>

            {/* Field 2: PASSWORD */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.6px',
                marginBottom: '6px',
                display: 'block'
              }}>
                PASSWORD
              </label>
              <div style={{
                position: 'relative',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                <div style={{ paddingLeft: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0 36px 0 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    fontWeight: 500
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Checkbox: Terms & Conditions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <input
                type="checkbox"
                id="loginTermsCheckbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{
                  width: 15,
                  height: 15,
                  cursor: 'pointer',
                  accentColor: activeTheme.accentColor
                }}
              />
              <label htmlFor="loginTermsCheckbox" style={{ fontSize: '11.5px', color: '#64748b', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                I agree to the <span style={{ color: activeTheme.accentColor, fontWeight: 700 }}>Terms & Conditions</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                background: activeTheme.buttonBg,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: activeTheme.buttonShadow,
                transition: 'all 0.25s ease',
                marginTop: '4px'
              }}
              onMouseEnter={e => {
                if (!loading) e.currentTarget.style.background = activeTheme.buttonHoverBg;
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.background = activeTheme.buttonBg;
              }}
            >
              {loading ? (
                <div style={{
                  width: 18,
                  height: 18,
                  border: '2.5px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '50%',
                  borderTopColor: '#ffffff',
                  animation: 'omniButtonSpin 0.7s linear infinite'
                }} />
              ) : (
                <>
                  <ArrowRight size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>

          </form>

          {/* Bottom Forgot Password Link */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => alert(`Password recovery: Please contact your enterprise administrator or ${branding?.supportEmail || 'support@leadsengine.com'} (${branding?.supportPhone || '+91 9170304221'}).`)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '11.5px',
                color: '#64748b',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer'
              }}
            >
              <KeyRound size={13} color="#94a3b8" />
              <span>Forgot Password?</span>
            </button>

            {/* Quick Demo Autofill Hint */}
            <button
              type="button"
              onClick={() => {
                setUsername('Abhishaarod');
                setPassword('admin@@123');
                setAgreeTerms(true);
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
              title="Click to fill Abhishaarod credentials"
            >
              ⚡ Fill Demo
            </button>
          </div>

        </div>

      </div>

      {/* 4. SLEEK FLOATING THEME TIME CONTROLLER & STATUS PILL */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        padding: '5px 12px',
        borderRadius: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        fontSize: '11px',
        color: '#334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 4, fontWeight: 700 }}>
          <Clock size={13} color={activeTheme.accentColor} />
          <span>{currentClockStr || 'Live'}</span>
        </div>

        {/* Mode Buttons */}
        <button
          type="button"
          onClick={() => handleSelectThemeMode('auto')}
          className="omni-theme-pill"
          style={{
            background: themeMode === 'auto' ? activeTheme.accentColor : '#f1f5f9',
            color: themeMode === 'auto' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '10.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Auto transitions every 15-30 mins based on real-time clock"
        >
          Auto (Dynamic)
        </button>

        <button
          type="button"
          onClick={() => handleSelectThemeMode('morning')}
          className="omni-theme-pill"
          style={{
            background: themeMode === 'morning' ? '#f97316' : 'transparent',
            color: themeMode === 'morning' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🌅 Morning
        </button>

        <button
          type="button"
          onClick={() => handleSelectThemeMode('afternoon')}
          className="omni-theme-pill"
          style={{
            background: themeMode === 'afternoon' ? '#0284c7' : 'transparent',
            color: themeMode === 'afternoon' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ☀️ Afternoon
        </button>

        <button
          type="button"
          onClick={() => handleSelectThemeMode('evening')}
          className="omni-theme-pill"
          style={{
            background: themeMode === 'evening' ? '#7c3aed' : 'transparent',
            color: themeMode === 'evening' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🌇 Evening
        </button>

        <button
          type="button"
          onClick={() => handleSelectThemeMode('night')}
          className="omni-theme-pill"
          style={{
            background: themeMode === 'night' ? '#1e1b4b' : 'transparent',
            color: themeMode === 'night' ? '#ffffff' : '#64748b',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🌙 Night
        </button>
      </div>

    </div>
  );
};

export default LoginPage;
