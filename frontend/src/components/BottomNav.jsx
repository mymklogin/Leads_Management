import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Send, 
  Menu 
} from 'lucide-react';

export const BottomNav = ({ activeTab, onSelectTab, onOpenDrawer, isDrawerOpen }) => {
  const isTabActive = (tabKey) => {
    if (tabKey === 'DASHBOARD') return activeTab === 'DASHBOARD' || activeTab === 'REPORTS_OVERVIEW';
    if (tabKey === 'LEADS_CRM') return activeTab.startsWith('LEADS');
    if (tabKey === 'VOICE') return activeTab.startsWith('VOICE');
    if (tabKey === 'MESSAGES') return activeTab.startsWith('RCS') || activeTab.startsWith('WHATSAPP') || activeTab.startsWith('SMS');
    return false;
  };

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Home / Dashboard */}
      <button 
        type="button"
        className={`bottom-nav-item ${isTabActive('DASHBOARD') && !isDrawerOpen ? 'active' : ''}`}
        onClick={() => onSelectTab('DASHBOARD')}
      >
        <div className="bottom-nav-icon-box">
          <LayoutDashboard size={20} />
        </div>
        <span className="bottom-nav-label">Home</span>
      </button>

      {/* 2. Leads CRM */}
      <button 
        type="button"
        className={`bottom-nav-item ${isTabActive('LEADS_CRM') && !isDrawerOpen ? 'active' : ''}`}
        onClick={() => onSelectTab('LEADS_ALL')}
      >
        <div className="bottom-nav-icon-box">
          <Users size={20} />
        </div>
        <span className="bottom-nav-label">Leads</span>
      </button>

      {/* 3. Voice OBD Calls */}
      <button 
        type="button"
        className={`bottom-nav-item ${isTabActive('VOICE') && !isDrawerOpen ? 'active' : ''}`}
        onClick={() => onSelectTab('VOICE_SINGLE_CALL')}
      >
        <div className="bottom-nav-icon-box">
          <PhoneCall size={20} />
        </div>
        <span className="bottom-nav-label">Voice OBD</span>
      </button>

      {/* 4. RCS Messaging */}
      <button 
        type="button"
        className={`bottom-nav-item ${isTabActive('MESSAGES') && !isDrawerOpen ? 'active' : ''}`}
        onClick={() => onSelectTab('RCS_OVERVIEW')}
      >
        <div className="bottom-nav-icon-box">
          <Send size={20} />
        </div>
        <span className="bottom-nav-label">Messages</span>
      </button>

      {/* 5. More / Full Services Drawer */}
      <button 
        type="button"
        className={`bottom-nav-item ${isDrawerOpen ? 'active' : ''}`}
        onClick={onOpenDrawer}
      >
        <div className="bottom-nav-icon-box">
          <Menu size={20} />
        </div>
        <span className="bottom-nav-label">Menu</span>
      </button>
    </nav>
  );
};
