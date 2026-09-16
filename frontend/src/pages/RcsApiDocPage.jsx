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
  ExternalLink,
  List,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';

export const RcsApiDocPage = () => {
  const apiKey = 'A58463AEB7AE41CD9901D23D18BC2482883';
  const baseUrl = 'https://omnidigital.co.in/api/RCSApi';

  const [copiedId, setCopiedId] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyDisplayState, setKeyDisplayState] = useState(null);

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

  const renderCodeBlock = (codeText, id, lang = 'json') => (
    <div style={{ position: 'relative', marginTop: '10px', marginBottom: '16px' }}>
      <button 
        type="button" 
        onClick={() => copyToClipboard(codeText, id)}
        style={{ 
          position: 'absolute', 
          right: '12px', 
          top: '12px', 
          background: '#334155', 
          border: 'none', 
          color: '#ffffff', 
          borderRadius: '6px', 
          padding: '4px 10px', 
          fontSize: '11px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          zIndex: 2
        }}
      >
        {copiedId === id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
        <span>{copiedId === id ? 'Copied!' : 'Copy'}</span>
      </button>
      <pre style={{ 
        background: '#0f172a', 
        borderRadius: '10px', 
        padding: '16px', 
        color: '#e2e8f0', 
        fontFamily: 'monospace', 
        fontSize: '12px', 
        overflowX: 'auto',
        margin: 0,
        lineHeight: 1.5
      }}>
        {codeText}
      </pre>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header & PDF Download Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Home / <span style={{ color: '#0a66c2' }}>RCS API Documentation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Code size={26} color="#0a66c2" />
              RCS API Documentation
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              Complete reference for integrating RCS messaging, templates, bots, two-way chat, and webhook events into your applications.
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
            <span>Download PDF (Complete Guide)</span>
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
              { id: 'error-codes', label: 'Error Codes', icon: AlertTriangle },
              { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
              { id: 'rate-limits', label: 'Rate Limits & Constraints', icon: Clock },
              { id: 'integration-workflow', label: 'Integration Workflow', icon: Compass }
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

        {/* Right Content Stream (Complete documentation matching Documentation.html) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* SECTION 1: AUTHENTICATION */}
          <div id="authentication" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Key size={20} color="#0a66c2" />
              Authentication
            </h2>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              All API requests require authentication using an API Key passed as a query parameter.
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
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Your API Key</div>
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
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              Include your API key in every request as a query parameter:
            </p>
            {renderCodeBlock(`https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=${apiKey}`, 'authUrl', 'text')}
          </div>

          {/* SECTION 2: BASE URL */}
          <div id="base-url" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Server size={20} color="#0a66c2" />
              Base URL
            </h2>
            {renderCodeBlock(baseUrl, 'baseUrl', 'text')}
          </div>

          {/* SECTION 3: CREATE CAMPAIGN */}
          <div id="create-campaign" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Send size={20} color="#0a66c2" />
              Create RCS Campaign
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/CreateCampaign</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Creates and submits a new RCS campaign with optional SMS fallback.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Request URL</h4>
            {renderCodeBlock(`POST https://omnidigital.co.in/api/RCSApi/CreateCampaign?apiKey=${apiKey}`, 'createCampUrl', 'text')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Request Headers</h4>
            {renderCodeBlock(`Content-Type: application/json`, 'createCampHeader', 'text')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '16px 0 8px 0' }}>Request Body Parameters</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 12px' }}>Parameter</th>
                    <th style={{ padding: '8px 12px' }}>Type</th>
                    <th style={{ padding: '8px 12px' }}>Required</th>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['TemplateId', 'string', 'Required', 'RCS Template ID'],
                    ['CampaignName', 'string', 'Required', 'Campaign name (1-50 chars, alphanumeric + spaces, hyphens, underscores)'],
                    ['MobileNumbers', 'string[]', 'Required', 'Array of 10-digit mobile numbers (max 5000)'],
                    ['EnableFallback', 'boolean', 'Optional', 'Enable SMS fallback (default: false)'],
                    ['EntityId', 'string', 'Conditional', 'Required if EnableFallback is true'],
                    ['SenderId', 'string', 'Conditional', 'Required if EnableFallback is true'],
                    ['SmsTemplateId', 'string', 'Conditional', 'Required if EnableFallback is true'],
                    ['SmsText', 'string', 'Conditional', 'Required if EnableFallback is true'],
                    ['CustomParam1', 'string', 'Optional', 'Custom parameter (max 50 chars) echoed back in DLR webhook payload'],
                    ['CustomParam2', 'string', 'Optional', 'Custom parameter (max 50 chars) echoed back in DLR webhook payload'],
                    ['CustomParam3', 'string', 'Optional', 'Custom parameter (max 50 chars) echoed back in DLR webhook payload'],
                    ['CustomParam4', 'string', 'Optional', 'Custom parameter (max 50 chars) echoed back in DLR webhook payload']
                  ].map(([param, type, req, desc], idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#0a66c2' }}>{param}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{type}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ 
                          fontSize: '10.5px', 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          background: req === 'Required' ? '#fef2f2' : (req === 'Conditional' ? '#fffbeb' : '#f1f5f9'),
                          color: req === 'Required' ? '#dc2626' : (req === 'Conditional' ? '#d97706' : '#64748b')
                        }}>
                          {req}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#334155' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Field Validations Callout */}
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px', fontSize: '12.5px', color: '#92400e' }}>
              <div style={{ fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} color="#d97706" />
                <span>Field Validations</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                <li><b>TemplateId:</b> Must be a valid template ID string</li>
                <li><b>CampaignName:</b> Length 1-50 characters, Pattern: <code>^[A-Za-z0-9 _-]{`{1,50}`}$</code></li>
                <li><b>MobileNumbers:</b> Array of 10-digit strings. Maximum 5000 numbers per request.</li>
                <li><b>EntityId, SenderId, SmsTemplateId, SmsText:</b> Required when EnableFallback is true.</li>
                <li><b>CustomParam1 – CustomParam4:</b> Optional, max 200 chars each. Echoed in DLR webhooks for correlation.</li>
              </ul>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request (Without Fallback)</h4>
            {renderCodeBlock(JSON.stringify({
              TemplateId: "vendor_tpl_abc456",
              CampaignName: "Summer_Sale_2024",
              MobileNumbers: ["9876543210", "9123456789", "9988776655"],
              EnableFallback: false
            }, null, 2), 'campWithoutFb')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request (With Fallback)</h4>
            {renderCodeBlock(JSON.stringify({
              TemplateId: "vendor_tpl_abc456",
              CampaignName: "Welcome Campaign",
              MobileNumbers: ["9876543210", "9123456789"],
              EnableFallback: true,
              EntityId: "1234567890",
              SenderId: "SENDER",
              SmsTemplateId: "1234567890123456789",
              SmsText: "This is fallback SMS message",
              CustomParam1: "ORDER-12345",
              CustomParam2: "BATCH-A",
              CustomParam3: "promo",
              CustomParam4: "source_web"
            }, null, 2), 'campWithFb')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request (Customize With Variable Option)</h4>
            {renderCodeBlock(JSON.stringify({
              TemplateId: "vendor_tpl_abc456",
              CampaignName: "Summer_Sale_2024",
              MobileNumbers: [
                "9876543210,custom_param0,custom_param1,custom_param2",
                "9123456789,custom_param0,custom_param1,custom_param2",
                "9988776655,custom_param0,custom_param1,custom_param2"
              ],
              EnableFallback: false
            }, null, 2), 'campWithVars')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Message: "Campaign created successfully!",
                CampaignId: 45678,
                TotalMobiles: 2
              }
            }, null, 2), 'campSuccessResp')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Error Responses</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "WARNING",
              Response: {
                Message: "Insufficient RCS balance. Your balance: 100, required: 500"
              }
            }, null, 2), 'campErrResp')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>cURL Example</h4>
            {renderCodeBlock(`curl -X POST "https://omnidigital.co.in/api/RCSApi/CreateCampaign?apiKey=${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "TemplateId": "vendor_tpl_abc456",
    "CampaignName": "Test_Campaign",
    "MobileNumbers": ["9876543210", "9123456789"],
    "EnableFallback": false,
    "CustomParam1": "ORDER-12345"
  }'`, 'campCurl', 'bash')}
          </div>

          {/* SECTION 4: CHECK BALANCE */}
          <div id="check-balance" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={20} color="#0a66c2" />
              Check RCS Balance
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>GET</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/CheckRcsBalance</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Retrieves your current RCS promotional, transactional, and fallback SMS balances.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Request URL</h4>
            {renderCodeBlock(`GET https://omnidigital.co.in/api/RCSApi/CheckRcsBalance?apiKey=${apiKey}`, 'checkBalUrl', 'text')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                RcsBalance: 5000,
                SmsBalance: 10000
              }
            }, null, 2), 'balSuccessResp')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>cURL Example</h4>
            {renderCodeBlock(`curl -X GET "https://omnidigital.co.in/api/RCSApi/CheckRcsBalance?apiKey=${apiKey}"`, 'balCurl', 'bash')}
          </div>

          {/* SECTION 5: GET TEMPLATES */}
          <div id="get-templates" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="#0a66c2" />
              Get RCS Templates
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>GET</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/GetTemplates</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Retrieves the list of your RCS templates for a specific bot with optional filters. Returns the <b>complete template payload</b> (text, media URLs, suggestion buttons, carousel cards).
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Query Parameters</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 12px' }}>Parameter</th>
                    <th style={{ padding: '8px 12px' }}>Type</th>
                    <th style={{ padding: '8px 12px' }}>Required</th>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['apiKey', 'string', 'Required', 'Your API authentication key'],
                    ['botId', 'string', 'Required', 'Bot identifier (vendor-assigned Bot ID from GetBots)'],
                    ['templateName', 'string', 'Optional', 'Filter templates by name (case-insensitive partial match)'],
                    ['templateType', 'string', 'Optional', 'Filter by template type: PlainText, RichCard, or Carousel'],
                    ['status', 'string', 'Optional', 'Filter by template status: Active, Pending, or Rejected']
                  ].map(([param, type, req, desc], idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#0a66c2' }}>{param}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{type}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: req === 'Required' ? '#fef2f2' : '#f1f5f9', color: req === 'Required' ? '#dc2626' : '#64748b' }}>
                          {req}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#334155' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request</h4>
            {renderCodeBlock(`GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=${apiKey}&botId=3c4fa9a066274cd2&templateType=PlainText`, 'getTplReq', 'text')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Templates: [
                  {
                    BotId: "3c4fa9a066274cd2",
                    BotName: "PBG INFO",
                    TemplateName: "pbg_account_status_u",
                    TemplateType: "PlainText",
                    TemplateStatus: "Active",
                    TemplateId: "YCSLPB_vg",
                    LocalTemplateId: 10245,
                    CreatedDate: "2026-09-15 10:30",
                    PlainText: {
                      MessageText: "Dear User, your PBG account status has been updated.",
                      Suggestions: [
                        {
                          Label: "Login Portal",
                          Type: "OPEN_URL",
                          Url: "https://omnidigital.co.in"
                        },
                        {
                          Label: "Call Support",
                          Type: "DIAL",
                          PhoneNumber: "+919868040206"
                        }
                      ]
                    },
                    RichCard: null,
                    Carousel: null
                  }
                ],
                TotalCount: 1
              }
            }, null, 2), 'tplSuccessResp')}
          </div>

          {/* SECTION 6: GET BOTS */}
          <div id="get-bots" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={20} color="#0a66c2" />
              Get RCS Bots
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>GET</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/GetBots</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Retrieves list of all verified RCS bots registered under your account.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Bots: [
                  {
                    BotId: "3c4fa9a066274cd2",
                    BotName: "PBG INFO"
                  }
                ]
              }
            }, null, 2), 'botsSuccessResp')}
          </div>

          {/* SECTION 7: CREATE BOT (RESELLER ONLY) */}
          <div id="create-bot" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlusCircle size={20} color="#0a66c2" />
              Create RCS Bot
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/CreateBot</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Registers a new RCS Bot under your account. Provide publicly accessible URLs for logo, banner, GST certificate, and PAN certificate. Details are reviewed by admin and submitted to the carrier.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request (Minimal)</h4>
            {renderCodeBlock(JSON.stringify({
              name: "MyBrandBot",
              bot_type: "A2P",
              brandname: "MyBrand Pvt Ltd",
              desc: "Official RCS bot for notifications",
              number: ["9876543210"],
              plab: ["Main"],
              email: ["support@mybrand.com"],
              elab: ["Support"],
              message_type: "Transactional",
              logoimageurlrcs: "https://cdn.mybrand.com/logo.png",
              extra_details: {
                fullname: "Vijay Kumar",
                designation: "IT Manager",
                emailid: "vijay@mybrand.com",
                mobile: "9876543210"
              }
            }, null, 2), 'createBotReq')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Message: "RCS Bot created successfully! Admin will review and submit to vendor.",
                BotId: 1234
              }
            }, null, 2), 'createBotResp')}
          </div>

          {/* SECTION 8: CREATE TEMPLATE */}
          <div id="create-template" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={20} color="#0a66c2" />
              Create RCS Template
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/CreateTemplate</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Creates a new RCS template under a specific bot. Supports three template types: <b>PlainText</b>, <b>RichCard</b>, and <b>Carousel</b>. Media files are provided as publicly accessible URLs.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request — PlainText</h4>
            {renderCodeBlock(JSON.stringify({
              TemplateType: "PlainText",
              BotId: "3c4fa9a066274cd2",
              TemplateName: "Welcome_Msg",
              PlainText: {
                MessageText: "Hello! Welcome to our service. How can we help you today?"
              },
              Suggestions: [
                { Label: "Visit Website", Type: "OPEN_URL", Url: "https://www.mybrand.com" },
                { Label: "Call Support", Type: "DIAL", PhoneNumber: "+919876543210" },
                { Label: "Know More", Type: "REPLY", PostbackData: "know_more_clicked" }
              ]
            }, null, 2), 'createTplPlainReq')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Example Request — RichCard (IMAGE)</h4>
            {renderCodeBlock(JSON.stringify({
              TemplateType: "RichCard",
              BotId: "3c4fa9a066274cd2",
              TemplateName: "Product_Promo",
              RichCard: {
                Title: "Summer Sale 2026",
                Description: "Get up to 50% off on all products. Limited time offer!",
                MediaType: "IMAGE",
                MediaHeight: "MEDIUM",
                Orientation: "VERTICAL",
                ImageUrl: "https://cdn.mybrand.com/images/summer_sale.jpg"
              },
              Suggestions: [
                { Label: "Shop Now", Type: "OPEN_URL", Url: "https://shop.mybrand.com/sale" }
              ]
            }, null, 2), 'createTplRichReq')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Message: "Template created successfully!",
                TemplateId: "vendor_tpl_xyz789",
                TemplateName: "Welcome_Msg",
                TemplateType: "PlainText"
              }
            }, null, 2), 'createTplResp')}
          </div>

          {/* SECTION 9: SEND CHAT MESSAGE */}
          <div id="send-chat-message" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={20} color="#0a66c2" />
              Send Chat Message
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 800, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>POST</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>/SendChatMessage</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Sends a one-to-one conversational reply to a user who has already engaged with your bot. Does not consume a template.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Request Body</h4>
            {renderCodeBlock(JSON.stringify({
              BotId: "3c4fa9a066274cd2",
              MobileNo: "9868040206",
              MessageText: "Thanks for reaching out! How can we assist you today?"
            }, null, 2), 'chatMsgReq')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Success Response</h4>
            {renderCodeBlock(JSON.stringify({
              Status: "OK",
              Response: {
                Message: "Message sent successfully.",
                ChatMessageId: 10245,
                VendorMessageId: "msg_9f2c81",
                Status: "SENT"
              }
            }, null, 2), 'chatMsgResp')}
          </div>

          {/* SECTION 10: WEBHOOK PAYLOADS */}
          <div id="webhook-payloads" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="#0a66c2" />
              Webhook Payloads
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              When you configure a <b>WebhookUrl</b> for your campaign, the system sends real-time POST requests (Content-Type: application/json) after each event is processed. Timeout: <b>30 seconds</b>.
            </p>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '16px 0 6px 0' }}>1. DLR (Delivery Report) Payloads</h4>
            {renderCodeBlock(JSON.stringify({
              campaignId: 6320,
              botId: "3c4fa9a066274cd2",
              entityType: "STATUS_EVENT",
              event_type: "DELIVERED",
              mobile: "9868040206",
              status: "DELIVERED",
              error_code: null,
              error_message: null,
              timestamp: "2026-09-15T10:30:45.123Z"
            }, null, 2), 'dlrDeliveredWebhook')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '16px 0 6px 0' }}>2. Engagement (User Response) Payloads</h4>
            {renderCodeBlock(JSON.stringify({
              campaignId: 6320,
              botId: "3c4fa9a066274cd2",
              engagementType: "REPLY",
              mobile: "9868040206",
              response: "Yes, I am interested",
              timestamp: "2026-09-15T10:45:30.555Z"
            }, null, 2), 'engagementWebhook')}

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '18px 0 8px 0' }}>3. All DLR Event Types & SMS Fallback Trigger</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 12px' }}>event_type</th>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                    <th style={{ padding: '8px 12px' }}>Triggers SMS Fallback?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['DELIVERED', "Message delivered to user's device", '✗ No', '#dc2626'],
                    ['READ', 'Message opened/read by user', '✗ No', '#dc2626'],
                    ['SENT', 'Message sent to carrier gateway', '✗ No', '#dc2626'],
                    ['FAILED', 'Message delivery failed', '✓ Yes', '#059669'],
                    ['NONRCS', 'User handset does not support RCS messaging', '✓ Yes', '#059669'],
                    ['EXPIRED', 'TTL expired before delivery', '✓ Yes', '#059669'],
                    ['REJECTED', 'Message rejected by carrier firewall', '✓ Yes', '#059669'],
                    ['UNDELIVERED', 'Message could not be delivered', '✓ Yes', '#059669']
                  ].map(([ev, desc, fb, color], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#0a66c2' }}>{ev}</td>
                      <td style={{ padding: '8px 12px', color: '#334155' }}>{desc}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color }}>{fb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 11: ERROR CODES & MESSAGES */}
          <div id="error-codes" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#0a66c2" />
              Error Codes & Messages
            </h2>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                    <th style={{ padding: '8px 12px' }}>Message</th>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['OK', 'Success message', 'Request completed successfully', '#059669'],
                    ['WARNING', 'API Key is required!', 'API key parameter is missing', '#d97706'],
                    ['WARNING', 'Invalid API Key!', 'Provided API key is not authorized', '#dc2626'],
                    ['WARNING', 'Request body is empty!', 'POST request has empty JSON payload', '#d97706'],
                    ['WARNING', 'TemplateId is required!', 'Template ID is missing from request', '#d97706'],
                    ['WARNING', 'Invalid CampaignName!', 'Campaign name must be 1-50 alphanumeric chars', '#d97706'],
                    ['WARNING', 'Maximum 5000 mobile numbers allowed!', 'MobileNumbers array exceeds 5000 entries limit', '#d97706'],
                    ['WARNING', 'Insufficient RCS balance. Your balance: X, required: Y', 'Not enough wallet balance to execute campaign', '#dc2626'],
                    ['WARNING', 'botId is required!', 'GetTemplates called without botId parameter', '#d97706'],
                    ['ERROR', 'An error occurred while processing the request', 'Internal server error or gateway timeout', '#dc2626']
                  ].map(([status, msg, desc, color], idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontWeight: 800, color }}>{status}</span>
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>{msg}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 12: BEST PRACTICES */}
          <div id="best-practices" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} color="#059669" />
              Best Practices
            </h2>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 2, fontSize: '13px', color: '#334155' }}>
              <li><b>Secure your API Key:</b> Never expose your API key in client-side code or public git repositories.</li>
              <li><b>Get Bot IDs first:</b> Call <code>GetBots</code> endpoint to retrieve available bot IDs before requesting templates.</li>
              <li><b>Use vendor template IDs:</b> The <code>TemplateId</code> in <code>GetTemplates</code> response is the vendor-assigned ID for campaign dispatch.</li>
              <li><b>Validate mobile numbers:</b> Ensure all numbers are valid 10 digits before dispatching.</li>
              <li><b>Check balance regularly:</b> Use <code>CheckRcsBalance</code> endpoint before creating high-volume campaigns.</li>
              <li><b>Enable fallback wisely:</b> Use SMS fallback for time-critical transactional notifications.</li>
              <li><b>Test with small batches:</b> Start with 2-5 test numbers before scaling up to 5000 recipients.</li>
              <li><b>Check template status:</b> Only templates with <code>Active</code> status can be used in campaigns.</li>
            </ul>
          </div>

          {/* SECTION 13: RATE LIMITS & CONSTRAINTS */}
          <div id="rate-limits" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} color="#0a66c2" />
              Rate Limits & Constraints
            </h2>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#334155' }}>
              <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.8 }}>
                <li><b>Maximum mobile numbers per request:</b> 5000 recipients per campaign submission.</li>
                <li><b>Campaign name length:</b> 1-50 characters (alphanumeric, spaces, hyphens, underscores).</li>
                <li><b>Mobile number format:</b> Exactly 10 digits (Indian mobile numbers without +91 prefix).</li>
                <li><b>Webhook timeout:</b> 30 seconds HTTP POST response acknowledgment.</li>
              </ul>
            </div>
          </div>

          {/* SECTION 14: INTEGRATION WORKFLOW */}
          <div id="integration-workflow" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Compass size={20} color="#0a66c2" />
              Recommended Integration Workflow
            </h2>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 2, fontSize: '13px', color: '#334155' }}>
              <li><b>Get Your Bots:</b> Call <code>GET /GetBots</code> to retrieve all available bot IDs.</li>
              <li><b>Create Template (Optional):</b> Call <code>POST /CreateTemplate</code> to register templates with media URLs and suggestion buttons.</li>
              <li><b>Get Templates:</b> Call <code>GET /GetTemplates?botId={'{botId}'}</code> to see available templates.</li>
              <li><b>Check Balance:</b> Call <code>GET /CheckRcsBalance</code> to verify credits.</li>
              <li><b>Create Campaign:</b> Call <code>POST /CreateCampaign</code> with template ID and mobile numbers.</li>
              <li><b>Listen to Webhooks:</b> Receive real-time DLR delivery receipts and user replies.</li>
            </ol>
          </div>

        </div>

      </div>

      {/* Global API Key Modal (#apiKeyModal) */}
      {showKeyModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 99999, 
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
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
                <span>Generating a new key will replace your existing key if one exists.</span>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setKeyDisplayState('generated')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 700 }}
                >
                  <Key size={14} />
                  <span>Generate New Key</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setKeyDisplayState('view')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '10px 18px', fontWeight: 600 }}
                >
                  <span>View Existing Key</span>
                </button>
              </div>

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
