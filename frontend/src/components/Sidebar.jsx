import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PhoneCall, 
  MessageSquare, 
  Send, 
  Mail, 
  Users, 
  UserCheck, 
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Flame,
  CreditCard
} from 'lucide-react';

const getServiceIcon = (serviceCode) => {
  switch (serviceCode) {
    case 'DASHBOARD': return <LayoutDashboard size={18} />;
    case 'VOICE': return <PhoneCall size={18} />;
    case 'WHATSAPP': return <MessageSquare size={18} />;
    case 'RCS': return <Send size={18} />;
    case 'SMS': return <Mail size={18} />;
    case 'LEADS_CRM': return <Users size={18} />;
    case 'USER_MANAGEMENT': return <UserCheck size={18} />;
    case 'REPORTS': return <BarChart3 size={18} />;
    default: return <LayoutDashboard size={18} />;
  }
};

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, allowedMenus, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    VOICE_OBD: true,
    RCS_MESSAGING: true,
    LEADS_CRM: true,
    USER_MANAGEMENT: true
  });

  const toggleExpand = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 1:
      case 'SuperAdmin': return 'role-superadmin';
      case 2:
      case 'Admin': return 'role-admin';
      case 3:
      case 'Reseller': return 'role-reseller';
      default: return 'role-user';
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header (Matches Login Page Design & Colors) */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Flame size={24} />
        </div>
        <div>
          <div className="brand-title">Enterprise Leads</div>
          <div className="brand-subtitle">Multi-Service Cloud SaaS</div>
        </div>
      </div>

      {/* Dynamic Navigation Menu Tree */}
      <div className="sidebar-content">
        <div className="nav-section-title">Navigation Services</div>

        {allowedMenus && allowedMenus.length > 0 ? (
          allowedMenus.map(menu => {
            const hasSub = menu.subMenus && menu.subMenus.length > 0;
            const isExpanded = expandedMenus[menu.menuKey];
            const isRootActive = activeTab === menu.menuKey;

            return (
              <div key={menu.id}>
                <div 
                  className={`nav-item ${isRootActive ? 'active' : ''}`}
                  onClick={() => {
                    if (hasSub) {
                      toggleExpand(menu.menuKey);
                    }
                    onSelectTab(menu.menuKey);
                  }}
                >
                  {getServiceIcon(menu.serviceCode)}
                  <span style={{ flex: 1 }}>{menu.title}</span>
                  {hasSub && (
                    <span style={{ opacity: 0.6 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </div>

                {/* Submenus if allowed */}
                {hasSub && isExpanded && (
                  <div style={{ marginBottom: 6 }}>
                    {menu.subMenus.map(sub => {
                      const isSubActive = activeTab === sub.menuKey;
                      return (
                        <div
                          key={sub.id}
                          className={`nav-subitem ${isSubActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTab(sub.menuKey);
                          }}
                        >
                          <span>•</span>
                          <span>{sub.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
            No menus assigned. Please contact your admin.
          </div>
        )}
      </div>

      {/* User Footer Profile & Wallet */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="user-name">{user?.fullName || user?.username}</div>
            <span className={`user-role-tag ${getRoleClass(user?.role)}`}>
              {user?.roleName || 'User'}
            </span>
          </div>
        </div>

        {/* Quick Wallet Credits */}
        <div style={{ 
          fontSize: '11px', 
          color: '#475569', 
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '6px 10px',
          borderRadius: '8px'
        }}>
          <span>Voice: <b style={{ color: '#0f172a' }}>{user?.voiceCredits || 0}</b></span>
          <span>WhatsApp: <b style={{ color: '#0f172a' }}>{user?.whatsAppCredits || 0}</b></span>
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
            gap: 6
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
