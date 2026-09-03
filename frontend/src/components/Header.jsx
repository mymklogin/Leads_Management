import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, Bell, Shield } from 'lucide-react';

export const Header = ({ currentTitle }) => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="header">
      <div>
        <h1 className="page-title">{currentTitle || 'Dashboard Overview'}</h1>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          {currentDate} • Enterprise Multi-Tenant Console
        </div>
      </div>

      <div className="header-actions">
        {/* SQL Server Connection Status Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          padding: '4px 12px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#334155'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
          <span>SQL Server: LeadsManagementDb</span>
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
    </header>
  );
};
