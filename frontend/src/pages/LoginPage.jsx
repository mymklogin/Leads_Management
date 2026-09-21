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
    iconBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    iconShadow: '0 6px 18px rgba(234, 88, 12, 0.4)',
    leftCardBg: 'linear-gradient(150deg, #ea580c 0%, #d97706 45%, #be123c 100%)',
    buttonBg: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #c2410c 0%, #b91c1c 100%)',
    buttonShadow: '0 6px 20px rgba(234, 88, 12, 0.4)',
    accentColor: '#ea580c',
    skyBg: 'linear-gradient(180deg, #fdba74 0%, #fb923c 28%, #f97316 60%, #ea580c 88%, #c2410c 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef08a 35%, #fbbf24 70%, #f59e0b 100%)',
    sunGlow: '0 0 75px 32px rgba(251, 191, 36, 0.6), 0 0 150px 75px rgba(245, 158, 11, 0.35)',
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
    name: 'Evening Dusk Sunset',
    greeting: 'Good Evening!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #c2410c 0%, #9a3412 50%, #7c1846 100%)',
    iconShadow: '0 6px 18px rgba(194, 65, 12, 0.45)',
    leftCardBg: 'linear-gradient(150deg, #1c0734 0%, #3a0d4c 35%, #691345 70%, #99281a 100%)',
    buttonBg: 'linear-gradient(135deg, #c2410c 0%, #9a3412 45%, #7c1846 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 45%, #901b52 100%)',
    buttonShadow: '0 6px 20px rgba(194, 65, 12, 0.45)',
    accentColor: '#ea580c',
    skyBg: 'linear-gradient(180deg, #100624 0%, #22093d 20%, #3f0e4b 42%, #6f1642 65%, #9e2a22 84%, #cf4c17 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #fb923c 35%, #ea580c 70%, #991b1b 100%)',
    sunGlow: '0 0 75px 32px rgba(234, 88, 12, 0.65), 0 0 150px 75px rgba(153, 27, 27, 0.4)',
    sunPosition: { top: '24%', right: '14%' },
    isNight: false
  },
  night: {
    key: 'night',
    name: 'Midnight Starry',
    greeting: 'Good Night!',
    greetingSub: 'Sign in to your dashboard',
    iconBg: 'linear-gradient(135deg, #1e40af 0%, #0369a1 100%)',
    iconShadow: '0 6px 18px rgba(3, 105, 161, 0.45)',
    leftCardBg: 'linear-gradient(150deg, #050814 0%, #0a1026 40%, #151d3b 75%, #0f172a 100%)',
    buttonBg: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
    buttonHoverBg: 'linear-gradient(135deg, #0369a1 0%, #1e40af 100%)',
    buttonShadow: '0 6px 20px rgba(2, 132, 199, 0.45)',
    accentColor: '#38bdf8',
    skyBg: 'linear-gradient(180deg, #02040a 0%, #050b1a 25%, #08112b 55%, #0f172a 80%, #050b1a 100%)',
    sunGradient: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e0f2fe 40%, #bae6fd 75%, #7dd3fc 100%)',
    sunGlow: '0 0 55px 22px rgba(186, 230, 253, 0.5), 0 0 110px 50px rgba(56, 189, 248, 0.25)',
    sunPosition: { top: '14%', right: '16%' },
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

// Stylized Fluffy Vector Cloud Component (Day / Evening)
const FluffyCloud = ({ width = 140, height = 75, opacity = 0.85, style = {}, className = '', fillColor = '#ffffff' }) => (
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
      fill={fillColor}
    />
  </svg>
);

// Evening Sunset: Silhouette Bird in Flight with Flapping Wings
const SilhouetteBird = ({ width = 34, height = 18, style = {}, flapDuration = '0.75s' }) => (
  <div style={{ ...style, display: 'inline-block' }}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 24"
      fill="none"
      style={{
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.6))',
        animation: `birdWingFlap ${flapDuration} ease-in-out infinite alternate`
      }}
    >
      <path
        d="M22 14 C16 6 8 3 0 7 C7 12 15 14 20 20 C21 21 23 21 24 20 C29 14 37 12 44 7 C36 3 28 6 22 14 Z"
        fill="#140420"
      />
    </svg>
  </div>
);

