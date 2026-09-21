import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { 
  Gauge,
  LayoutDashboard, 
  Send, 
  MousePointer, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  TrendingUp,
  Settings, 
  Briefcase, 
  ShieldCheck, 
  Code, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Calendar, 
  PieChart, 
  Database, 
  Wallet, 
  Users, 
  Sliders, 
  Network, 
  Server, 
  Globe, 
  Hash, 
  Bot, 
  FileCode, 
  PlusCircle, 
  BookOpen, 
  Key, 
  Wrench, 
  LogOut, 
  Layers, 
  Lock, 
  Shield, 
  PhoneCall,
  Activity
} from 'lucide-react';

const ICON_MAP = {
  gauge: Gauge,
  layoutdashboard: Gauge,
  dashboard: Gauge,
  send: Send,
  sms: Send,
  mousepointer: MousePointer,
  clicker: MousePointer,
  messagesquare: MessageSquare,
  chat: MessageSquare,
  rcs: MessageSquare,
  trendingup: TrendingUp,
  reports: TrendingUp,
  barchart3: BarChart3,
  settings: Settings,
  manage: Settings,
  briefcase: Briefcase,
  reseller: Briefcase,
  code: Code,
  httpapi: Code,
  api: Code,
  key: Key,
  twofactor: Key,
  twofactorauth: Key,
  filecode: FileCode,
  jsonapi: FileCode,
  wrench: Wrench,
  utilities: Wrench,
  zap: Zap,
  gateway: Zap,
  helpcircle: HelpCircle,
  help: HelpCircle,
  calendar: Calendar,
  piechart: PieChart,
  database: Database,
  wallet: Wallet,
  users: Users,
  sliders: Sliders,
  network: Network,
  server: Server,
  globe: Globe,
  hash: Hash,
  bot: Bot,
  pluscircle: PlusCircle,
  bookopen: BookOpen,
  layers: Layers,
  lock: Lock,
  shield: Shield,
  shieldcheck: ShieldCheck,
  phonecall: PhoneCall,
  checkcircle2: CheckCircle2
};

const getMenuIcon = (iconName, isActive, isDirectActive = false) => {
  const normalized = (iconName || 'Layers').toLowerCase().replace(/[^a-z0-9]/g, '');
  const IconComponent = ICON_MAP[normalized] || ICON_MAP[iconName?.toLowerCase()] || Layers;
  
  let iconColor = '#0284c7';
  if (isDirectActive) iconColor = '#ffffff';
  else if (isActive) iconColor = '#0284c7';

  return (
    <span className="menu-icon-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent 
        size={15} 
        color={iconColor} 
        style={{ 
          flexShrink: 0,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }} 
      />
    </span>
  );
};

