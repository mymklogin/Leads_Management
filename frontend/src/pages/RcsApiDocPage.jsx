import React, { useState, useMemo } from 'react';
import {
  Key, Globe, Send, Wallet, FileText, Bot, PlusCircle, Code, MessageSquare,
  Bell, AlertTriangle, ShieldCheck, Check, Copy, ExternalLink, Search,
  ChevronDown, ChevronRight, Terminal, RefreshCw, Eye, Sparkles, PhoneCall,
  Sliders, Layers, Zap, Info, HelpCircle
} from 'lucide-react';
import {
  DEFAULT_API_KEY, BASE_URL, QUICK_NAV_ITEMS, AUTH_DOC,
  CREATE_CAMPAIGN_DOC, CHECK_BALANCE_DOC, GET_TEMPLATES_DOC,
  GET_BOTS_DOC, CREATE_BOT_DOC, CREATE_TEMPLATE_DOC,
  SEND_CHAT_MESSAGE_DOC, WEBHOOK_PAYLOADS_DOC, ERROR_CODES_DOC,
  BEST_PRACTICES, RATE_LIMITS, WORKFLOW_STEPS
} from '../data/rcsApiDocData';

// Reusable Code Block with Copy Feedback
function CodeSnippet({ code, language = 'json', title = null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-slate-700/60 bg-slate-900/95 overflow-hidden shadow-lg">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            {title}
          </span>
          <span className="uppercase text-[10px] tracking-wider text-slate-500">{language}</span>
        </div>
      )}
      <div className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-96">
        <pre>{code}</pre>
      </div>
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
        }`}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

// Reusable Method Badge
function MethodBadge({ method }) {
  const isPost = method?.toUpperCase() === 'POST';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider ${
        isPost
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
      }`}
    >
      {method}
    </span>
  );
}