// Night-time: Luminous 3D Crescent Moon with Atmospheric Halo
const CrescentMoon = () => (
  <div
    className="omni-crescent-moon"
    style={{
      position: 'absolute',
      top: '12%',
      right: '16%',
      width: '140px',
      height: '140px',
      pointerEvents: 'none',
      zIndex: 2,
      animation: 'moonGentlyFloat 9s ease-in-out infinite alternate'
    }}
  >
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
      <defs>
        <radialGradient id="moonGlowAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonSurface" x1="15%" y1="10%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#f0f9ff" />
          <stop offset="70%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <filter id="moonShadowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#7dd3fc" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="0" stdDeviation="28" floodColor="#0284c7" floodOpacity="0.4" />
        </filter>
      </defs>

      <circle cx="70" cy="70" r="68" fill="url(#moonGlowAura)" />
      <path
        d="M 70 16 A 54 54 0 1 0 124 88 A 47 47 0 1 1 70 16 Z"
        fill="url(#moonSurface)"
        filter="url(#moonShadowFilter)"
      />
      <circle cx="56" cy="50" r="5" fill="#7dd3fc" opacity="0.32" />
      <circle cx="44" cy="72" r="6.5" fill="#38bdf8" opacity="0.25" />
      <circle cx="72" cy="95" r="4.2" fill="#7dd3fc" opacity="0.28" />
      <circle cx="38" cy="54" r="3.5" fill="#93c5fd" opacity="0.3" />
      <circle cx="52" cy="85" r="4" fill="#60a5fa" opacity="0.22" />
    </svg>
  </div>
);

