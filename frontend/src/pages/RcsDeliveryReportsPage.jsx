import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Eye, 
  PhoneCall, 
  AlertTriangle, 
  Layers, 
  ArrowUpRight, 
  Send,
  Calendar,
  Smartphone,
  CheckCheck,
  Clock,
  Filter,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const RcsDeliveryReportsPage = ({ onNavigateToCampaign }) => {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'logs'
  const [campaigns, setCampaigns] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBot, setSelectedBot] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [mobileSearch, setMobileSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState('ALL');
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalDispatched: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFallback: 0,
    totalFailed: 0
  });

  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      const d = formatDate(today);
      setFromDate(d);
      setToDate(d);
    } else if (preset === 'YESTERDAY') {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      const d = formatDate(y);
      setFromDate(d);
      setToDate(d);
    } else if (preset === '7DAYS') {
      const p = new Date();
      p.setDate(today.getDate() - 7);
      setFromDate(formatDate(p));
      setToDate(formatDate(today));
    } else if (preset === '30DAYS') {
      const p = new Date();
      p.setDate(today.getDate() - 30);
      setFromDate(formatDate(p));
      setToDate(formatDate(today));
    } else if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    }
  };

  useEffect(() => {
    fetchCampaignReports();
    fetchDeliveryLogs();
  }, [selectedBot]);

  const fetchCampaignReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedBot && selectedBot !== 'All') params.botName = selectedBot;

      const res = await api.get('/RCSApi/GetCampaignReports', { params });
      if (res.data?.response) {
        setCampaigns(res.data.response.campaigns || []);
        setSummaryStats({
          totalDispatched: res.data.response.overallDispatched || 0,
          totalDelivered: res.data.response.overallDelivered || 0,
          totalRead: res.data.response.overallRead || 0,
          totalFallback: res.data.response.overallFallback || 0,
          totalFailed: res.data.response.overallFailed || 0
        });
      }
    } catch (err) {
      console.error('Failed to load campaign reports', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryLogs = async (cId) => {
    try {
      const params = {};
      if (cId) params.campaignId = cId;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (mobileSearch) params.mobileNumber = mobileSearch;

      const res = await api.get('/RCSApi/GetDeliveryLogs', { params });
      if (res.data?.response?.logs) {
        setDeliveryLogs(res.data.response.logs);
      }
    } catch (err) {
      console.error('Failed to load delivery logs', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'campaigns') {
      fetchCampaignReports();
    } else {
      fetchDeliveryLogs();
    }
  };

  const handleViewCampaignLogs = (camp) => {
    setActiveTab('logs');
    setSearchQuery(camp.campaignName);
    fetchDeliveryLogs(camp.campaignId);
  };

  const exportCsv = () => {
    if (activeTab === 'campaigns') {
      const headers = ['Campaign ID', 'Campaign Name', 'Bot', 'Template', 'Total Sent', 'Delivered (RCS)', 'Read (Seen)', 'Fallback SMS', 'Failed', 'Date'];
      const rows = campaigns.map(c => [
        c.campaignId,
        `"${c.campaignName}"`,
        c.botName,
        c.templateName,
        c.totalMobiles,
        c.deliveredRcs,
        c.readRcs,
        c.fallbackSms,
        c.failed,
        c.createdAt
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rcs_campaign_reports_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Log ID', 'Campaign ID', 'Campaign Name', 'Mobile Number', 'Bot', 'Status', 'Carrier', 'Latency', 'Reason', 'Delivered At'];
      const rows = deliveryLogs.map(l => [
        l.logId,
        l.campaignId,
        `"${l.campaignName}"`,
        l.mobileNumber,
        l.botName,
        l.status,
        l.carrier,
        l.latency,
        `"${l.reason}"`,
        l.deliveredAt
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rcs_delivery_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deliveryPercent = summaryStats.totalDispatched > 0 
    ? Math.round((summaryStats.totalDelivered / summaryStats.totalDispatched) * 100) 
    : 0;
  const readPercent = summaryStats.totalDelivered > 0 
    ? Math.round((summaryStats.totalRead / summaryStats.totalDelivered) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>RCS Delivery & DLR Reports</h2>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>Live Handset Tracking</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 3 }}>
            Real-time delivery status, handset read receipts (seen), carrier latencies, and DLT SMS fallback analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="btn btn-outline"
            onClick={() => { fetchCampaignReports(); fetchDeliveryLogs(); }}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn btn-outline"
            onClick={exportCsv}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderColor: '#cbd5e1' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {onNavigateToCampaign && (
            <button 
              className="btn btn-primary"
              onClick={onNavigateToCampaign}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={14} />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP METRIC CARDS (REAL RCS DELIVERY METRICS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        
        {/* Total Sent */}
        <div className="card" style={{ padding: '16px', background: '#ffffff', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Total Dispatched
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            {summaryStats.totalDispatched.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={12} color="#4f46e5" />
            <span>Across all RCS campaigns</span>
          </div>
        </div>

        {/* Delivered RCS */}
        <div className="card" style={{ padding: '16px', background: '#ffffff', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Delivered (RCS)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
            {summaryStats.totalDelivered.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCheck size={14} />
            <span>{deliveryPercent}% Successful Delivery Rate</span>
          </div>
        </div>

        {/* Read / Seen */}
        <div className="card" style={{ padding: '16px', background: '#ffffff', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Read / Seen (Recipients)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>
            {summaryStats.totalRead.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={13} />
            <span>{readPercent}% Read / Engagement Rate</span>
          </div>
        </div>

        {/* Fallback to SMS */}
        <div className="card" style={{ padding: '16px', background: '#ffffff', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            SMS Fallback Delivered
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
            {summaryStats.totalFallback.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#b45309', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageSquare size={12} />
            <span>Offline handset fallback</span>
          </div>
        </div>

        {/* Failed */}
        <div className="card" style={{ padding: '16px', background: '#ffffff', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            Failed / Undelivered
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
            {summaryStats.totalFailed.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} />
            <span>Invalid / Absent subscribers</span>
          </div>
        </div>

      </div>

      {/* TABS SWITCHER (CAMPAIGNS SUMMARY VS NUMBER-LEVEL DLR) */}
      <div className="card">
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              type="button"
              className={`btn btn-sm ${activeTab === 'campaigns' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('campaigns')}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <BarChart3 size={14} />
              <span>Campaign-Level Summary ({campaigns.length})</span>
            </button>

            <button 
              type="button"
              className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setActiveTab('logs'); fetchDeliveryLogs(); }}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Smartphone size={14} />
              <span>Handset-Level DLR Logs ({deliveryLogs.length})</span>
            </button>
          </div>

          {/* Filter Inputs */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Date Range Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Calendar size={13} color="#4f46e5" />
              <input 
                type="date" 
                className="form-input" 
                style={{ fontSize: '11px', padding: '3px 6px', width: '115px' }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setDatePreset('CUSTOM'); }}
                title="From Date"
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>to</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ fontSize: '11px', padding: '3px 6px', width: '115px' }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setDatePreset('CUSTOM'); }}
                title="To Date"
              />
              {/* Quick Pills */}
              <div style={{ display: 'flex', gap: 3 }}>
                {['TODAY', '7DAYS', 'ALL'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm ${datePreset === p ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                    onClick={() => handleDatePreset(p)}
                  >
                    {p === 'TODAY' ? 'Today' : p === '7DAYS' ? '7D' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'campaigns' ? (
              <>
                {/* Bot Filter */}
                <select 
                  className="form-select"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                >
                  <option value="All">All Bots</option>
                  <option value="Marketing Bot">Marketing Bot</option>
                  <option value="Support Bot">Support Bot</option>
                </select>

                {/* Search Campaign */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6 }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Search campaign name..."
                      style={{ fontSize: '12px', padding: '6px 10px 6px 28px', width: '180px' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 8, top: 10 }} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>
                    Filter
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Status Filter for DLR */}
                <select 
                  className="form-select"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); fetchDeliveryLogs(); }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Read">Read (Seen)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Fallback SMS">Fallback SMS</option>
                  <option value="Failed">Failed</option>
                </select>

                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6 }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Search mobile (9876...)"
                      style={{ fontSize: '12px', padding: '6px 10px 6px 28px', width: '200px' }}
                      value={mobileSearch}
                      onChange={(e) => setMobileSearch(e.target.value)}
                    />
                    <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 8, top: 10 }} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>
                    Search
                  </button>
                </form>
              </>
            )}
          </div>

        </div>

        {/* TAB 1: CAMPAIGNS SUMMARY TABLE */}
        {activeTab === 'campaigns' && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign ID & Name</th>
                  <th>Bot Sender</th>
                  <th>Template Used</th>
                  <th>Total Sent</th>
                  <th style={{ minWidth: '130px' }}>Delivered (RCS)</th>
                  <th style={{ minWidth: '130px' }}>Read (Seen)</th>
                  <th>SMS Fallback</th>
                  <th>Failed</th>
                  <th>Dispatched At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No campaign reports found matching filter.
                    </td>
                  </tr>
                ) : (
                  campaigns.map(camp => (
                    <tr key={camp.campaignId}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{camp.campaignName}</div>
                        <code style={{ fontSize: '11px', color: '#4f46e5' }}>#{camp.campaignId}</code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{camp.botName}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{camp.templateName}</div>
                        <span className="badge badge-cold" style={{ fontSize: '9px' }}>{camp.templateType}</span>
                      </td>
                      <td>
                        <b style={{ fontSize: '13px' }}>{camp.totalMobiles.toLocaleString()}</b>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ fontWeight: 700, color: '#16a34a' }}>{camp.deliveredRcs.toLocaleString()}</span>
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>{camp.deliveryRate}%</span>
                          </div>
                          {/* Progress Bar */}
                          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${camp.deliveryRate}%`, height: '100%', background: '#16a34a' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ fontWeight: 700, color: '#2563eb' }}>{camp.readRcs.toLocaleString()}</span>
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>{camp.readRate}%</span>
                          </div>
                          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${camp.readRate}%`, height: '100%', background: '#2563eb' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: camp.fallbackSms > 0 ? '#d97706' : '#94a3b8', fontSize: '12px' }}>
                          {camp.fallbackSms.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: camp.failed > 0 ? '#dc2626' : '#94a3b8', fontSize: '12px' }}>
                          {camp.failed}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {camp.createdAt}
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          ✓ {camp.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => handleViewCampaignLogs(camp)}
                          style={{ fontSize: '11px', padding: '4px 8px', color: '#4f46e5', borderColor: '#c7d2fe', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="View Handset DLR Logs"
                        >
                          <span>DLR Logs</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: GRANULAR HANDSET-LEVEL DLR LOGS TABLE */}
        {activeTab === 'logs' && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Mobile Number</th>
                  <th>Campaign Details</th>
                  <th>Bot Sender</th>
                  <th>Delivery Status</th>
                  <th>Telecom Carrier</th>
                  <th>Latency</th>
                  <th>Delivered At</th>
                  <th>Handset Gateway ACK / Reason</th>
                </tr>
              </thead>
              <tbody>
                {deliveryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No detailed DLR logs found matching filter.
                    </td>
                  </tr>
                ) : (
                  deliveryLogs.map(log => {
                    const isRead = log.status === 'Read';
                    const isDelivered = log.status === 'Delivered';
                    const isFallback = log.status === 'Fallback SMS';
                    const isFailed = log.status === 'Failed';

                    return (
                      <tr key={log.logId}>
                        <td>
                          <code style={{ fontSize: '11px', color: '#4f46e5' }}>{log.logId}</code>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            +91 {log.mobileNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.campaignName}</div>
                          <code style={{ fontSize: '10px', color: '#64748b' }}>#{log.campaignId}</code>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', fontWeight: 600 }}>{log.botName}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            isRead ? 'badge-primary' :
                            isDelivered ? 'badge-success' :
                            isFallback ? 'badge-warm' : 'badge-dnd'
                          }`} style={{ fontSize: '11px', fontWeight: 700 }}>
                            {isRead && <Eye size={12} style={{ marginRight: 4 }} />}
                            {isDelivered && <CheckCheck size={12} style={{ marginRight: 4 }} />}
                            {isFallback && <MessageSquare size={12} style={{ marginRight: 4 }} />}
                            {isFailed && <AlertTriangle size={12} style={{ marginRight: 4 }} />}
                            {log.status}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-cold" style={{ fontSize: '10px' }}>
                            {log.carrier}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {log.latency}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {log.deliveredAt}
                        </td>
                        <td>
                          <div style={{ fontSize: '11px', color: isFailed ? '#dc2626' : '#475569' }}>
                            {log.reason}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
