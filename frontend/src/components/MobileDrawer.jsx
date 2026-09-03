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
  X,
  Shield,
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

export const MobileDrawer = ({ isOpen, onClose, activeTab, onSelectTab }) => {
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

  const handleItemClick = (key) => {
    onSelectTab(key);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-sheet" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-icon" style={{ width: 34, height: 34 }}>
              <Flame size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Leads<span style={{ color: '#0a66c2' }}>Engine</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Cloud Enterprise App</div>
            </div>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mobile-drawer-user-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '16px' }}>
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || user?.username}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@expressivr.com'}
              </div>
            </div>
            <span className={`user-role-tag ${getRoleClass(user?.role)}`}>
              {user?.roleName || 'User'}
            </span>
          </div>

          {/* Wallet Balance Tiles */}
          <div className="mobile-wallet-grid">
            <div className="mobile-wallet-tile">
              <span className="mobile-wallet-label">Voice Credits</span>
              <span className="mobile-wallet-val">{user?.voiceCredits?.toLocaleString() || 0}</span>
            </div>
            <div className="mobile-wallet-tile">
              <span className="mobile-wallet-label">RCS Credits</span>
              <span className="mobile-wallet-val">{user?.rcsCredits?.toLocaleString() || 0}</span>
            </div>
            <div className="mobile-wallet-tile">
              <span className="mobile-wallet-label">WhatsApp</span>
              <span className="mobile-wallet-val">{user?.whatsAppCredits?.toLocaleString() || 0}</span>
            </div>
            <div className="mobile-wallet-tile">
              <span className="mobile-wallet-label">SMS Credits</span>
              <span className="mobile-wallet-val">{user?.smsCredits?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Menu Navigation List */}
        <div className="mobile-drawer-menu-list">
          <div className="nav-section-title">ALL CHANNELS & MODULES</div>

          {allowedMenus && allowedMenus.length > 0 ? (
            allowedMenus.map(menu => {
              const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
              const isExpanded = expandedMenus[menu.menuKey];
              const isMenuSelected = activeTab === menu.menuKey;

              return (
                <div key={menu.id || menu.menuKey} style={{ marginBottom: 4 }}>
                  <div 
                    className={`nav-item ${isMenuSelected && !hasSubMenus ? 'active' : ''}`}
                    onClick={() => {
                      if (hasSubMenus) {
                        toggleExpand(menu.menuKey);
                      } else {
                        handleItemClick(menu.menuKey);
                      }
                    }}
                    style={{ padding: '10px 14px' }}
                  >
                    <div className="nav-item-icon">
                      {getServiceIcon(menu.serviceCode)}
                    </div>
                    <span className="nav-item-text" style={{ fontSize: '13.5px' }}>{menu.title}</span>
                    {hasSubMenus && (
                      <div style={{ color: '#94a3b8' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    )}
                  </div>

                  {/* Submenu Accordion */}
                  {hasSubMenus && isExpanded && (
                    <div className="mobile-submenu-list">
                      {menu.subMenus.map(sub => {
                        const isSubActive = activeTab === sub.menuKey;
                        return (
                          <div 
                            key={sub.id || sub.menuKey}
                            className={`mobile-submenu-item ${isSubActive ? 'active' : ''}`}
                            onClick={() => handleItemClick(sub.menuKey)}
                          >
                            <span className="mobile-submenu-dot"></span>
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
              No menus available.
            </div>
          )}
        </div>

        {/* Drawer Footer Sign Out */}
        <div className="mobile-drawer-footer">
          <button 
            type="button" 
            className="mobile-drawer-signout-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out of Account</span>
          </button>
        </div>

      </div>
    </div>
  );
};