// 4-Point Twinkling Sparkle Star Component
const SparkleStar = ({ size = 12, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 0 C12 6.5 17.5 12 24 12 C17.5 12 12 17.5 12 24 C12 17.5 6.5 12 0 12 C6.5 12 12 6.5 12 0 Z"
      fill={color}
    />
  </svg>
);

// Night-time Star Field Coordinates (Distributed & Varied)
const NIGHT_STARS = [
  { top: '8%', left: '12%', size: 3, delay: '0s', dur: '2.5s', sparkle: true },
  { top: '15%', left: '25%', size: 2, delay: '1.2s', dur: '3.2s' },
  { top: '6%', left: '42%', size: 4, delay: '0.5s', dur: '2.8s', sparkle: true },
  { top: '22%', left: '55%', size: 2.5, delay: '1.8s', dur: '3.6s' },
  { top: '10%', left: '68%', size: 3.5, delay: '0.2s', dur: '2.4s', sparkle: true },
  { top: '28%', left: '82%', size: 2, delay: '2.1s', dur: '3.8s' },
  { top: '18%', left: '92%', size: 2.5, delay: '1.4s', dur: '3.1s' },
  { top: '35%', left: '18%', size: 2, delay: '0.7s', dur: '3.4s' },
  { top: '42%', left: '6%', size: 3, delay: '1.9s', dur: '2.7s' },
  { top: '48%', left: '28%', size: 1.5, delay: '2.5s', dur: '4s' },
  { top: '65%', left: '14%', size: 3, delay: '0.9s', dur: '2.9s', sparkle: true },
  { top: '78%', left: '22%', size: 2, delay: '1.6s', dur: '3.5s' },
  { top: '85%', left: '8%', size: 2.5, delay: '0.3s', dur: '3.1s' },
  { top: '72%', left: '88%', size: 3, delay: '1.1s', dur: '2.6s', sparkle: true },
  { top: '84%', left: '76%', size: 2, delay: '2.3s', dur: '3.7s' },
  { top: '62%', left: '94%', size: 2, delay: '1.7s', dur: '3.3s' },
  { top: '45%', left: '85%', size: 2.5, delay: '0.4s', dur: '2.8s' },
  { top: '12%', left: '32%', size: 1.5, delay: '2.8s', dur: '4.2s' },
  { top: '25%', left: '48%', size: 2, delay: '1.3s', dur: '3.0s' },
  { top: '32%', left: '62%', size: 3, delay: '0.8s', dur: '2.5s', sparkle: true },
  { top: '5%', left: '78%', size: 2, delay: '2.0s', dur: '3.6s' },
  { top: '16%', left: '86%', size: 1.5, delay: '1.5s', dur: '3.9s' },
  { top: '38%', left: '95%', size: 2, delay: '0.6s', dur: '3.2s' },
  { top: '55%', left: '80%', size: 3.5, delay: '1.0s', dur: '2.7s', sparkle: true },
  { top: '68%', left: '70%', size: 2, delay: '2.2s', dur: '3.5s' },
  { top: '88%', left: '60%', size: 1.5, delay: '0.9s', dur: '4.0s' },
  { top: '92%', left: '40%', size: 2.5, delay: '1.8s', dur: '3.1s' },
  { top: '80%', left: '32%', size: 2, delay: '2.6s', dur: '3.4s' },
  { top: '58%', left: '22%', size: 1.5, delay: '1.2s', dur: '3.8s' },
  { top: '29%', left: '10%', size: 2, delay: '0.5s', dur: '3.0s' }
];

// Night-time: Shooting Meteor Star Component
const ShootingStar = ({ style = {} }) => (
  <div
    style={{
      position: 'absolute',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(186,230,253,0.8) 50%, #ffffff 100%)',
      borderRadius: '999px',
      boxShadow: '0 0 10px 2px rgba(224, 242, 254, 0.85)',
      pointerEvents: 'none',
      ...style
    }}
  />
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

      {/* Embedded CSS Animations for Cloud Drift, Sun Glow, Flying Birds & Night Sky */}
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

        /* Evening: Flying Bird Wing Flap Animation */
        @keyframes birdWingFlap {
          0% {
            transform: scaleY(1) rotate(0deg);
          }
          50% {
            transform: scaleY(0.35) rotate(4deg);
          }
          100% {
            transform: scaleY(-0.3) rotate(-3deg);
          }
        }

        /* Evening: Flying Bird Horizon Traversal */
        @keyframes birdFlyAcross1 {
          0% {
            transform: translate3d(-100px, 0, 0);
          }
          100% {
            transform: translate3d(calc(100vw + 120px), -60px, 0);
          }
        }

        @keyframes birdFlyAcross2 {
          0% {
            transform: translate3d(-120px, 15px, 0);
          }
          100% {
            transform: translate3d(calc(100vw + 100px), -40px, 0);
          }
        }

        @keyframes birdFlyAcross3 {
          0% {
            transform: translate3d(-140px, -15px, 0);
          }
          100% {
            transform: translate3d(calc(100vw + 80px), -80px, 0);
          }
        }

        /* Night: Floating Moon Animation */
        @keyframes moonGentlyFloat {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-12px, -10px, 0) rotate(-3deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        /* Night: Cosmic Stars Drift Animation */
        @keyframes starsCosmicDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(24px, -12px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* Night: Star Twinkling Animations */
        @keyframes starTwinkleFast {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.75);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        @keyframes starTwinkleSlow {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.2;
            transform: scale(0.65);
          }
        }

        /* Night: Shooting Stars */
        @keyframes shootingStar1 {
          0% {
            transform: translate3d(0, 0, 0) rotate(-35deg);
            opacity: 0;
            width: 0px;
          }
          2% {
            opacity: 1;
            width: 140px;
          }
          12% {
            transform: translate3d(-400px, 280px, 0) rotate(-35deg);
            opacity: 0;
            width: 170px;
          }
          100% {
            opacity: 0;
            width: 0px;
          }
        }

        @keyframes shootingStar2 {
          0% {
            transform: translate3d(0, 0, 0) rotate(-38deg);
            opacity: 0;
            width: 0px;
          }
          2% {
            opacity: 1;
            width: 110px;
          }
          14% {
            transform: translate3d(-340px, 240px, 0) rotate(-38deg);
            opacity: 0;
            width: 140px;
          }
          100% {
            opacity: 0;
            width: 0px;
          }
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

        /* Responsive Mobile Layout (Width < 768px) */
        @media (max-width: 768px) {
          .omni-login-card {
            flex-direction: column !important;
            width: 92% !important;
            max-width: 440px !important;
            margin: 15px auto !important;
            border-radius: 22px !important;
            box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.15) !important;
          }
          .omni-left-panel {
            display: none !important;
          }
          .omni-right-panel {
            width: 100% !important;
            padding: 28px 20px 24px !important;
          }
          .omni-input-wrapper {
            height: 48px !important;
            border-radius: 10px !important;
          }
          .omni-input-field {
            font-size: 15px !important;
            height: 48px !important;
            letter-spacing: 0.3px !important;
          }
          .omni-floating-theme-bar {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            bottom: 10px !important;
            max-width: 95vw !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding: 4px 10px !important;
          }
        }
      `}</style>

      {/* 1. CELESTIAL ORB (CRESCENT MOON IN NIGHT / SUN ORB IN DAY & SUNSET) */}
      {activeTheme.isNight ? (
        <CrescentMoon />
      ) : (
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
      )}

      {/* Night-time Starry Sky with Twinkling, Drifting Stars & Shooting Stars */}
      {activeTheme.isNight && (
        <div className="omni-night-sky" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
          {/* Cosmic Nebula Glow */}
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '25%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 116, 144, 0.15) 0%, rgba(2, 6, 23, 0) 70%)',
            filter: 'blur(35px)'
          }} />

          {/* Drifting Stars Layer */}
          <div style={{ position: 'absolute', inset: 0, animation: 'starsCosmicDrift 28s ease-in-out infinite' }}>
            {NIGHT_STARS.map((star, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: star.top,
                  left: star.left,
                  animation: `${idx % 2 === 0 ? 'starTwinkleFast' : 'starTwinkleSlow'} ${star.dur} ease-in-out infinite ${star.delay}`
                }}
              >
                {star.sparkle ? (
                  <SparkleStar size={star.size * 3.5} color="#ffffff" />
                ) : (
                  <div
                    style={{
                      width: star.size,
                      height: star.size,
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: `0 0 ${star.size * 2.5}px ${star.size}px rgba(255, 255, 255, 0.9)`
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Shooting Stars */}
          <div style={{ position: 'absolute', top: '12%', right: '28%', animation: 'shootingStar1 10s ease-out infinite' }}>
            <ShootingStar />
          </div>
          <div style={{ position: 'absolute', top: '24%', right: '55%', animation: 'shootingStar2 14s ease-out infinite 5s' }}>
            <ShootingStar />
          </div>
        </div>
      )}

      {/* Evening Sunset: Flock of Flying Birds Traversal Across Sunset Horizon */}
      {activeThemeKey === 'evening' && (
        <div className="omni-evening-birds" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
          {/* Bird 1: Flock Leader (mid-flight across upper center) */}
          <div style={{ position: 'absolute', top: '15%', left: 0, animation: 'birdFlyAcross1 22s linear infinite', animationDelay: '-8s' }}>
            <SilhouetteBird width={36} height={19} flapDuration="0.7s" />
          </div>

          {/* Bird 2: Wingman High (already traversing right side) */}
          <div style={{ position: 'absolute', top: '11%', left: 0, animation: 'birdFlyAcross2 24s linear infinite', animationDelay: '-14s' }}>
            <SilhouetteBird width={30} height={16} flapDuration="0.75s" />
          </div>

          {/* Bird 3: Wingman Low (gliding mid-left) */}
          <div style={{ position: 'absolute', top: '19%', left: 0, animation: 'birdFlyAcross3 23s linear infinite', animationDelay: '-4s' }}>
            <SilhouetteBird width={28} height={15} flapDuration="0.65s" />
          </div>

          {/* Bird 4: Trail High */}
          <div style={{ position: 'absolute', top: '9%', left: 0, animation: 'birdFlyAcross1 25s linear infinite', animationDelay: '-18s' }}>
            <SilhouetteBird width={24} height={13} flapDuration="0.8s" />
          </div>

          {/* Bird 5: Trail Low */}
          <div style={{ position: 'absolute', top: '22%', left: 0, animation: 'birdFlyAcross2 26s linear infinite', animationDelay: '-11s' }}>
            <SilhouetteBird width={26} height={14} flapDuration="0.85s" />
          </div>

          {/* Bird 6: Distant Lone Glider */}
          <div style={{ position: 'absolute', top: '30%', left: 0, animation: 'birdFlyAcross3 28s linear infinite', animationDelay: '-22s' }}>
            <SilhouetteBird width={22} height={12} flapDuration="1.0s" />
          </div>

          {/* Bird 7: High Altitude Wanderer */}
          <div style={{ position: 'absolute', top: '6%', left: 0, animation: 'birdFlyAcross1 26s linear infinite', animationDelay: '-2s' }}>
            <SilhouetteBird width={20} height={11} flapDuration="0.9s" />
          </div>
        </div>
      )}

      {/* 2. ANIMATED FLOATING CLOUDS (Only during daylight and evening, hidden at night per user instruction!) */}
      {!activeTheme.isNight && (
        <>
          {/* Cloud 1: Bottom-Left */}
          <div style={{ position: 'absolute', bottom: '34%', left: '2%', zIndex: 1, pointerEvents: 'none' }}>
            <FluffyCloud 
              width={135} 
              height={70} 
              opacity={activeThemeKey === 'evening' ? 0.65 : 0.92} 
              fillColor={activeThemeKey === 'evening' ? '#ea580c' : '#ffffff'}
              className="omni-cloud-1" 
            />
          </div>

          {/* Cloud 2: Top-Left Floating gently */}
          <div style={{ position: 'absolute', top: '12%', left: '8%', zIndex: 1, pointerEvents: 'none' }}>
            <FluffyCloud 
              width={160} 
              height={82} 
              opacity={activeThemeKey === 'evening' ? 0.55 : 0.8} 
              fillColor={activeThemeKey === 'evening' ? '#c2410c' : '#ffffff'}
              className="omni-cloud-2" 
            />
          </div>

          {/* Cloud 3: Mid-Right floating near Sun */}
          <div style={{ position: 'absolute', top: '28%', right: '7%', zIndex: 1, pointerEvents: 'none' }}>
            <FluffyCloud 
              width={145} 
              height={74} 
              opacity={activeThemeKey === 'evening' ? 0.6 : 0.75} 
              fillColor={activeThemeKey === 'evening' ? '#9a3412' : '#ffffff'}
              className="omni-cloud-3" 
            />
          </div>

          {/* Cloud 4: Bottom-Right subtle ambient cloud */}
          <div style={{ position: 'absolute', bottom: '12%', right: '14%', zIndex: 1, pointerEvents: 'none' }}>
            <FluffyCloud 
              width={150} 
              height={76} 
              opacity={activeThemeKey === 'evening' ? 0.55 : 0.82} 
              fillColor={activeThemeKey === 'evening' ? '#c2410c' : '#ffffff'}
              className="omni-cloud-2" 
            />
          </div>

          {/* Cloud 5: Horizontal Drifter across the horizon */}
          <div style={{ position: 'absolute', top: '48%', left: 0, zIndex: 0, pointerEvents: 'none' }}>
            <FluffyCloud 
              width={180} 
              height={90} 
              opacity={activeThemeKey === 'evening' ? 0.35 : 0.5} 
              fillColor={activeThemeKey === 'evening' ? '#7c1846' : '#ffffff'}
              className="omni-cloud-horizon" 
            />
          </div>
        </>
      )}

      {/* 3. CENTER DUAL-PANEL LOGIN CARD (MATCHING EXACT OMNIDIGITAL GEOMETRY) */}
      <div className="omni-login-card" style={{
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
        <div className="omni-left-panel" style={{
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
        <div className="omni-right-panel" style={{
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
              <div className="omni-input-wrapper" style={{
                position: 'relative',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                <div style={{ paddingLeft: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  className="omni-input-field"
                  placeholder="Enter Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0 12px',
                    fontSize: '14px',
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
              <div className="omni-input-wrapper" style={{
                position: 'relative',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                <div style={{ paddingLeft: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="omni-input-field"
                  placeholder="Enter Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '0 38px 0 12px',
                    fontSize: '14px',
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
                    padding: 6
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              onClick={() => alert(`Password recovery: Please contact your enterprise administrator or ${branding?.supportEmail || 'support@rcsflow.io'} (${branding?.supportPhone || '+91 9170304221'}).`)}
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
      <div className="omni-floating-theme-bar" style={{
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
