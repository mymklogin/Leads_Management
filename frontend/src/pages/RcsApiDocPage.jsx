import React, { useState, useMemo, useEffect } from 'react';
import {
  Key, Globe, Send, Wallet, FileText, Bot, PlusCircle, Code, MessageSquare,
  Bell, AlertTriangle, ShieldCheck, Check, Copy, ExternalLink, Search,
  Terminal, RefreshCw, Eye, Sparkles, PhoneCall, Sliders, Layers, Zap,
  Info, List, Download
} from 'lucide-react';
import './RcsApiDoc.css';
import {
  DEFAULT_API_KEY, BASE_URL, QUICK_NAV_ITEMS, AUTH_DOC,
  CREATE_CAMPAIGN_DOC, CHECK_BALANCE_DOC, GET_TEMPLATES_DOC,
  GET_BOTS_DOC, CREATE_BOT_DOC, CREATE_TEMPLATE_DOC,
  SEND_CHAT_MESSAGE_DOC, WEBHOOK_PAYLOADS_DOC, ERROR_CODES_DOC,
  BEST_PRACTICES, RATE_LIMITS, WORKFLOW_STEPS
} from '../data/rcsApiDocData';

// Reusable Code Block with Copy Feedback matching exact design
function CodeBlock({ code, language = 'json', title = null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? (
          <>
            <Check size={13} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span>Copy</span>
          </>
        )}
      </button>
      <pre>{code}</pre>
    </div>
  );
}

