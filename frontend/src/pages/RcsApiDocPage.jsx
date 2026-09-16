import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Key, 
  Server, 
  Send, 
  FileText, 
  Bot, 
  PlusCircle, 
  MessageSquare, 
  Layers, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  X,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const RcsApiDocPage = () => {
  const apiKey = 'A58463AEB7AE41CD9901D23D18BC2482883';
  const baseUrl = 'https://omnidigital.co.in/api/RCSApi';

  const [copiedId, setCopiedId] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyDisplayState, setKeyDisplayState] = useState(null); // null, 'view', 'generated'

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header & PDF Download Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Home / <span style={{ color: '#0a66c2' }}>API Documentation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Code size={26} color="#0a66c2" />
              RCS API Documentation
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Complete developer reference and interactive payload playground for integrating RCS messaging.
            </p>
          </div>
        </div>

        {/* Offline Documentation Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)', 
          borderRadius: '14px', 
          padding: '18px 24px', 
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(10, 102, 194, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: '10px', 
              background: 'rgba(255,255,255,0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Download size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Offline Documentation Available</div>
              <div style={{ fontSize: '12.5px', opacity: 0.9 }}>
                Download the complete RCS API documentation in PDF format for offline access and sharing.
              </div>
            </div>
          </div>

          <a 
            href="https://omnidigital.co.in/Pdf/RCS_Api.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn" 
            style={{ 
              background: '#ffffff', 
              color: '#0a66c2', 
              fontWeight: 800, 
              fontSize: '13px', 
              padding: '10px 20px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none'
            }}
          >
            <Download size={15} />
            <span>Download PDF Guide</span>
          </a>
        </div>
      </div>

      {/* 2-Column Documentation View */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Sticky Navigation Menu */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '14px', 
          padding: '16px', 
          position: 'sticky', 
          top: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            Quick Navigation
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            {[
              { id: 'authentication', label: 'Authentication', icon: Key },
              { id: 'base-url', label: 'Base URL', icon: Server },
              { id: 'create-campaign', label: 'Create Campaign', icon: Send },
              { id: 'check-balance', label: 'Check Balance', icon: RefreshCw },
              { id: 'get-templates', label: 'Get Templates', icon: FileText },
              { id: 'get-bots', label: 'Get Bots', icon: Bot },
              { id: 'create-bot', label: 'Create Bot', icon: PlusCircle },
              { id: 'create-template', label: 'Create Template', icon: Layers },
              { id: 'send-chat-message', label: 'Send Chat Message', icon: MessageSquare },
              { id: 'webhook-payloads', label: 'Webhook Payloads', icon: ShieldCheck },
              { id: 'error-codes', label: 'Error Codes', icon: AlertTriangle }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    color: '#334155',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon size={14} color="#0a66c2" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Section 1: Authentication */}
          <div id="authentication" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Key size={20} color="#0a66c2" />
              Authentication
            </h2>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              All API requests require authentication using an API Key passed as a query parameter in every request.
            </p>

            {/* API Key Box */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '16px' 
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Your Live API Key</div>
                <div style={{ fontSize: '15px', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {apiKey}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => copyToClipboard(apiKey, 'apiKeyBox')}
                  style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedId === 'apiKeyBox' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  <span>{copiedId === 'apiKeyBox' ? 'Copied' : 'Copy Key'}</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowKeyModal(true)}
                  style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} />
                  <span>Manage Key</span>
                </button>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              How to Authenticate
            </div>
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#67e8f9', fontFamily: 'monospace', fontSize: '12.5px' }}>
              <span>{`https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=${apiKey}`}</span>
              <button 
                type="button" 
                onClick={() => copyToClipboard(`https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=${apiKey}`, 'authUrl')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {copiedId === 'authUrl' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span style={{ fontSize: '11px' }}>{copiedId === 'authUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Base URL */}
          <div id="base-url" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Server size={20} color="#0a66c2" />
              Base URL
            </h2>
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#67e8f9', fontFamily: 'monospace', fontSize: '13px' }}>
              <span>{baseUrl}</span>
              <button 
                type="button" 
                onClick={() => copyToClipboard(baseUrl, 'baseUrl')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {copiedId === 'baseUrl' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span style={{ fontSize: '11px' }}>{copiedId === 'baseUrl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Create Campaign */}
          <div id="create-campaign" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '8px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>/CreateCampaign</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Creates and submits a new RCS campaign with optional automated SMS fallback and custom webhook tracking parameters.
            </p>

            {/* Request Body Example */}
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Example JSON Request (With Fallback & Variables)
            </div>
            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', position: 'relative', marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={() => copyToClipboard(JSON.stringify({
                  TemplateId: "YCSLPB_vg",
                  CampaignName: "PBG_Account_Status",
                  MobileNumbers: ["9868040206", "9170304221"],
                  EnableFallback: false,
                  CustomParam1: "ORDER-12345"
                }, null, 2), 'createCampaignJson')}
                style={{ position: 'absolute', right: '12px', top: '12px', background: '#334155', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {copiedId === 'createCampaignJson' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === 'createCampaignJson' ? 'Copied' : 'Copy'}</span>
              </button>
              <pre style={{ margin: 0 }}>
{`{
  "TemplateId": "YCSLPB_vg",
  "CampaignName": "PBG_Account_Status",
  "MobileNumbers": [
    "9868040206",
    "9170304221"
  ],
  "EnableFallback": false,
  "CustomParam1": "ORDER-12345"
}`}
              </pre>
            </div>

            {/* Success Response */}
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Success Response (200 OK)
            </div>
            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#34d399', fontFamily: 'monospace', fontSize: '12px' }}>
              <pre style={{ margin: 0 }}>
{`{
  "Status": "OK",
  "Response": {
    "Message": "Campaign created successfully!",
    "CampaignId": 6320,
    "TotalMobiles": 2
  }
}`}
              </pre>
            </div>
          </div>

          {/* Section 4: Check Balance */}
          <div id="check-balance" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '8px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>GET</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>/CheckRcsBalance</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Retrieves current real-time RCS Promotional, Transactional, and Fallback SMS balances.
            </p>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#34d399', fontFamily: 'monospace', fontSize: '12px' }}>
              <pre style={{ margin: 0 }}>
{`{
  "Status": "OK",
  "Response": {
    "RcsBalance": 100,
    "RcsPromotionalBalance": 100,
    "RcsTransactionalBalance": 88.0,
    "SmsBalance": 100.0
  }
}`}
              </pre>
            </div>
          </div>

          {/* Section 5: Get Templates */}
          <div id="get-templates" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '8px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>GET</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>/GetTemplates?botId={'{botId}'}</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Returns all approved, pending, or rejected templates with complete suggestion button payloads and public media URLs.
            </p>
          </div>

          {/* Section 6: Send Chat Message */}
          <div id="send-chat-message" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '8px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>/SendChatMessage</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Sends a 1-to-1 plain text conversational reply to an engaged user without consuming template approvals.
            </p>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px' }}>
              <pre style={{ margin: 0 }}>
{`{
  "BotId": "3c4fa9a066274cd2",
  "MobileNo": "9868040206",
  "MessageText": "Thanks for reaching out! How can we assist you today?"
}`}
              </pre>
            </div>
          </div>

          {/* Section 7: Webhook Payloads */}
          <div id="webhook-payloads" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="#0a66c2" />
              Webhook Payloads
            </h2>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Real-time HTTP POST deliveries forward DLR events (DELIVERED, READ, SENT, FAILED, NONRCS) and user replies (REPLY, MEDIA, STOP) to your backend endpoint.
            </p>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px' }}>
              <pre style={{ margin: 0 }}>
{`{
  "campaignId": 6320,
  "botId": "3c4fa9a066274cd2",
  "entityType": "STATUS_EVENT",
  "event_type": "DELIVERED",
  "mobile": "9868040206",
  "status": "DELIVERED",
  "error_code": null,
  "timestamp": "2026-09-15T10:30:45.123Z"
}`}
              </pre>
            </div>
          </div>

        </div>

      </div>

      {/* API Key Management Modal (#apiKeyModal) */}
      {showKeyModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px' 
        }}>
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '520px', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                <Key size={18} color="#0a66c2" />
                <span>API Key Management</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowKeyModal(false); setKeyDisplayState(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: '10px', 
                padding: '12px 16px', 
                color: '#1d4ed8', 
                fontSize: '13px', 
                marginBottom: '20px',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Generating a new key will instantly invalidate any previous API credentials across active integrations.</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setKeyDisplayState('generated')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 700 }}
                >
                  <RefreshCw size={14} />
                  <span>Generate New Key</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setKeyDisplayState('view')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 600 }}
                >
                  <Eye size={14} />
                  <span>View Existing Key</span>
                </button>
              </div>

              {/* Key Display Area */}
              {keyDisplayState && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {keyDisplayState === 'generated' ? 'Newly Generated API Key' : 'Current Active API Key'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={apiKey} 
                      className="form-control" 
                      style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, background: '#ffffff', width: '100%' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => copyToClipboard(apiKey, 'modalApiKey')}
                      style={{ fontSize: '12px', padding: '8px 14px', flexShrink: 0 }}
                    >
                      {copiedId === 'modalApiKey' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                    Generated: 15-Sep-2026 10:45 AM • State: Active
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { setShowKeyModal(false); setKeyDisplayState(null); }}
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
