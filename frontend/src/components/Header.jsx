import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, Flame, Cloud } from 'lucide-react';

export const Header = ({ currentTitle, onOpenDrawer }) => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
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
          <div className="mobile-cloud-dot" title="Neon Cloud PostgreSQL Connected">
            <span className="live-pulse-dot"></span>
          </div>

          <div 
            className="user-avatar" 
            style={{ width: 32, height: 32, fontSize: '12px', cursor: 'pointer' }}
            onClick={onOpenDrawer}
          >
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Desktop-Only Header Content */}
      <div className="desktop-header-content">
        <div>
          <h1 className="page-title">{currentTitle || 'Dashboard Overview'}</h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {currentDate} • Enterprise Multi-Tenant Console
          </div>
        </div>

        <div className="header-actions">
          {/* Cloud Database Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#334155'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <Cloud size={13} color="#0a66c2" />
            <span>Neon PostgreSQL Cloud</span>
          </div>

          {/* User Role Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e0e7ff',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#4338ca'
          }}>
            <Shield size={14} />
            <span>{user?.roleName || 'SuperAdmin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