export function RcsApiDocPage() {
  const [activeApiKey, setActiveApiKey] = useState(DEFAULT_API_KEY);
  const [activeSection, setActiveSection] = useState('authentication');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tabs
  const [selectedCampaignTab, setSelectedCampaignTab] = useState('withoutFallback');
  const [selectedCampaignRespTab, setSelectedCampaignRespTab] = useState('success');
  const [selectedTplTab, setSelectedTplTab] = useState('plainText');
  const [selectedCurlTab, setSelectedCurlTab] = useState(0);
  const [selectedDlrTab, setSelectedDlrTab] = useState(0);
  const [selectedEngageTab, setSelectedEngageTab] = useState(0);
  const [errorCodeFilter, setErrorCodeFilter] = useState('ALL');
  const [botValidationSearch, setBotValidationSearch] = useState('');
  const [tplValidationSearch, setTplValidationSearch] = useState('');

  // Modals
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [modalKeyInput, setModalKeyInput] = useState(activeApiKey);
  const [testConsoleResult, setTestConsoleResult] = useState(null);
  const [testConsoleLoading, setTestConsoleLoading] = useState(false);

  // Smooth scroll handler with URL hash sync and scrollIntoView
  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  // Handle initial URL hash on mount or when hash changes in URL
  useEffect(() => {
    const handleScrollToHash = () => {
      const rawHash = window.location.hash ? window.location.hash.replace('#', '').toLowerCase().trim() : '';
      if (!rawHash) return;

      const matchingItem = QUICK_NAV_ITEMS.find(
        (item) => item.id.toLowerCase() === rawHash
      );
      const targetId = matchingItem ? matchingItem.id : rawHash;

      setActiveSection(targetId);

      let attempts = 0;
      const attemptScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 10) {
          attempts++;
          setTimeout(attemptScroll, 100);
        }
      };

      setTimeout(attemptScroll, 80);
    };

    handleScrollToHash();

    window.addEventListener('hashchange', handleScrollToHash);
    return () => window.removeEventListener('hashchange', handleScrollToHash);
  }, []);

  // Scrollspy to keep quick nav active indicator in sync
  useEffect(() => {
    const scrollContainer = document.querySelector('.content-area') || window;

    const handleScrollSpy = () => {
      if (scrollContainer !== window) {
        const atBottom =
          scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 30;
        if (atBottom) {
          setActiveSection(QUICK_NAV_ITEMS[QUICK_NAV_ITEMS.length - 1].id);
          return;
        }
      }

      let currentId = null;
      for (const item of QUICK_NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            currentId = item.id;
          }
        }
      }
      if (currentId) {
        setActiveSection(currentId);
      }
    };

    scrollContainer.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Live test API endpoint via backend
  const runLiveTest = async (endpoint) => {
    setTestConsoleLoading(true);
    setTestConsoleResult(null);
    try {
      const res = await fetch(`http://localhost:5108/api/RCSApi/${endpoint}?apiKey=${activeApiKey}`);
      const data = await res.json();
      setTestConsoleResult({ status: res.status, ok: res.ok, data });
    } catch (err) {
      setTestConsoleResult({ status: 500, ok: false, data: { error: err.message } });
    } finally {
      setTestConsoleLoading(false);
    }
  };

  // Filtered Error Codes
  const filteredErrorCodes = useMemo(() => {
    return ERROR_CODES_DOC.rows.filter(([status, msg, desc]) => {
      const matchesFilter =
        errorCodeFilter === 'ALL' || status.toUpperCase() === errorCodeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        status.toLowerCase().includes(q) ||
        msg.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [errorCodeFilter, searchQuery]);

  // Filtered Bot Validations
  const filteredBotValidations = useMemo(() => {
    if (!botValidationSearch) return CREATE_BOT_DOC.validationMessages;
    const q = botValidationSearch.toLowerCase();
    return CREATE_BOT_DOC.validationMessages.filter(
      ([f, m]) => f.toLowerCase().includes(q) || m.toLowerCase().includes(q)
    );
  }, [botValidationSearch]);

  // Filtered Template Validations
  const filteredTplValidations = useMemo(() => {
    if (!tplValidationSearch) return CREATE_TEMPLATE_DOC.validationMessages;
    const q = tplValidationSearch.toLowerCase();
    return CREATE_TEMPLATE_DOC.validationMessages.filter(
      ([f, m]) => f.toLowerCase().includes(q) || m.toLowerCase().includes(q)
    );
  }, [tplValidationSearch]);

  return (
    <div className="api-doc-container">
      {/* 7.2 Header */}
      <div className="api-header">
        <h1>
          <Code size={26} />
          <span>RCS API Documentation</span>
        </h1>
        <p>Complete reference for integrating RCS messaging into your applications</p>
      </div>

      {/* 7.3 PDF Download Banner */}
      <div className="api-pdf-banner">
        <div className="api-pdf-banner-inner">
          <div className="api-pdf-left">
            <div className="api-pdf-icon">
              <FileText size={30} />
            </div>
            <div className="api-pdf-text">
              <h3>
                <Download size={16} /> Offline Documentation Available
              </h3>
              <p>
                Download the complete RCS API documentation in PDF format for offline access, easy sharing with your team, and quick reference during development.
              </p>
            </div>
          </div>
          <div className="api-pdf-action">
            <a
              href="https://omnidigital.co.in/Pdf/RCS_Api.pdf"
              target="_blank"
              rel="noreferrer"
              className="pdf-download-btn"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download PDF
              </span>
              <small>(Complete Guide)</small>
            </a>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="api-doc-layout">
        {/* Left Column: Sticky Quick Navigation */}
        <div className="quick-nav">
          <h4>
            <List size={16} />
            <span>Quick Navigation</span>
          </h4>
          <ul>
            {QUICK_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeSection === item.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Documentation Content Cards */}
        <div className="api-doc-content">
          {/* 1. AUTHENTICATION & BASE URL */}
          <div id="authentication" className="section-card">
            <h2 className="section-title">
              <Key size={20} />
              <span>Authentication</span>
            </h2>
            <p>All API requests require authentication using an API Key passed as a query parameter.</p>

            <div className="info-box">
              <div className="info-box-left">
                <strong>
                  <Info size={16} /> Your API Key:
                </strong>
                <code>{activeApiKey}</code>
              </div>
              <button
                className="btn-manage-key"
                onClick={() => setShowApiKeyModal(true)}
              >
                <Key size={13} />
                <span>Manage Key</span>
              </button>
            </div>

            <h4>How to Authenticate</h4>
            <p>Include your API key in every request as a query parameter:</p>
            <CodeBlock
              code={`https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=${activeApiKey}`}
            />

            <h4>Base URL</h4>
            <CodeBlock code={BASE_URL} />
          </div>

          {/* 2. CREATE RCS CAMPAIGN */}
          <div id="create-campaign" className="section-card">
            <h2 className="section-title">
              <Send size={20} />
              <span>Create RCS Campaign</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-post">POST</span>
                <span className="endpoint-path">/CreateCampaign</span>
              </div>
              <p className="endpoint-description">{CREATE_CAMPAIGN_DOC.description}</p>
            </div>

            <h4>Request URL</h4>
            <CodeBlock code={CREATE_CAMPAIGN_DOC.requestUrl} />

            <h4>Request Headers</h4>
            <CodeBlock code="Content-Type: application/json" />

            <h4>Request Body Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_CAMPAIGN_DOC.parameters.map(([param, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{param}</td>
                    <td className="param-type">{type}</td>
                    <td>
                      <span className={
                        req.toLowerCase().includes('required') ? 'badge-req' :
                        req.toLowerCase().includes('conditional') ? 'badge-cond' : 'badge-opt'
                      }>
                        {req}
                      </span>
                    </td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Field Validations</h4>
            <ul style={{ margin: '8px 0 16px 20px', fontSize: '13px', color: '#475569' }}>
              {CREATE_CAMPAIGN_DOC.validations.map((v, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{v}</li>
              ))}
            </ul>

            <h4>Request Body Examples</h4>
            <div className="doc-tabs-bar">
              <button
                className={`doc-tab-btn ${selectedCampaignTab === 'withoutFallback' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignTab('withoutFallback')}
              >
                Without Fallback
              </button>
              <button
                className={`doc-tab-btn ${selectedCampaignTab === 'withFallback' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignTab('withFallback')}
              >
                With SMS Fallback
              </button>
              <button
                className={`doc-tab-btn ${selectedCampaignTab === 'withVariable' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignTab('withVariable')}
              >
                With Variables Option
              </button>
            </div>
            <CodeBlock code={CREATE_CAMPAIGN_DOC.examples[selectedCampaignTab]} />

            <h4>Responses</h4>
            <div className="doc-tabs-bar">
              <button
                className={`doc-tab-btn ${selectedCampaignRespTab === 'success' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignRespTab('success')}
              >
                200 Success
              </button>
              <button
                className={`doc-tab-btn ${selectedCampaignRespTab === 'warning' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignRespTab('warning')}
              >
                Warning (Insufficient)
              </button>
              <button
                className={`doc-tab-btn ${selectedCampaignRespTab === 'error' ? 'active' : ''}`}
                onClick={() => setSelectedCampaignRespTab('error')}
              >
                400 Error
              </button>
            </div>
            <CodeBlock code={CREATE_CAMPAIGN_DOC.responses[selectedCampaignRespTab]} />

            <h4>cURL Command</h4>
            <CodeBlock code={CREATE_CAMPAIGN_DOC.curl} />
          </div>

          {/* 3. CHECK RCS BALANCE */}
          <div id="check-balance" className="section-card">
            <h2 className="section-title">
              <Wallet size={20} />
              <span>Check RCS Balance</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-get">GET</span>
                <span className="endpoint-path">/CheckRcsBalance</span>
              </div>
              <p className="endpoint-description">{CHECK_BALANCE_DOC.description}</p>
            </div>

            <h4>Request URL</h4>
            <CodeBlock code={CHECK_BALANCE_DOC.requestUrl} />

            <h4>Success Response</h4>
            <CodeBlock code={CHECK_BALANCE_DOC.response} />

            <h4>cURL Command</h4>
            <CodeBlock code={CHECK_BALANCE_DOC.curl} />
          </div>

          {/* 4. GET RCS TEMPLATES */}
          <div id="get-templates" className="section-card">
            <h2 className="section-title">
              <FileText size={20} />
              <span>Get RCS Templates</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-get">GET</span>
                <span className="endpoint-path">/GetTemplates</span>
              </div>
              <p className="endpoint-description">{GET_TEMPLATES_DOC.description}</p>
            </div>

            <h4>Query Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {GET_TEMPLATES_DOC.queryParams.map(([param, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{param}</td>
                    <td className="param-type">{type}</td>
                    <td>
                      <span className={req.toLowerCase().includes('required') ? 'badge-req' : 'badge-opt'}>
                        {req}
                      </span>
                    </td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Example Requests</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', margin: '10px 0 16px' }}>
              {GET_TEMPLATES_DOC.exampleUrls.map((item, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#0284c7', wordBreak: 'break-all' }}>{item.url}</div>
                </div>
              ))}
            </div>

            <h4>Response Schema - Common Fields</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {GET_TEMPLATES_DOC.responseSchema.commonFields.map(([f, t, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Response Schema - RichCard Specific Fields</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {GET_TEMPLATES_DOC.responseSchema.richCardFields.map(([f, t, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Response Schema - Suggestion Object Fields</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {GET_TEMPLATES_DOC.responseSchema.suggestionFields.map(([f, t, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Template Types &amp; Status Values</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '10px 0 16px' }}>
              <div>
                <table className="params-table">
                  <thead>
                    <tr><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {GET_TEMPLATES_DOC.templateTypes.map(([type, desc], i) => (
                      <tr key={i}>
                        <td className="param-name">{type}</td>
                        <td>{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <table className="params-table">
                  <thead>
                    <tr><th>Status</th><th>Can Use in Campaign?</th></tr>
                  </thead>
                  <tbody>
                    {GET_TEMPLATES_DOC.templateStatuses.map(([status, desc, canUse], i) => (
                      <tr key={i}>
                        <td className="param-name">{status}</td>
                        <td>
                          <span className={canUse.includes('Yes') ? 'badge-req' : 'badge-opt'} style={{ background: canUse.includes('Yes') ? '#dcfce7' : '#fee2e2', color: canUse.includes('Yes') ? '#15803d' : '#dc2626' }}>
                            {canUse}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h4>Example Mixed Response (PlainText + RichCard + Carousel)</h4>
            <CodeBlock code={GET_TEMPLATES_DOC.mixedExampleResponse} />

            <h4>cURL Examples</h4>
            <div className="doc-tabs-bar">
              {GET_TEMPLATES_DOC.curlExamples.map((item, idx) => (
                <button
                  key={idx}
                  className={`doc-tab-btn ${selectedCurlTab === idx ? 'active' : ''}`}
                  onClick={() => setSelectedCurlTab(idx)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <CodeBlock code={GET_TEMPLATES_DOC.curlExamples[selectedCurlTab]?.cmd || ''} />
          </div>

          {/* 5. GET RCS BOTS */}
          <div id="get-bots" className="section-card">
            <h2 className="section-title">
              <Bot size={20} />
              <span>Get RCS Bots</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-get">GET</span>
                <span className="endpoint-path">/GetBots</span>
              </div>
              <p className="endpoint-description">{GET_BOTS_DOC.description}</p>
            </div>

            <h4>Request URL</h4>
            <CodeBlock code={GET_BOTS_DOC.requestUrl} />

            <h4>Success Response</h4>
            <CodeBlock code={GET_BOTS_DOC.response} />

            <h4>cURL Command</h4>
            <CodeBlock code={GET_BOTS_DOC.curl} />
          </div>

          {/* 6. CREATE RCS BOT */}
          <div id="create-bot" className="section-card">
            <h2 className="section-title">
              <PlusCircle size={20} />
              <span>Create RCS Bot</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-post">POST</span>
                <span className="endpoint-path">/CreateBot</span>
              </div>
              <p className="endpoint-description">{CREATE_BOT_DOC.description}</p>
            </div>

            <h4>Request URL</h4>
            <CodeBlock code={CREATE_BOT_DOC.requestUrl} />

            <h4>Request Headers</h4>
            <CodeBlock code="Content-Type: application/json" />

            <h4>Request Body Parameters (20 Fields)</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_BOT_DOC.parameters.map(([param, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{param}</td>
                    <td className="param-type">{type}</td>
                    <td>
                      <span className={req.toLowerCase().includes('required') ? 'badge-req' : 'badge-opt'}>
                        {req}
                      </span>
                    </td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>extra_details Object Fields</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_BOT_DOC.extraDetailsFields.map(([field, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{field}</td>
                    <td className="param-type">{type}</td>
                    <td>
                      <span className={req.toLowerCase().includes('required') ? 'badge-req' : 'badge-opt'}>
                        {req}
                      </span>
                    </td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Example Requests</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h5 style={{ margin: '8px 0', fontSize: '13px', fontWeight: '700' }}>Minimal Request</h5>
                <CodeBlock code={CREATE_BOT_DOC.minimalExample} />
              </div>
              <div>
                <h5 style={{ margin: '8px 0', fontSize: '13px', fontWeight: '700' }}>Full Request</h5>
                <CodeBlock code={CREATE_BOT_DOC.fullExample} />
              </div>
            </div>

            <h4>Success Response</h4>
            <CodeBlock code={CREATE_BOT_DOC.responses.success} />

            <div className="doc-filter-bar" style={{ marginTop: '20px' }}>
              <h4>All 25 Possible Validation Messages ({filteredBotValidations.length})</h4>
              <input
                type="text"
                className="doc-filter-input"
                placeholder="Search bot validation messages..."
                value={botValidationSearch}
                onChange={(e) => setBotValidationSearch(e.target.value)}
              />
            </div>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Validation Error Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredBotValidations.map(([field, msg], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{field}</td>
                    <td style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: '12.5px' }}>{msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>cURL Command</h4>
            <CodeBlock code={CREATE_BOT_DOC.curl} />
          </div>

          {/* 7. CREATE RCS TEMPLATE */}
          <div id="create-template" className="section-card">
            <h2 className="section-title">
              <Code size={20} />
              <span>Create RCS Template</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-post">POST</span>
                <span className="endpoint-path">/CreateTemplate</span>
              </div>
              <p className="endpoint-description">{CREATE_TEMPLATE_DOC.description}</p>
            </div>

            <h4>Common Request Body Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_TEMPLATE_DOC.commonParameters.map(([param, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{param}</td>
                    <td className="param-type">{type}</td>
                    <td>
                      <span className={req.toLowerCase().includes('required') ? 'badge-req' : 'badge-opt'}>
                        {req}
                      </span>
                    </td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>RichCard Object Fields (9 Fields)</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_TEMPLATE_DOC.richCardFields.map(([f, t, r, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td><span className="badge-opt">{r}</span></td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Carousel Card Object Fields (each item in Cards array)</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_TEMPLATE_DOC.carouselCardFields.map(([f, t, r, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td><span className="badge-opt">{r}</span></td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Suggestion Action Types</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Required Field</th>
                </tr>
              </thead>
              <tbody>
                {CREATE_TEMPLATE_DOC.suggestionTypes.map(([type, desc, reqField], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{type}</td>
                    <td>{desc}</td>
                    <td style={{ fontFamily: 'monospace', color: '#dc2626' }}>{reqField}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Template Creation Examples</h4>
            <div className="doc-tabs-bar">
              <button
                className={`doc-tab-btn ${selectedTplTab === 'plainText' ? 'active' : ''}`}
                onClick={() => setSelectedTplTab('plainText')}
              >
                PlainText Template
              </button>
              <button
                className={`doc-tab-btn ${selectedTplTab === 'richCardImage' ? 'active' : ''}`}
                onClick={() => setSelectedTplTab('richCardImage')}
              >
                RichCard (IMAGE)
              </button>
              <button
                className={`doc-tab-btn ${selectedTplTab === 'richCardVideo' ? 'active' : ''}`}
                onClick={() => setSelectedTplTab('richCardVideo')}
              >
                RichCard (VIDEO)
              </button>
              <button
                className={`doc-tab-btn ${selectedTplTab === 'carousel' ? 'active' : ''}`}
                onClick={() => setSelectedTplTab('carousel')}
              >
                Carousel Template
              </button>
            </div>
            <CodeBlock code={CREATE_TEMPLATE_DOC.examples[selectedTplTab]} />

            <div className="doc-filter-bar" style={{ marginTop: '20px' }}>
              <h4>All 27 Possible Validation Messages ({filteredTplValidations.length})</h4>
              <input
                type="text"
                className="doc-filter-input"
                placeholder="Search template validation messages..."
                value={tplValidationSearch}
                onChange={(e) => setTplValidationSearch(e.target.value)}
              />
            </div>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Validation Error Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredTplValidations.map(([field, msg], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{field}</td>
                    <td style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: '12.5px' }}>{msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 8. SEND CHAT MESSAGE */}
          <div id="send-chat-message" className="section-card">
            <h2 className="section-title">
              <MessageSquare size={20} />
              <span>Send Chat Message</span>
            </h2>

            <div className="endpoint-block">
              <div className="endpoint-header">
                <span className="http-method method-post">POST</span>
                <span className="endpoint-path">/SendChatMessage</span>
              </div>
              <p className="endpoint-description">{SEND_CHAT_MESSAGE_DOC.description}</p>
            </div>

            <h4>Request URL</h4>
            <CodeBlock code={SEND_CHAT_MESSAGE_DOC.requestUrl} />

            <h4>Request Body Parameters</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {SEND_CHAT_MESSAGE_DOC.bodyParams.map(([param, type, req, desc], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{param}</td>
                    <td className="param-type">{type}</td>
                    <td><span className="badge-req">{req}</span></td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Request Body Example</h4>
            <CodeBlock code={SEND_CHAT_MESSAGE_DOC.exampleBody} />

            <h4>Status &amp; Suppression Messages</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Message / Suppression Rule</th>
                </tr>
              </thead>
              <tbody>
                {SEND_CHAT_MESSAGE_DOC.statusMessagesTable.map(([st, msg], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{st}</td>
                    <td>{msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>cURL Command</h4>
            <CodeBlock code={SEND_CHAT_MESSAGE_DOC.curl} />
          </div>

          {/* 9. WEBHOOK PAYLOADS */}
          <div id="webhook-payloads" className="section-card">
            <h2 className="section-title">
              <Bell size={20} />
              <span>Webhook Payloads</span>
            </h2>
            <p>{WEBHOOK_PAYLOADS_DOC.description}</p>

            <h4>1. DLR (Delivery Report) Webhook Payloads</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {WEBHOOK_PAYLOADS_DOC.dlrFields.map(([f, t, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>DLR Payload Examples ({WEBHOOK_PAYLOADS_DOC.dlrExamples.length} Events)</h4>
            <div className="doc-tabs-bar">
              {WEBHOOK_PAYLOADS_DOC.dlrExamples.map((item, idx) => (
                <button
                  key={idx}
                  className={`doc-tab-btn ${selectedDlrTab === idx ? 'active' : ''}`}
                  onClick={() => setSelectedDlrTab(idx)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <CodeBlock code={WEBHOOK_PAYLOADS_DOC.dlrExamples[selectedDlrTab]?.payload || ''} />

            <h4>2. Engagement (User Response) Webhook Payloads</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {WEBHOOK_PAYLOADS_DOC.engagementFields.map(([f, t, d], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{f}</td>
                    <td className="param-type">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Engagement Examples (4 Types)</h4>
            <div className="doc-tabs-bar">
              {WEBHOOK_PAYLOADS_DOC.engagementExamples.map((item, idx) => (
                <button
                  key={idx}
                  className={`doc-tab-btn ${selectedEngageTab === idx ? 'active' : ''}`}
                  onClick={() => setSelectedEngageTab(idx)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <CodeBlock code={WEBHOOK_PAYLOADS_DOC.engagementExamples[selectedEngageTab]?.payload || ''} />

            <h4>3. All DLR Event Types &amp; SMS Fallback Trigger</h4>
            <table className="params-table">
              <thead>
                <tr>
                  <th>event_type</th>
                  <th>Description</th>
                  <th>Triggers SMS Fallback?</th>
                </tr>
              </thead>
              <tbody>
                {WEBHOOK_PAYLOADS_DOC.allDlrEventTypes.map(([evt, desc, fallback], idx) => (
                  <tr key={idx}>
                    <td className="param-name">{evt}</td>
                    <td>{desc}</td>
                    <td>
                      <span className={fallback.includes('Yes') ? 'badge-req' : 'badge-opt'} style={{ background: fallback.includes('Yes') ? '#dcfce7' : '#f1f5f9', color: fallback.includes('Yes') ? '#15803d' : '#64748b' }}>
                        {fallback}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 10. ERROR CODES & MESSAGES (ALL 44 CODES) */}
          <div id="error-codes" className="section-card">
            <h2 className="section-title">
              <AlertTriangle size={20} />
              <span>Error Codes &amp; Messages</span>
            </h2>
            <p>Complete dictionary of all 44 vendor response codes, statuses, and remediation steps.</p>

            <div className="doc-filter-bar">
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'OK', 'WARNING', 'ERROR'].map((filter) => (
                  <button
                    key={filter}
                    className={`doc-tab-btn ${errorCodeFilter === filter ? 'active' : ''}`}
                    onClick={() => setErrorCodeFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="doc-filter-input"
                placeholder="Search error codes or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <table className="params-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '35%' }}>Message</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredErrorCodes.map(([status, msg, desc], idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={status === 'OK' ? 'badge-req' : status === 'WARNING' ? 'badge-cond' : 'badge-req'} style={{ background: status === 'OK' ? '#dcfce7' : status === 'WARNING' ? '#fef3c7' : '#fee2e2', color: status === 'OK' ? '#15803d' : status === 'WARNING' ? '#d97706' : '#dc2626' }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{msg}</td>
                    <td style={{ color: '#475569' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BEST PRACTICES & RATE LIMITS */}
          <div id="best-practices" className="section-card">
            <h2 className="section-title">
              <ShieldCheck size={20} />
              <span>Best Practices &amp; Rate Limits</span>
            </h2>

            <h4>Best Practices</h4>
            <ul style={{ margin: '8px 0 16px 20px', fontSize: '13px', color: '#475569' }}>
              {BEST_PRACTICES.map((item, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
              ))}
            </ul>

            <h4>Rate Limits &amp; Constraints</h4>
            <ul style={{ margin: '8px 0 16px 20px', fontSize: '13px', color: '#475569' }}>
              {RATE_LIMITS.map((item, i) => (
                <li key={i} style={{ marginBottom: '6px', fontFamily: 'monospace' }}>{item}</li>
              ))}
            </ul>

            <h4>Recommended Integration Workflow</h4>
            <ol style={{ margin: '8px 0 16px 20px', fontSize: '13px', color: '#475569', lineHeight: '2' }}>
              {WORKFLOW_STEPS.map((s) => (
                <li key={s.step}>
                  <strong>{s.title}:</strong> {s.desc}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="doc-modal-overlay">
          <div className="doc-modal-content">
            <div className="doc-modal-header">
              <h3><Key size={18} color="#0284c7" /> API Key Management</h3>
              <button className="doc-modal-close" onClick={() => setShowApiKeyModal(false)}>✕</button>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <div style={{ background: '#f0f9ff', padding: '12px', border: '1px solid #bae6fd', borderRadius: '6px', marginBottom: '14px' }}>
                <Info size={14} style={{ display: 'inline', marginRight: '6px', color: '#0284c7' }} />
                <span>Generating a new key will replace your existing key in this session.</span>
              </div>
              <label style={{ fontWeight: '700', display: 'block', marginBottom: '6px' }}>Active API Key:</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={modalKeyInput}
                  onChange={(e) => setModalKeyInput(e.target.value)}
                  className="doc-filter-input"
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <button
                  className="btn-manage-key"
                  onClick={() => {
                    setActiveApiKey(modalKeyInput);
                    alert('API Key saved successfully!');
                  }}
                >
                  Save
                </button>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Quick Live Test against Backend:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="doc-tab-btn" onClick={() => runLiveTest('CheckRcsBalance')} disabled={testConsoleLoading}>
                    Test CheckBalance
                  </button>
                  <button className="doc-tab-btn" onClick={() => runLiveTest('GetBots')} disabled={testConsoleLoading}>
                    Test GetBots
                  </button>
                  <button className="doc-tab-btn" onClick={() => runLiveTest('GetTemplates')} disabled={testConsoleLoading}>
                    Test GetTemplates
                  </button>
                </div>
              </div>

              {testConsoleLoading && (
                <div style={{ padding: '14px', textAlign: 'center', color: '#0284c7', fontSize: '12px' }}>
                  Executing request to http://localhost:5108/api/RCSApi...
                </div>
              )}

              {testConsoleResult && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}>
                    <span>Status: {testConsoleResult.status}</span>
                    <span style={{ fontWeight: '700', color: testConsoleResult.ok ? '#15803d' : '#dc2626' }}>
                      {testConsoleResult.ok ? 'SUCCESS' : 'ERROR'}
                    </span>
                  </div>
                  <pre style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '10px', borderRadius: '6px', fontSize: '11px', maxHeight: '140px', overflowY: 'auto' }}>
                    {JSON.stringify(testConsoleResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="doc-tab-btn"
                onClick={() => setShowApiKeyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RcsApiDocPage;
