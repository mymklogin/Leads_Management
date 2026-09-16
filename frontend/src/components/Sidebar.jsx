import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileCode, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  PieChart, 
  MessageSquare, 
  Database, 
  BookOpen, 
  LogOut, 
  Send,
  Flame,
  Shield,
  Wallet
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  // Menus matching official OmniDigital RCS Suite + Payment Manage
  const rcsMenuItems = [
    { key: 'RCS_DASHBOARD', title: 'Dashboard', icon: LayoutDashboard },
    { key: 'RCS_PAYMENT_MANAGE', title: 'Payment Manage', icon: Wallet },
    { key: 'RCS_TEMPLATES', title: 'Templates', icon: FileCode },
    { key: 'RCS_CAMPAIGNS', title: 'Create Campaign', icon: PlusCircle },
    { key: 'RCS_MULTI_SCHEDULE', title: 'Multi Schedule Campaign', icon: Calendar },
    { key: 'RCS_REPORTS', title: 'Campaign Report', icon: BarChart3 },
    { key: 'RCS_MIS_REPORT', title: 'MIS Report', icon: PieChart },
    { key: 'RCS_CHAT', title: 'RCS Chat', icon: MessageSquare },
    { key: 'RCS_CONSOLIDATE_REPORT', title: 'Consolidate Report', icon: Database },
    { key: 'RCS_API_DOC', title: 'API Documentation', icon: BookOpen }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '18px',
          boxShadow: '0 2px 8px rgba(10, 102, 194, 0.3)'
        }}>
          O
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
            OMNI
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            RCS Business Suite
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="sidebar-content" style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '6px 12px 8px 12px' }}>
          RCS Messaging
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {rcsMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key || (item.key === 'RCS_DASHBOARD' && activeTab === 'DASHBOARD');

            return (
              <div 
                key={item.key}
                className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0a66c2' : '#475569',
                  background: isActive ? '#e0f2fe' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={17} color={isActive ? '#0a66c2' : '#64748b'} />
                <span style={{ flex: 1 }}>{item.title}</span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0a66c2' }}></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Sign Out */}
      <div className="sidebar-footer" style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
          <div style={{ 
            width: 32, 
            height: 32, 
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
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || user?.username || 'Abhishaarod'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Verified Client
            </div>
          </div>
        </div>

        <button 
          className="btn btn-outline" 
          style={{ 
            width: '100%', 
            borderColor: '#fecaca', 
            color: '#dc2626', 
            background: '#ffffff', 
            fontWeight: 700, 
            fontSize: '12px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 6,
            padding: '7px'
          }}
          onClick={logout}
        >
          <LogOut size={14} color="#dc2626" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
