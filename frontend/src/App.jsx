import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsCrmPage } from './pages/LeadsCrmPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { VoiceObdPage } from './pages/VoiceObdPage';
import { BulkObdPage } from './pages/BulkObdPage';
import { TemplateReportPage } from './pages/TemplateReportPage';
import { RcsOverviewBalancePage } from './pages/RcsOverviewBalancePage';
import { RcsCampaignPage } from './pages/RcsCampaignPage';
import { RcsTemplatesPage } from './pages/RcsTemplatesPage';
import { RcsBotsPage } from './pages/RcsBotsPage';
import { RcsDeliveryReportsPage } from './pages/RcsDeliveryReportsPage';
import { RcsDlrExportPage } from './pages/RcsDlrExportPage';
import { RcsMultiSchedulePage } from './pages/RcsMultiSchedulePage';
import { RcsMisReportPage } from './pages/RcsMisReportPage';
import { RcsChatPage } from './pages/RcsChatPage';
import { RcsConsolidateReportPage } from './pages/RcsConsolidateReportPage';
import { RcsApiDocPage } from './pages/RcsApiDocPage';
import { LiveWebhookLogsPage } from './pages/LiveWebhookLogsPage';
import { ServicePlaceholderPage } from './pages/ServicePlaceholderPage';
import { MenuManagementPage } from './pages/MenuManagementPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', margin: '20px' }}>
          <h3 style={{ color: '#991b1b', fontWeight: 800, margin: '0 0 8px 0' }}>⚠️ Section Render Recovery</h3>
          <p style={{ color: '#7f1d1d', fontSize: '13px', margin: '0 0 12px 0' }}>
            {this.state.error?.message || 'A transient display error occurred.'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainApp = () => {
  const { isAuthenticated, loading, allowedMenus } = useAuth();
  const [activeTab, setActiveTab] = useState('RCS_DASHBOARD');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        Initializing Enterprise Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
      case 'REPORTS_OVERVIEW':
      case 'REPORTS':
        return <DashboardPage onNavigateToLeads={() => setActiveTab('LEADS_ALL')} />;

      // 1. Single OBD Call Reports & Dialer
      case 'VOICE':
      case 'VOICE_OBD':
      case 'VOICE_SINGLE_CALL':
        return <VoiceObdPage />;

      // 2. Bulk OBD Call Reports & Batch Engine
      case 'VOICE_BULK_OBD':
        return <BulkObdPage />;

      // 3. Template-Specific Reports (Templates 0 to 9)
      case 'VOICE_T0_REPORT':
        return (
          <TemplateReportPage 
            templateId={0} 
            title="T0: Simple Audio Broadcast"
            description="High-volume promotional broadcast with duration engagement brackets (<5s Dropped, 5-10s, 15-30s, >45s Super Hot Lead)"
            badgeColor="badge-cold"
          />
        );

      case 'VOICE_T1_REPORT':
        return (
          <TemplateReportPage 
            templateId={1} 
            title="T1: DTMF Key Press Campaign"
            description="Interactive IVR feedback with Key 1 conversion rules (>30s Super Hot Lead, Key 1 Interested Lead, >=25s Warm Lead)"
            badgeColor="badge-hot"
          />
        );

      case 'VOICE_T2_REPORT':
        return (
          <TemplateReportPage 
            templateId={2} 
            title="T2: Live Agent Call Patch"
            description="Instant agent connect (Key 1 -> Agent Group 8) with conversational talk-time tracking (>=60s High Intent Lead)"
            badgeColor="badge-warm"
          />
        );

      case 'VOICE_T3_REPORT':
        return (
          <TemplateReportPage 
            templateId={3} 
            title="T3: Custom Dynamic IVR"
            description="Dynamic IVR flow (ID 18) with multi-key engagement evaluation and state preservation"
            badgeColor="badge-dnd"
          />
        );

      case 'VOICE_T4_REPORT':
        return (
          <TemplateReportPage 
            templateId={4} 
            title="T4: Nextar Multi-Level IVR"
            description="Multi-Level Nested IVR (Menus: 1:241, 2:238, 3:240). Deep tree traversal evaluated on HANGUP"
            badgeColor="badge-hot"
          />
        );

      case 'VOICE_T5_REPORT':
        return (
          <TemplateReportPage 
            templateId={5} 
            title="T5: OTP Verification OBD"
            description="Automated Voice OTP dispatch with customer input verification evaluated on call completion"
            badgeColor="badge-warm"
          />
        );

      case 'VOICE_T7_REPORT':
        return (
          <TemplateReportPage 
            templateId={7} 
            title="T7: TTS Dynamic Voice IVR"
            description="Dynamic Text-To-Speech personalized audio synthesis with recipient variables and key responses"
            badgeColor="badge-dnd"
          />
        );

      case 'VOICE_T8_REPORT':
        return (
          <TemplateReportPage 
            templateId={8} 
            title="T8: TTS Key Press DTMF"
            description="Personalized TTS audio paired with interactive DTMF key response capture and database synchronization"
            badgeColor="badge-hot"
          />
        );

      case 'VOICE_T9_REPORT':
        return (
          <TemplateReportPage 
            templateId={9} 
            title="T9: TTS Live Agent Patch"
            description="Personalized TTS greeting with instant fallback to live agent conference patching (Group 8)"
            badgeColor="badge-warm"
          />
        );

      case 'VOICE_CALL_LOGS':
      case 'REPORTS_WEBHOOK_LOGS':
        return <LiveWebhookLogsPage />;

      // RCS Overview & Balance Ledger (Primary & Dedicated Management Page)
      case 'RCS':
      case 'RCS_MESSAGING':
      case 'RCS_DASHBOARD':
        return <RcsOverviewBalancePage />;

      // RCS Campaigns (Dedicated Campaign Engine)
      case 'RCS_CAMPAIGNS':
        return <RcsCampaignPage />;

      // RCS Manage Templates (Dedicated Table & Approval Ledger)
      case 'RCS_TEMPLATES':
      case 'RCS_TEMPLATES_MANAGE':
      case 'RCS_RICH_CARDS':
        return <RcsTemplatesPage />;

      // RCS Bots & Integrations Directory (PDF Pages 5-10 Spec)
      case 'RCS_BOTS':
        return (
          <RcsBotsPage 
            onNavigateToCampaign={() => setActiveTab('RCS_CAMPAIGNS')}
            onNavigateToAddTemplate={() => setActiveTab('RCS_TEMPLATES')}
          />
        );

      // RCS Multi Schedule Campaign
      case 'RCS_MULTI_SCHEDULE':
        return <RcsMultiSchedulePage />;

      // RCS Delivery Reports & Overall Campaign Analytics
      case 'RCS_REPORTS':
      case 'REPORTS':
      case 'REPORTS_OVERVIEW':
        return <RcsDeliveryReportsPage onNavigateToCampaign={() => setActiveTab('RCS_CAMPAIGNS')} />;

      // RCS Hourly MIS Matrix Report
      case 'RCS_MIS_REPORT':
        return <RcsMisReportPage />;

      // RCS 1-to-1 Live Chat
      case 'RCS_CHAT':
        return <RcsChatPage />;

      // RCS Consolidate Data Request & Audit Report
      case 'RCS_CONSOLIDATE_REPORT':
        return <RcsConsolidateReportPage />;

      // RCS Developer API Documentation
      case 'RCS_API_DOC':
        return <RcsApiDocPage />;

      // RCS DLR Export & Bulk Downloads (Protected Menu)
      case 'RCS_DLR_DOWNLOAD':
        return <RcsDlrExportPage onNavigateToReports={() => setActiveTab('RCS_REPORTS')} />;

      // Leads CRM
      case 'LEADS_CRM':
      case 'LEADS_ALL':
      case 'LEADS_HOT':
      case 'LEADS_EXPORT':
        return <LeadsCrmPage />;

      // User & Reseller Management
      case 'USER_MANAGEMENT':
      case 'USERS_LIST':
      case 'USERS_CREATE':
        return <UsersManagementPage />;

      // Dynamic Menu Management & Configuration
      case 'MENUS_MANAGE':
      case 'MENU_MANAGEMENT':
      case 'MANAGE_MENUS':
        return <MenuManagementPage />;

      // WhatsApp & SMS
      case 'WHATSAPP':
      case 'WHATSAPP_BROADCAST':
      case 'WHATSAPP_TEMPLATES':
      case 'WHATSAPP_REPORTS':
        return <ServicePlaceholderPage title="WhatsApp Business API" serviceCode="WhatsApp" />;

      case 'SMS':
      case 'SMS_GATEWAY':
      case 'SMS_QUICK_SEND':
      case 'SMS_BULK_SEND':
      case 'SMS_DLT_TEMPLATES':
        return <ServicePlaceholderPage title="SMS Gateway & DLT" serviceCode="SMS" />;

      default: {
        const flatMenus = allowedMenus ? allowedMenus.flatMap(m => [m, ...(m.subMenus || [])]) : [];
        const dynamicMenu = flatMenus.find(m => m.menuKey === activeTab);
        if (dynamicMenu) {
          return (
            <ServicePlaceholderPage 
              title={dynamicMenu.title} 
              serviceCode={dynamicMenu.serviceCode} 
            />
          );
        }
        return <DashboardPage onNavigateToLeads={() => setActiveTab('LEADS_ALL')} />;
      }
    }
  };

  const getActiveTitle = () => {
    switch (activeTab) {
      case 'DASHBOARD': return 'Dashboard Overview';
      case 'LEADS_CRM':
      case 'LEADS_ALL': return 'Leads CRM';
      case 'LEADS_HOT': return 'Super Hot Leads';
      case 'USER_MANAGEMENT':
      case 'USERS_LIST': return 'User & Reseller Management';
      case 'MENUS_MANAGE':
      case 'MENU_MANAGEMENT': return 'Dynamic Menu Management';
      case 'VOICE_SINGLE_CALL': return 'Single OBD Call Reports';
      case 'VOICE_BULK_OBD': return 'Bulk OBD Call Reports';
      case 'VOICE_T0_REPORT': return 'Template 0: Simple Campaign Reports';
      case 'VOICE_T1_REPORT': return 'Template 1: DTMF Campaign Reports';
      case 'VOICE_T2_REPORT': return 'Template 2: Call Patch Reports';
      case 'VOICE_T3_REPORT': return 'Template 3: Custom IVR Reports';
      case 'VOICE_T4_REPORT': return 'Template 4: Nextar Multi-Level IVR Reports';
      case 'VOICE_T5_REPORT': return 'Template 5: OTP Verification Reports';
      case 'VOICE_T7_REPORT': return 'Template 7: TTS Simple IVR Reports';
      case 'VOICE_T8_REPORT': return 'Template 8: TTS DTMF Campaign Reports';
      case 'VOICE_T9_REPORT': return 'Template 9: TTS Call Patch Reports';
      case 'VOICE_CALL_LOGS': return 'Voice Call Logs (Audit Feed)';
      case 'DASHBOARD':
      case 'RCS_DASHBOARD': return 'Dashboard';
      case 'RCS_TEMPLATES':
      case 'RCS_TEMPLATES_MANAGE': return 'Templates';
      case 'RCS_CAMPAIGNS': return 'Create Campaign';
      case 'RCS_MULTI_SCHEDULE': return 'Multi Schedule Campaign';
      case 'RCS_REPORTS':
      case 'REPORTS':
      case 'REPORTS_OVERVIEW': return 'Campaign Report';
      case 'RCS_MIS_REPORT': return 'MIS Report';
      case 'RCS_CHAT': return 'RCS Chat';
      case 'RCS_CONSOLIDATE_REPORT': return 'Consolidate Report';
      case 'RCS_API_DOC': return 'API Documentation';
      case 'RCS_BOTS': return 'RCS Verified Bots & Directory';
      case 'RCS_DLR_DOWNLOAD': return 'RCS DLR Export & Bulk Downloads';
      case 'RCS':
      case 'RCS_MESSAGING': return 'RCS Business Messaging';
      case 'WHATSAPP':
      case 'WHATSAPP_BROADCAST': return 'WhatsApp Messaging';
      case 'SMS':
      case 'SMS_GATEWAY': return 'SMS Gateway';
      default: {
        const flatMenus = allowedMenus ? allowedMenus.flatMap(m => [m, ...(m.subMenus || [])]) : [];
        const dynamicMenu = flatMenus.find(m => m.menuKey === activeTab);
        return dynamicMenu?.title || 'Management Console';
      }
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar (hidden on mobile via CSS) */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Mobile Slide-in Drawer */}
      <MobileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      <div className="main-wrapper">
        <Header 
          currentTitle={getActiveTitle()} 
          onOpenDrawer={() => setIsDrawerOpen(true)} 
        />
        <main className="content-area">
          <ErrorBoundary key={activeTab}>
            {renderActiveContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Native Mobile Bottom Navigation Bar (hidden on desktop via CSS) */}
      <BottomNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onOpenDrawer={() => setIsDrawerOpen(prev => !prev)} 
        isDrawerOpen={isDrawerOpen}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