export function RcsApiDocPage() {
  const [activeApiKey, setActiveApiKey] = useState(DEFAULT_API_KEY);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [modalKeyInput, setModalKeyInput] = useState(activeApiKey);
  const [testConsoleResult, setTestConsoleResult] = useState(null);
  const [testConsoleLoading, setTestConsoleLoading] = useState(false);

  // Smooth scroll handler
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 text-white pt-8 pb-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OmniDigital RCS API Documentation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                RCS API Reference &amp; Developer Hub
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                Complete, official documentation for OmniDigital Rich Communication Services (RCS) Business Messaging.
                Integrate chatbots, rich media cards, carousels, SMS fallback, and real-time delivery webhooks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <Key className="w-4 h-4" />
                <span>API Key &amp; Live Test Console</span>
              </button>
              <button
                onClick={() => setShowCreditModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Apply for SMS Credit</span>
              </button>
            </div>
          </div>

          {/* Active Key & Base URL Pill Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Key className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] text-slate-400 font-medium">Active API Key</div>
                  <div className="font-mono text-xs text-indigo-300 truncate">{activeApiKey}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeApiKey);
                  alert('API Key copied to clipboard!');
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Copy API Key"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] text-slate-400 font-medium">Base URL</div>
                  <div className="font-mono text-xs text-emerald-300 truncate">{BASE_URL}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(BASE_URL);
                  alert('Base URL copied to clipboard!');
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Copy Base URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Quick Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 py-3 px-6 sm:px-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1">Quick Jump:</span>
            {QUICK_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/60 transition text-xs flex items-center gap-1.5"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] hidden lg:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-12">
        {/* 1. AUTHENTICATION & BASE URL */}
        <section id="authentication" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">API Key passed as a URL query parameter</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                All OmniDigital RCS API requests require authentication using an <strong>API Key</strong> passed as a query parameter (<code>?apiKey=...</code>).
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">How to Authenticate:</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Include your API key in every request as a query parameter:
                </div>
                <CodeSnippet
                  code={`https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=${activeApiKey}`}
                  language="http"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base URL:</div>
                <CodeSnippet code={BASE_URL} language="http" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. CREATE RCS CAMPAIGN */}
        <section id="create-campaign" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create RCS Campaign</h2>
                    <MethodBadge method="POST" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{CREATE_CAMPAIGN_DOC.description}</p>
                </div>
              </div>
              <button
                onClick={() => runLiveTest('CreateCampaign')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Test in Console</span>
              </button>
            </div>

            {/* Request URL & Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request URL</span>
                <CodeSnippet code={CREATE_CAMPAIGN_DOC.requestUrl} language="http" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Headers</span>
                <CodeSnippet code="Content-Type: application/json" language="http" />
              </div>
            </div>

            {/* Request Body Parameters Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Request Body Parameters</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Parameter</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Required</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {CREATE_CAMPAIGN_DOC.parameters.map(([param, type, req, desc], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{param}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              req.toLowerCase().includes('required')
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : req.toLowerCase().includes('conditional')
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {req}
                          </span>
                        </td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Field Validations */}
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Field Validations &amp; Constraints:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {CREATE_CAMPAIGN_DOC.validations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            {/* Request Examples Tabs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Request Body Examples</h3>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setSelectedCampaignTab('withoutFallback')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignTab === 'withoutFallback'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Without Fallback
                  </button>
                  <button
                    onClick={() => setSelectedCampaignTab('withFallback')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignTab === 'withFallback'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    With SMS Fallback
                  </button>
                  <button
                    onClick={() => setSelectedCampaignTab('withVariable')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignTab === 'withVariable'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    With Variables Option
                  </button>
                </div>
              </div>

              <CodeSnippet
                code={CREATE_CAMPAIGN_DOC.examples[selectedCampaignTab]}
                language="json"
                title={`Example Payload: ${selectedCampaignTab}`}
              />
            </div>

            {/* Response Examples Tabs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Responses</h3>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setSelectedCampaignRespTab('success')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignRespTab === 'success'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    200 Success
                  </button>
                  <button
                    onClick={() => setSelectedCampaignRespTab('warning')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignRespTab === 'warning'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    Warning (Insufficient)
                  </button>
                  <button
                    onClick={() => setSelectedCampaignRespTab('error')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedCampaignRespTab === 'error'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    400 Error
                  </button>
                </div>
              </div>
              <CodeSnippet
                code={CREATE_CAMPAIGN_DOC.responses[selectedCampaignRespTab]}
                language="json"
                title={`Response (${selectedCampaignRespTab.toUpperCase()})`}
              />
            </div>

            {/* cURL Example */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">cURL Command</h3>
              <CodeSnippet code={CREATE_CAMPAIGN_DOC.curl} language="bash" title="cURL: Create Campaign" />
            </div>
          </div>
        </section>

        {/* 3. CHECK RCS BALANCE */}
        <section id="check-balance" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check RCS Balance</h2>
                    <MethodBadge method="GET" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{CHECK_BALANCE_DOC.description}</p>
                </div>
              </div>
              <button
                onClick={() => runLiveTest('CheckRcsBalance')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Fetch Live Balance</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request URL</span>
                <CodeSnippet code={CHECK_BALANCE_DOC.requestUrl} language="http" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Response</span>
                <CodeSnippet code={CHECK_BALANCE_DOC.response} language="json" title="200 OK Response" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL Command</span>
                <CodeSnippet code={CHECK_BALANCE_DOC.curl} language="bash" title="cURL: Check Balance" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. GET RCS TEMPLATES */}
        <section id="get-templates" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Get RCS Templates</h2>
                    <MethodBadge method="GET" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{GET_TEMPLATES_DOC.description}</p>
                </div>
              </div>
              <button
                onClick={() => runLiveTest('GetTemplates')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Fetch Templates</span>
              </button>
            </div>

            {/* Query Parameters Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Query Parameters</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Parameter</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Required</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {GET_TEMPLATES_DOC.queryParams.map(([param, type, req, desc], i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">{param}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              req.toLowerCase().includes('required')
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {req}
                          </span>
                        </td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example URLs */}
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Example GET Requests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GET_TEMPLATES_DOC.exampleUrls.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{item.label}</div>
                    <div className="font-mono text-xs text-indigo-500 dark:text-indigo-300 break-all">{item.url}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Response Schema Fields */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Response Schema Fields</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-2">Common Fields (All Templates)</div>
                  <div className="space-y-1.5 text-xs">
                    {GET_TEMPLATES_DOC.responseSchema.commonFields.map(([f, t, d], i) => (
                      <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-1">
                        <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{f}</span>
                        <span className="text-slate-500 text-[11px] text-right">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-2">RichCard Specific Block</div>
                    <div className="space-y-1.5 text-xs">
                      {GET_TEMPLATES_DOC.responseSchema.richCardFields.slice(0, 6).map(([f, t, d], i) => (
                        <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-1">
                          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{f}</span>
                          <span className="text-slate-500 text-[11px] text-right">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-2">Suggestion Object Fields</div>
                    <div className="space-y-1.5 text-xs">
                      {GET_TEMPLATES_DOC.responseSchema.suggestionFields.map(([f, t, d], i) => (
                        <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-1">
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{f}</span>
                          <span className="text-slate-500 text-[11px] text-right">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Status & Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Template Types</div>
                <div className="space-y-2 text-xs">
                  {GET_TEMPLATES_DOC.templateTypes.map(([type, desc, useCase], i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                      <div className="font-mono font-bold text-indigo-500">{type}</div>
                      <div className="text-slate-600 dark:text-slate-300">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Template Status Values</div>
                <div className="space-y-2 text-xs">
                  {GET_TEMPLATES_DOC.templateStatuses.map(([status, desc, canUse], i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className={`font-mono font-bold ${status === 'Active' ? 'text-emerald-500' : status === 'Pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {status}
                        </span>
                        <div className="text-slate-500 text-[11px]">{desc}</div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${canUse.includes('Yes') ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                        {canUse}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mixed Response Example */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Example Mixed Response (PlainText + RichCard + Carousel)</h3>
              <CodeSnippet code={GET_TEMPLATES_DOC.mixedExampleResponse} language="json" title="200 OK Mixed Templates Response" />
            </div>

            {/* cURL Examples Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">cURL Examples</h3>
                <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  {GET_TEMPLATES_DOC.curlExamples.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCurlTab(idx)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                        selectedCurlTab === idx
                          ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <CodeSnippet
                code={GET_TEMPLATES_DOC.curlExamples[selectedCurlTab]?.cmd || ''}
                language="bash"
                title={`cURL: ${GET_TEMPLATES_DOC.curlExamples[selectedCurlTab]?.label}`}
              />
            </div>
          </div>
        </section>

        {/* 5. GET RCS BOTS */}
        <section id="get-bots" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Get RCS Bots</h2>
                    <MethodBadge method="GET" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{GET_BOTS_DOC.description}</p>
                </div>
              </div>
              <button
                onClick={() => runLiveTest('GetBots')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Fetch Bots</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request URL</span>
                <CodeSnippet code={GET_BOTS_DOC.requestUrl} language="http" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Response</span>
                <CodeSnippet code={GET_BOTS_DOC.response} language="json" title="200 OK Response" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL Command</span>
                <CodeSnippet code={GET_BOTS_DOC.curl} language="bash" title="cURL: Get Bots" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. CREATE RCS BOT */}
        <section id="create-bot" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create RCS Bot</h2>
                  <MethodBadge method="POST" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{CREATE_BOT_DOC.description}</p>
              </div>
            </div>

            {/* Request URL & Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request URL</span>
                <CodeSnippet code={CREATE_BOT_DOC.requestUrl} language="http" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Headers</span>
                <CodeSnippet code="Content-Type: application/json" language="http" />
              </div>
            </div>

            {/* Request Parameters Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Request Body Parameters (20 Fields)</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Parameter</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Required</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {CREATE_BOT_DOC.parameters.map(([param, type, req, desc], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">{param}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              req.toLowerCase().includes('required')
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {req}
                          </span>
                        </td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* extra_details Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">extra_details Object Fields</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Field</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Required</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {CREATE_BOT_DOC.extraDetailsFields.map(([field, type, req, desc], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{field}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${req.toLowerCase().includes('required') ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {req}
                          </span>
                        </td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Request Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Minimal Request</span>
                <CodeSnippet code={CREATE_BOT_DOC.minimalExample} language="json" title="Minimal Bot Registration" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Request</span>
                <CodeSnippet code={CREATE_BOT_DOC.fullExample} language="json" title="Full Bot Registration" />
              </div>
            </div>

            {/* Success Response */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Response</span>
              <CodeSnippet code={CREATE_BOT_DOC.responses.success} language="json" title="200 OK Response" />
            </div>

            {/* Searchable Validation Messages Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All 25 Possible Validation Messages ({filteredBotValidations.length} shown)
                </h3>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bot validations..."
                    value={botValidationSearch}
                    onChange={(e) => setBotValidationSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/3">Field</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Exact Validation Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {filteredBotValidations.map(([field, msg], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-semibold text-teal-600 dark:text-teal-400">{field}</td>
                        <td className="p-3 font-mono text-rose-600 dark:text-rose-400">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* cURL Command */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL Command</span>
              <CodeSnippet code={CREATE_BOT_DOC.curl} language="bash" title="cURL: Create Bot" />
            </div>
          </div>
        </section>

        {/* 7. CREATE RCS TEMPLATE */}
        <section id="create-template" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create RCS Template</h2>
                  <MethodBadge method="POST" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{CREATE_TEMPLATE_DOC.description}</p>
              </div>
            </div>

            {/* Common Parameters Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Common Request Body Parameters</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Parameter</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Required</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {CREATE_TEMPLATE_DOC.commonParameters.map(([param, type, req, desc], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{param}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${req.toLowerCase().includes('required') ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {req}
                          </span>
                        </td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schema Blocks for PlainText, RichCard, Carousel, Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">RichCard Object Fields (9 Fields)</div>
                <div className="space-y-1 text-xs">
                  {CREATE_TEMPLATE_DOC.richCardFields.map(([f, t, r, d], i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1">
                      <span className="font-mono font-semibold text-violet-500">{f}</span>
                      <span className="text-[11px] text-slate-500">{t} ({r})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Carousel Cards Array (2 to 10 Cards)</div>
                <div className="space-y-1 text-xs">
                  {CREATE_TEMPLATE_DOC.carouselCardFields.map(([f, t, r, d], i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1">
                      <span className="font-mono font-semibold text-indigo-500">{f}</span>
                      <span className="text-[11px] text-slate-500">{t} ({r})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestion Types Table */}
            <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Suggestion Action Types</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CREATE_TEMPLATE_DOC.suggestionTypes.map(([type, desc, reqField], i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div className="font-mono font-bold text-emerald-500 text-xs">{type}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">Requires: {reqField}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Request Examples */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Template Creation Payloads</h3>
                <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setSelectedTplTab('plainText')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedTplTab === 'plainText' ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    PlainText
                  </button>
                  <button
                    onClick={() => setSelectedTplTab('richCardImage')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedTplTab === 'richCardImage' ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    RichCard (Image)
                  </button>
                  <button
                    onClick={() => setSelectedTplTab('richCardVideo')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedTplTab === 'richCardVideo' ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    RichCard (Video)
                  </button>
                  <button
                    onClick={() => setSelectedTplTab('carousel')}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      selectedTplTab === 'carousel' ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Carousel (Multi-Card)
                  </button>
                </div>
              </div>
              <CodeSnippet
                code={CREATE_TEMPLATE_DOC.examples[selectedTplTab]}
                language="json"
                title={`Create Template: ${selectedTplTab}`}
              />
            </div>

            {/* Searchable Template Validation Messages Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All 27 Possible Validation Messages ({filteredTplValidations.length} shown)
                </h3>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search template validations..."
                    value={tplValidationSearch}
                    onChange={(e) => setTplValidationSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/3">Field</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Exact Validation Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {filteredTplValidations.map(([field, msg], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-semibold text-violet-600 dark:text-violet-400">{field}</td>
                        <td className="p-3 font-mono text-rose-600 dark:text-rose-400">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SEND CHAT MESSAGE (1-TO-1) */}
        <section id="send-chat-message" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send Chat Message (1-to-1)</h2>
                  <MethodBadge method="POST" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{SEND_CHAT_MESSAGE_DOC.description}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request URL</span>
                <CodeSnippet code={SEND_CHAT_MESSAGE_DOC.requestUrl} language="http" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Body</span>
                <CodeSnippet code={SEND_CHAT_MESSAGE_DOC.exampleBody} language="json" title="1-to-1 Chat Message Payload" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Response</span>
                <CodeSnippet code={SEND_CHAT_MESSAGE_DOC.responses.success} language="json" title="200 OK Response" />
              </div>

              {/* Status & Suppression Rules */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Status &amp; Suppression Codes</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700">Status</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-700">Message / Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      {SEND_CHAT_MESSAGE_DOC.statusMessagesTable.map(([st, msg], i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{st}</td>
                          <td className="p-3">{msg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL Command</span>
                <CodeSnippet code={SEND_CHAT_MESSAGE_DOC.curl} language="bash" title="cURL: Send Chat Message" />
              </div>
            </div>
          </div>
        </section>

        {/* 9. WEBHOOK PAYLOADS */}
        <section id="webhook-payloads" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Webhook Payloads</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{WEBHOOK_PAYLOADS_DOC.description}</p>
              </div>
            </div>

            {/* DLR Section */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Delivery Report (DLR) Payloads</h3>
              <p className="text-xs text-slate-500 mb-4">
                Received when a recipient's message delivery status changes (Delivered, Read, Failed, Expired, etc.).
              </p>

              {/* DLR Fields */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Field</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {WEBHOOK_PAYLOADS_DOC.dlrFields.map(([field, type, desc], i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{field}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DLR Examples Tabs (All 8 Examples) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    DLR Payload Examples ({WEBHOOK_PAYLOADS_DOC.dlrExamples.length} Events)
                  </span>
                  <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                    {WEBHOOK_PAYLOADS_DOC.dlrExamples.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDlrTab(idx)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                          selectedDlrTab === idx
                            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
                <CodeSnippet
                  code={WEBHOOK_PAYLOADS_DOC.dlrExamples[selectedDlrTab]?.payload || ''}
                  language="json"
                  title={`DLR Event: ${WEBHOOK_PAYLOADS_DOC.dlrExamples[selectedDlrTab]?.title}`}
                />
              </div>
            </div>

            {/* Engagement Section */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Engagement (User Response) Payloads</h3>
              <p className="text-xs text-slate-500 mb-4">
                Received when a recipient replies with text, clicks a suggestion button, or types STOP/START.
              </p>

              {/* Engagement Fields */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Field</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {WEBHOOK_PAYLOADS_DOC.engagementFields.map(([field, type, desc], i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{field}</td>
                        <td className="p-3 font-mono text-slate-500">{type}</td>
                        <td className="p-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Engagement Examples Tabs (All 4 Examples) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Engagement Examples (4 Types)
                  </span>
                  <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                    {WEBHOOK_PAYLOADS_DOC.engagementExamples.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEngageTab(idx)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                          selectedEngageTab === idx
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
                <CodeSnippet
                  code={WEBHOOK_PAYLOADS_DOC.engagementExamples[selectedEngageTab]?.payload || ''}
                  language="json"
                  title={`Engagement Event: ${WEBHOOK_PAYLOADS_DOC.engagementExamples[selectedEngageTab]?.title}`}
                />
              </div>
            </div>

            {/* All DLR Event Types Table (14 Types) */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                3. All DLR Event Types &amp; SMS Fallback Trigger
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">event_type</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Triggers SMS Fallback?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {WEBHOOK_PAYLOADS_DOC.allDlrEventTypes.map(([evt, desc, fallback], idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{evt}</td>
                        <td className="p-3">{desc}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              fallback.includes('Yes')
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {fallback}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 10. ERROR CODES & MESSAGES (ALL 44 CODES) */}
        <section id="error-codes" className="scroll-mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Error Codes &amp; Messages</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete reference dictionary of all 44 vendor responses &amp; exceptions
                  </p>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                {['ALL', 'OK', 'WARNING', 'ERROR'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setErrorCodeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      errorCodeFilter === filter
                        ? filter === 'OK'
                          ? 'bg-emerald-600 text-white shadow'
                          : filter === 'WARNING'
                          ? 'bg-amber-600 text-white shadow'
                          : filter === 'ERROR'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Codes Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold z-10">
                  <tr>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-28">Status</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-1/3">Message</th>
                    <th className="p-3 border-b border-slate-200 dark:border-slate-700">Description &amp; Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {filteredErrorCodes.map(([status, msg, desc], idx) => {
                    const isOk = status.toUpperCase() === 'OK';
                    const isWarn = status.toUpperCase() === 'WARNING';
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              isOk
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isWarn
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white break-words">{msg}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-[11px] text-slate-400">
              Showing {filteredErrorCodes.length} of {ERROR_CODES_DOC.rows.length} total error codes
            </div>
          </div>
        </section>

        {/* 11. BEST PRACTICES & RATE LIMITS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Best Practices</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {BEST_PRACTICES.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rate Limits &amp; Constraints</h2>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {RATE_LIMITS.map((item, i) => (
                <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 font-mono">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 12. RECOMMENDED INTEGRATION WORKFLOW */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Integration Workflow</h2>
              <p className="text-xs text-slate-500">Step-by-step developer implementation journey</p>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-6">
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.step} className="relative group">
                <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL 1: API KEY MANAGEMENT & LIVE TESTING CONSOLE */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">API Key Management</h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Generating a new key will replace your existing key in the session.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Active Vendor API Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalKeyInput}
                    onChange={(e) => setModalKeyInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      setActiveApiKey(modalKeyInput);
                      alert('API Key updated successfully!');
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Quick Live Tests */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Live Test against Backend:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runLiveTest('CheckRcsBalance')}
                    disabled={testConsoleLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
                  >
                    Test CheckBalance
                  </button>
                  <button
                    onClick={() => runLiveTest('GetBots')}
                    disabled={testConsoleLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
                  >
                    Test GetBots
                  </button>
                  <button
                    onClick={() => runLiveTest('GetTemplates')}
                    disabled={testConsoleLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
                  >
                    Test GetTemplates
                  </button>
                </div>
              </div>

              {/* Live result output */}
              {testConsoleLoading && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-indigo-500 animate-pulse">
                  Executing request to http://localhost:5108/api/RCSApi...
                </div>
              )}

              {testConsoleResult && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Response Status: {testConsoleResult.status}</span>
                    <span className={testConsoleResult.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {testConsoleResult.ok ? 'SUCCESS' : 'ERROR'}
                    </span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(testConsoleResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY FOR SMS CREDIT */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Apply for SMS / RCS Credit</h3>
              </div>
              <button
                onClick={() => setShowCreditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <p>To top up your promotional, transactional, or SMS fallback balance, please contact your dedicated account manager:</p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Vyom</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">Account Manager</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <a href="tel:9711557791" className="font-mono text-indigo-500 font-bold hover:underline">
                    9711557791
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <a href="mailto:vyom@nimbusitsolutions.com" className="font-mono text-indigo-500 hover:underline">
                    vyom@nimbusitsolutions.com
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="font-bold text-sm text-slate-900 dark:text-white">Technical Support</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Helpdesk Phone:</span>
                  <a href="tel:+919278780303" className="font-mono text-indigo-500 font-bold hover:underline">
                    +91-9278780303
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Portal:</span>
                  <a href="https://omnidigital.co.in" target="_blank" rel="noreferrer" className="text-indigo-500 flex items-center gap-1 hover:underline">
                    <span>omnidigital.co.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowCreditModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
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