// Fallback default menu tree matching exact screenshot layout
const DEFAULT_MENU_TREE = [
  {
    id: 'menu-dash',
    title: 'DASHBOARD',
    menuKey: 'RCS_DASHBOARD',
    routePath: '/dashboard',
    icon: 'Gauge',
    sortOrder: 1,
    isActive: true,
    subMenus: []
  },
  /*
  // --- TEMPORARILY COMMENTED OUT - CAN BE RE-ENABLED LATER ---
  {
    id: 'menu-smsbox',
    title: 'SMS BOX',
    menuKey: 'SMS_BOX',
    routePath: '/sms-box',
    icon: 'Send',
    sortOrder: 2,
    isActive: true,
    subMenus: [
      { id: 'sub-sms-quick', parentId: 'menu-smsbox', title: 'Quick SMS Sender', menuKey: 'VOICE_SINGLE_CALL', routePath: '/voice/single', icon: 'Send', sortOrder: 1, isActive: true },
      { id: 'sub-sms-bulk', parentId: 'menu-smsbox', title: 'Bulk SMS Campaign', menuKey: 'VOICE_BULK_OBD', routePath: '/voice/bulk', icon: 'Layers', sortOrder: 2, isActive: true },
      { id: 'sub-sms-tpl', parentId: 'menu-smsbox', title: 'SMS DLT Templates', menuKey: 'RCS_TEMPLATES', routePath: '/rcs/templates', icon: 'FileCode', sortOrder: 3, isActive: true }
    ]
  },
  {
    id: 'menu-clicker',
    title: 'CLICKER',
    menuKey: 'CLICKER',
    routePath: '/clicker',
    icon: 'MousePointer',
    sortOrder: 3,
    isActive: true,
    subMenus: [
      { id: 'sub-click-short', parentId: 'menu-clicker', title: 'Smart URL Shortener', menuKey: 'CLICKER_SHORTENER', routePath: '/clicker/shortener', icon: 'Globe', sortOrder: 1, isActive: true },
      { id: 'sub-click-track', parentId: 'menu-clicker', title: 'Click Stream Tracking', menuKey: 'CLICKER_ANALYTICS', routePath: '/clicker/analytics', icon: 'BarChart3', sortOrder: 2, isActive: true }
    ]
  },
  // -------------------------------------------------------------
  */
  {
    id: 'menu-rcs',
    title: 'RCS',
    menuKey: 'RCS_SUITE',
    routePath: '/rcs',
    icon: 'MessageSquare',
    sortOrder: 2,
    isActive: true,
    subMenus: [
      /*
      // --- COMMENTED OUT: NOT IN SCREENSHOT ---
      { id: 'sub-rcs-dash', parentId: 'menu-rcs', title: 'Dashboard', menuKey: 'RCS_DASHBOARD', routePath: '/dashboard', icon: 'Gauge', sortOrder: 1, isActive: true },
      */
      { id: 'sub-rcs-bots', parentId: 'menu-rcs', title: 'Manage Bots / Bot ID', menuKey: 'RCS_BOTS', routePath: '/rcs/bots', icon: 'Bot', sortOrder: 1, isActive: true },
      { id: 'sub-rcs-tpl', parentId: 'menu-rcs', title: 'RCS Templates', menuKey: 'RCS_TEMPLATES', routePath: '/rcs/templates', icon: 'FileCode', sortOrder: 2, isActive: true },
      { id: 'sub-rcs-create', parentId: 'menu-rcs', title: 'Create Campaign', menuKey: 'RCS_CAMPAIGNS', routePath: '/rcs/campaign', icon: 'PlusCircle', sortOrder: 3, isActive: true },
      { id: 'sub-rcs-multi', parentId: 'menu-rcs', title: 'Multi Schedule Campaign', menuKey: 'RCS_MULTI_SCHEDULE', routePath: '/rcs/multi-schedule', icon: 'Calendar', sortOrder: 4, isActive: true },
      { id: 'sub-rcs-chat', parentId: 'menu-rcs', title: 'Live RCS Chat', menuKey: 'RCS_CHAT', routePath: '/rcs/chat', icon: 'MessageSquare', sortOrder: 5, isActive: true }
      /*
      // --- COMMENTED OUT: NOT IN SCREENSHOT ---
      { id: 'sub-rcs-rep', parentId: 'menu-rcs', title: 'Campaign Report', menuKey: 'RCS_REPORTS', routePath: '/rcs/reports', icon: 'BarChart3', sortOrder: 6, isActive: true },
      { id: 'sub-rcs-mis', parentId: 'menu-rcs', title: 'MIS Report', menuKey: 'RCS_MIS_REPORT', routePath: '/rcs-mis', icon: 'PieChart', sortOrder: 7, isActive: true },
      { id: 'sub-rcs-cons', parentId: 'menu-rcs', title: 'Consolidate Report', menuKey: 'RCS_CONSOLIDATE_REPORT', routePath: '/rcs/consolidate-report', icon: 'Database', sortOrder: 9, isActive: true },
      { id: 'sub-rcs-doc', parentId: 'menu-rcs', title: 'API Documentation', menuKey: 'RCS_API_DOC', routePath: '/rcs/api-doc', icon: 'BookOpen', sortOrder: 10, isActive: true }
      */
    ]
  },
  {
    id: 'menu-telco',
    title: 'DIRECT TELCO GATEWAY',
    menuKey: 'TELCO_GATEWAY',
    routePath: '/gateway',
    icon: 'Zap',
    sortOrder: 3,
    isActive: true,
    badgeText: 'TELCO SMPP',
    badgeColor: '#16a34a',
    subMenus: [
      { id: 'sub-telco-smpp', parentId: 'menu-telco', title: 'Direct Telco SMPP Routing', menuKey: 'SMPP_ROUTING', routePath: '/smpp-gateways', icon: 'Network', sortOrder: 1, isActive: true },
      { id: 'sub-telco-bypass', parentId: 'menu-telco', title: 'Gateway & Bypass Policies', menuKey: 'GATEWAY_SETTINGS', routePath: '/gateway-settings', icon: 'Sliders', sortOrder: 2, isActive: true },
      { id: 'sub-telco-dlt', parentId: 'menu-telco', title: 'DLT Sender ID (PE ID) Allocation', menuKey: 'SENDER_ID_ALLOCATION', routePath: '/sender-id-allocation', icon: 'Hash', sortOrder: 3, isActive: true }
    ]
  },
  {
    id: 'menu-reports',
    title: 'REPORTS',
    menuKey: 'REPORTS_SUITE',
    routePath: '/reports',
    icon: 'TrendingUp',
    sortOrder: 4,
    isActive: true,
    subMenus: [
      { id: 'sub-rep-delivery', parentId: 'menu-reports', title: 'Delivery Report', menuKey: 'RCS_REPORTS', routePath: '/rcs/reports', icon: 'CheckCircle2', sortOrder: 1, isActive: true },
      { id: 'sub-rep-sched', parentId: 'menu-reports', title: 'Scheduled SMS & RCS', menuKey: 'RCS_MULTI_SCHEDULE', routePath: '/rcs/multi-schedule', icon: 'Calendar', sortOrder: 2, isActive: true },
      { id: 'sub-rep-mis', parentId: 'menu-reports', title: 'MIS Report', menuKey: 'RCS_MIS_REPORT', routePath: '/rcs-mis', icon: 'PieChart', sortOrder: 3, isActive: true },
      { id: 'sub-rep-cons', parentId: 'menu-reports', title: 'Consolidate Report', menuKey: 'RCS_CONSOLIDATE_REPORT', routePath: '/rcs/consolidate-report', icon: 'Database', sortOrder: 4, isActive: true },
      { id: 'sub-rep-cred', parentId: 'menu-reports', title: 'Credit History', menuKey: 'RCS_PAYMENT_MANAGE', routePath: '/payment-manage', icon: 'Wallet', sortOrder: 5, isActive: true }
    ]
  },
  {
    id: 'menu-manage',
    title: 'MANAGE',
    menuKey: 'MANAGE_ADMIN',
    routePath: '/manage',
    icon: 'Settings',
    sortOrder: 5,
    isActive: true,
    subMenus: [
      { id: 'sub-mng-leads', parentId: 'menu-manage', title: 'Leads CRM', menuKey: 'LEADS_CRM', routePath: '/leads', icon: 'Users', sortOrder: 1, isActive: true, badgeText: 'AI LEADS', badgeColor: '#0284c7' },
      { id: 'sub-mng-users', parentId: 'menu-manage', title: 'User Management', menuKey: 'USER_MANAGEMENT', routePath: '/user-management', icon: 'Users', sortOrder: 2, isActive: true },
      { id: 'sub-mng-pay', parentId: 'menu-manage', title: 'Payment & Credits', menuKey: 'RCS_PAYMENT_MANAGE', routePath: '/payment-manage', icon: 'Wallet', sortOrder: 3, isActive: true },
      { id: 'sub-mng-builder', parentId: 'menu-manage', title: 'Dynamic Menu & Submenu Management', menuKey: 'MENU_BUILDER', routePath: '/menu-builder', icon: 'Sliders', sortOrder: 4, isActive: true }
    ]
  },
  /*
  // --- COMMENTED OUT: RESELLER (NOT IN SCREENSHOT) ---
  {
    id: 'menu-reseller',
    title: 'RESELLER',
    menuKey: 'RESELLER_HUB',
    routePath: '/reseller',
    icon: 'Briefcase',
    sortOrder: 8,
    isActive: true,
    subMenus: [
      { id: 'sub-res-smpp', parentId: 'menu-reseller', title: 'Dedicated SMPP Gateway', menuKey: 'RESELLER_SMPP', routePath: '/reseller-smpp', icon: 'Server', sortOrder: 1, isActive: true },
      { id: 'sub-res-cname', parentId: 'menu-reseller', title: 'White Label Domain', menuKey: 'RESELLER_DOMAINS', routePath: '/reseller-domains', icon: 'Globe', sortOrder: 2, isActive: true },
      { id: 'sub-res-users', parentId: 'menu-reseller', title: 'Reseller Management', menuKey: 'USER_MANAGEMENT', routePath: '/user-management', icon: 'Users', sortOrder: 3, isActive: true }
    ]
  },
  // ---------------------------------------------------
  */
  {
    id: 'menu-http',
    title: 'HTTP API',
    menuKey: 'HTTP_API_DOCS',
    routePath: '/api-docs',
    icon: 'Code',
    sortOrder: 6,
    isActive: true,
    subMenus: [
      { id: 'sub-api-doc', parentId: 'menu-http', title: 'REST API Documentation', menuKey: 'RCS_API_DOC', routePath: '/rcs/api-doc', icon: 'BookOpen', sortOrder: 1, isActive: true }
    ]
  },
  /*
  // --- COMMENTED OUT: TWO FACTOR AUTHENTICATION (NOT IN SCREENSHOT) ---
  {
    id: 'menu-2fa',
    title: 'TWO FACTOR AUTHENTICATION',
    menuKey: 'TWO_FACTOR_AUTH',
    routePath: '/security/2fa',
    icon: 'Key',
    sortOrder: 10,
    isActive: true,
    subMenus: [
      { id: 'sub-sec-ip', parentId: 'menu-2fa', title: 'IP Security & Firewall', menuKey: 'IP_SECURITY', routePath: '/ip-whitelist', icon: 'ShieldCheck', sortOrder: 1, isActive: true },
      { id: 'sub-sec-otp', parentId: 'menu-2fa', title: 'Two Factor Authentication', menuKey: 'TWO_FACTOR_AUTH', routePath: '/security/2fa', icon: 'Key', sortOrder: 2, isActive: true }
    ]
  },
  // --- COMMENTED OUT: JSON API (NOT IN SCREENSHOT) ---
  {
    id: 'menu-json',
    title: 'JSON API',
    menuKey: 'JSON_API',
    routePath: '/json-api',
    icon: 'FileCode',
    sortOrder: 11,
    isActive: true,
    subMenus: [
      { id: 'sub-json-spec', parentId: 'menu-json', title: 'JSON Webhook & Payload API', menuKey: 'RCS_API_DOC', routePath: '/json-api', icon: 'FileCode', sortOrder: 1, isActive: true }
    ]
  },
  // --- COMMENTED OUT: UTILITIES (NOT IN SCREENSHOT) ---
  {
    id: 'menu-util',
    title: 'UTILITIES',
    menuKey: 'UTILITIES_HUB',
    routePath: '/utilities',
    icon: 'Wrench',
    sortOrder: 12,
    isActive: true,
    subMenus: [
      { id: 'sub-util-ping', parentId: 'menu-util', title: 'SMPP & IP Ping Diagnostics', menuKey: 'IP_SECURITY', routePath: '/utilities/ping', icon: 'Sliders', sortOrder: 1, isActive: true }
    ]
  },
  // ---------------------------------------------------
  */
  {
    id: 'menu-help',
    title: 'HELP DESK',
    menuKey: 'HELP_DESK',
    routePath: '/help',
    icon: 'HelpCircle',
    sortOrder: 7,
    isActive: true,
    subMenus: [
      { id: 'sub-help-support', parentId: 'menu-help', title: 'Support Tickets', menuKey: 'SUPPORT_TICKETS', routePath: '/support', icon: 'HelpCircle', sortOrder: 1, isActive: true }
    ]
  }
];

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const [menus, setMenus] = useState(DEFAULT_MENU_TREE);
  const [expandedMenus, setExpandedMenus] = useState({
    'menu-rcs': true
  });

  const companyTitle = branding?.companyName || 'SAAS';

  // Allowed menus matching exact dashboard layout
  const ALLOWED_PARENT_IDS = new Set([
    'menu-dash',
    'menu-rcs',
    'menu-telco',
    'menu-reports',
    'menu-manage',
    'menu-http',
    'menu-help'
  ]);

  const ALLOWED_RCS_SUB_KEYS = new Set([
    'RCS_BOTS',
    'RCS_TEMPLATES',
    'RCS_CAMPAIGNS',
    'RCS_MULTI_SCHEDULE',
    'RCS_CHAT'
  ]);

  // Fetch dynamic menus from Backend API
  const loadMenus = async () => {
    try {
      const res = await api.get('/DynamicMenus/tree');
      if (res.data?.success && Array.isArray(res.data.menus) && res.data.menus.length > 0) {
        const activeTree = res.data.menus
          .filter(m => m.isActive !== false && m.IsActive !== false && ALLOWED_PARENT_IDS.has(m.id || m.Id))
          .map(m => {
            let subs = (m.subMenus || m.SubMenus || []).filter(s => s.isActive !== false && s.IsActive !== false);
            if ((m.id || m.Id) === 'menu-rcs') {
              subs = subs.filter(s => ALLOWED_RCS_SUB_KEYS.has(s.menuKey || s.MenuKey));
            }
            return {
              ...m,
              subMenus: subs
            };
          });
        setMenus(activeTree);
      }
    } catch (err) {
      console.warn('Could not fetch dynamic menus, using default telecom tree:', err.message);
    }
  };

  useEffect(() => {
    loadMenus();

    const handleUpdate = () => {
      loadMenus();
    };

    window.addEventListener('lead_mgmt_menus_updated', handleUpdate);
    return () => {
      window.removeEventListener('lead_mgmt_menus_updated', handleUpdate);
    };
  }, []);

  // Automatically expand parent ONLY IF an actual dedicated sub-page is active (not on main Dashboard)
  useEffect(() => {
    if (activeTab === 'DASHBOARD' || activeTab === 'RCS_DASHBOARD') {
      return;
    }
    menus.forEach(parent => {
      const subs = (parent.subMenus || parent.SubMenus || []).filter(s => s.isActive !== false);
      const hasActiveChild = subs.some(s => s.menuKey === activeTab);
      if (hasActiveChild) {
        setExpandedMenus(prev => ({ ...prev, [parent.id]: true }));
      }
    });
  }, [activeTab, menus]);

  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleParentClick = (item) => {
    const subs = item.subMenus || item.SubMenus || [];
    if (subs.length > 0) {
      toggleExpand(item.id);
    } else {
      onSelectTab(item.menuKey);
    }
  };

  return (
    <>
      {/* Scoped Embedded Styles Harmonized with Header Gradient & 60fps Micro-Interactions */}
      <style>{`
        @keyframes menuWiggle {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.16) rotate(-8deg); }
          40% { transform: scale(1.18) rotate(7deg); }
          60% { transform: scale(1.14) rotate(-4deg); }
          80% { transform: scale(1.12) rotate(3deg); }
          100% { transform: scale(1.12) rotate(0deg); }
        }

        .telecom-sidebar-container {
          background-color: #f8fafc !important;
          border-right: 1px solid #e2e8f0 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          user-select: none;
        }

        .telecom-parent-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: #334155;
          background: transparent;
          border-bottom: 1px solid #f1f5f9;
          border-left: 5px solid transparent;
          transition: transform 0.22s cubic-bezier(0.34, 1.4, 0.64, 1), background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
          position: relative;
        }

        /* Wiggle & shift effect on parent menu hover */
        .telecom-parent-row:hover {
          background-color: #f0f9ff !important;
          color: #0284c7 !important;
          transform: translateX(4px);
        }

        .telecom-parent-row:hover .menu-icon-wrapper svg {
          animation: menuWiggle 0.42s ease-in-out;
          color: #0284c7 !important;
        }

        /* Direct active parent menu (Full banner blue gradient) */
        .telecom-parent-row.direct-active-parent-row {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
          color: #ffffff !important;
          border-left: 5px solid #0284c7 !important;
          font-weight: 800 !important;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
        }

        .telecom-parent-row.direct-active-parent-row .menu-icon-wrapper svg {
          color: #ffffff !important;
        }

        /* Child active parent menu (Soft blue highlight with vibrant blue indicator) */
        .telecom-parent-row.child-active-parent-row {
          background-color: #e0f2fe !important;
          color: #0284c7 !important;
          border-left: 5px solid #0284c7 !important;
          font-weight: 800 !important;
        }

        .telecom-parent-row.child-active-parent-row .menu-icon-wrapper svg {
          color: #0284c7 !important;
        }

        .telecom-submenu-box {
          background-color: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          padding: 2px 0 4px 0;
        }

        .telecom-sub-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 36px;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 500;
          color: #475569;
          background: transparent;
          border-left: 3px solid transparent;
          border-bottom: 1px solid rgba(241, 245, 249, 0.6);
          transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.18s ease, color 0.18s ease, padding 0.18s ease;
        }

        /* Exact interaction: slides forward on hover, and returns smoothly to original position on mouse leave */
        .telecom-sub-row:hover {
          background-color: #e0f2fe !important;
          color: #0284c7 !important;
          font-weight: 700 !important;
          transform: translateX(7px);
        }

        .telecom-sub-row:hover .menu-icon-wrapper svg {
          transform: scale(1.15);
          color: #0284c7 !important;
        }

        .telecom-sub-row.active-sub-row {
          background-color: #e0f2fe !important;
          color: #0284c7 !important;
          border-left: 4px solid #0284c7 !important;
          font-weight: 800 !important;
        }

        .telecom-sub-row.active-sub-row .menu-icon-wrapper svg {
          color: #0284c7 !important;
        }
      `}</style>

      <aside className="sidebar telecom-sidebar-container" style={{
        width: '265px',
        minWidth: '265px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        {/* Brand Header Harmonized with Header Blue Gradient */}
        <div className="sidebar-header" style={{
          padding: '16px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff'
        }}>
          {branding?.brandLogoUrl ? (
            <img 
              src={branding.brandLogoUrl} 
              alt={companyTitle} 
              style={{ width: 34, height: 34, borderRadius: '8px', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '16px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              flexShrink: 0
            }}>
              {companyTitle.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              lineHeight: 1.2
            }}>
              {companyTitle}
            </div>
            <div style={{ fontSize: '9.5px', color: '#0284c7', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Single Sign-On • SaaS
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Accordion List with Header Blue Color Theme */}
        <div className="sidebar-content" style={{
          padding: '0',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {menus.filter(m => m.isActive !== false).map((item) => {
            const subs = (item.subMenus || item.SubMenus || []).filter(s => s.isActive !== false);
            const hasChildren = subs.length > 0;
            const isExpanded = !!expandedMenus[item.id];
            
            const isDirectActive = activeTab === item.menuKey || (item.menuKey === 'RCS_DASHBOARD' && activeTab === 'DASHBOARD');
            const isChildActive = subs.some(s => s.menuKey === activeTab && activeTab !== 'DASHBOARD' && activeTab !== 'RCS_DASHBOARD');
            const isParentActive = isDirectActive || isChildActive;

            return (
              <div key={item.id}>
                {/* Parent Menu Item with Wiggle & Shift Micro-Interaction */}
                <div 
                  onClick={() => handleParentClick(item)}
                  className={`telecom-parent-row ${isDirectActive ? 'direct-active-parent-row' : (isChildActive ? 'child-active-parent-row' : '')}`}
                >
                  {getMenuIcon(item.icon, isParentActive, isDirectActive)}
                  
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </span>

                  {item.badgeText && (
                    <span style={{
                      fontSize: '8.5px',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: item.badgeColor ? `${item.badgeColor}15` : '#dcfce7',
                      color: item.badgeColor || '#16a34a',
                      border: `1px solid ${item.badgeColor || '#22c55e'}40`,
                      letterSpacing: '0.2px',
                      flexShrink: 0
                    }}>
                      {item.badgeText}
                    </span>
                  )}

                  {hasChildren && (
                    <span style={{ color: isDirectActive ? '#ffffff' : (isChildActive ? '#0284c7' : '#94a3b8'), display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {isExpanded ? <ChevronDown size={13} strokeWidth={2.5} /> : <ChevronRight size={13} strokeWidth={2.5} />}
                    </span>
                  )}
                </div>

                {/* Submenu Children Accordion with Slide-in & Smooth Return Animation */}
                {hasChildren && isExpanded && (
                  <div className="telecom-submenu-box">
                    {subs.map((sub) => {
                      const isSubActive = activeTab === sub.menuKey || (sub.menuKey === 'RCS_DASHBOARD' && activeTab === 'DASHBOARD');

                      return (
                        <div 
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTab(sub.menuKey);
                          }}
                          className={`telecom-sub-row ${isSubActive ? 'active-sub-row' : ''}`}
                        >
                          {getMenuIcon(sub.icon, isSubActive)}
                          
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sub.title}
                          </span>

                          {sub.badgeText && (
                            <span style={{
                              fontSize: '8.5px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: sub.badgeColor ? `${sub.badgeColor}15` : '#eff6ff',
                              color: sub.badgeColor || '#0284c7',
                              flexShrink: 0
                            }}>
                              {sub.badgeText}
                            </span>
                          )}

                          {isSubActive && (
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0284c7', flexShrink: 0 }}></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Profile & Sign Out matching Header Theme */}
        <div className="sidebar-footer" style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '10px' }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              flexShrink: 0
            }}>
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || user?.username || 'Abhishaarod'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#0284c7', fontWeight: 600 }}>
                Enterprise Administrator
              </div>
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-outline" 
            style={{ 
              width: '100%', 
              borderColor: '#fecaca', 
              color: '#dc2626', 
              background: '#ffffff', 
              fontWeight: 700, 
              fontSize: '11.5px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 6,
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: '1px solid #fecaca',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff';
            }}
            onClick={logout}
          >
            <LogOut size={13} color="#dc2626" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
