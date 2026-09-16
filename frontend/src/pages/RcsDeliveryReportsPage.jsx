import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Eye, 
  AlertTriangle, 
  ArrowLeft, 
  Send,
  Calendar,
  Smartphone,
  CheckCheck,
  Clock,
  Filter,
  XCircle,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';

export const RcsDeliveryReportsPage = ({ onNavigateToCampaign }) => {
  // View mode: 'list' or 'drilldown'
  const [viewMode, setViewMode] = useState('list');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Filters
  const [selectedBot, setSelectedBot] = useState('All Bots');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [findNumberModal, setFindNumberModal] = useState(false);
  const [searchNumber, setSearchNumber] = useState('');
  const [searchNumberResult, setSearchNumberResult] = useState(null);

  // Data lists
  const [campaigns, setCampaigns] = useState([
    {
      id: 6324,
      name: 'PBG_Account_Status',
      bot: 'PBG INFO',
      template: 'pbg_account_status_u',
      total: 1,
      type: 'PlainText',
      status: 'DELIVERED',
      postDateTime: '15-09-2026 14:10',
      dlrCount: 1,
      eventsCount: 0,
      dlrStats: { sent: 0, delivered: 100, read: 0, failed: 0, awaited: 0 },
      eventsStats: { clicks: 0, replies: 0 },
      dlrLogs: [
        { time: '15-09-2026 14:10:15', msisdn: '9868040206', status: 'DELIVERED', details: 'Delivered to handset via Google Jibe RCS Cloud' }
      ],
      eventsLogs: []
    },
    {
      id: 6320,
      name: 'PBG_Account_Status',
      bot: 'PBG INFO',
      template: 'pbg_account_status_u',
      total: 1,
      type: 'PlainText',
      status: 'DELIVERED',
      postDateTime: '15-09-2026 13:45',
      dlrCount: 1,
      eventsCount: 0,
      dlrStats: { sent: 0, delivered: 100, read: 0, failed: 0, awaited: 0 },
      eventsStats: { clicks: 0, replies: 0 },
      dlrLogs: [
        { time: '15-09-2026 13:45:22', msisdn: '9868040206', status: 'DELIVERED', details: 'Message received and displayed' }
      ],
      eventsLogs: []
    },
    {
      id: 6318,
      name: 'Festive_Offer_Launch',
      bot: 'PBG INFO',
      template: 'pbg_account_status_u',
      total: 10,
      type: 'PlainText',
      status: 'AWAITED',
      postDateTime: '15-09-2026 12:30',
      dlrCount: 10,
      eventsCount: 1,
      dlrStats: { sent: 10, delivered: 10, read: 0, failed: 10, awaited: 70 },
      eventsStats: { clicks: 10, replies: 0 },
      dlrLogs: [
        { time: '15-09-2026 12:30:10', msisdn: '9170304221', status: 'DELIVERED', details: 'Delivered successfully' },
        { time: '15-09-2026 12:30:12', msisdn: '7840095957', status: 'FAILED', details: '408 Delivery timeout' },
        { time: '15-09-2026 12:30:15', msisdn: '9868040206', status: 'AWAITED', details: 'Awaiting carrier acknowledgement' }
      ],
      eventsLogs: [
        { time: '15-09-2026 12:31:00', msisdn: '9170304221', type: 'CLICK', label: 'https://omnidigital.co.in' }
      ]
    }
  ]);

  // Overall KPI Metrics matching screenshot (12 SUBMITTED, 3 DELIVERED, 1 FAILED, 8 AWAITED)
  const metricCards = {
    submitted: 12,
    delivered: 3,
    failed: 1,
    awaited: 8
  };

  const handleOpenDrilldown = (camp) => {
    setSelectedCampaign(camp);
    setViewMode('drilldown');
  };

  const handleFindNumber = (e) => {
    e.preventDefault();
    if (!searchNumber.trim()) return;
    const found = [];
    campaigns.forEach(c => {
      const match = c.dlrLogs.find(l => l.msisdn.includes(searchNumber.trim()));
      if (match) {
        found.push({ ...match, campaignName: c.name, campaignId: c.id });
      }
    });
    setSearchNumberResult(found);
  };

  const downloadDlrCsv = (camp) => {
    let csv = `Campaign: ${camp.name} (#${camp.id})\nTIME,MSISDN,STATUS,DETAILS\n`;
    camp.dlrLogs.forEach(l => {
      csv += `"${l.time}","${l.msisdn}","${l.status}","${l.details}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DLR_Report_${camp.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Breadcrumb Header */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Home / <span style={{ color: '#0a66c2' }}>RCS Campaign Report</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={24} color="#0a66c2" />
              RCS Campaign Delivery Report
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time delivery receipts (DLR), carrier engagements, and click attribution analytics.
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setFindNumberModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 16px', fontWeight: 700 }}
          >
            <Search size={14} />
            <span>Find Number</span>
          </button>
        </div>
      </div>

      {/* Red Banner Notice (matching screenshot) */}
      <div style={{ 
        background: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: '10px', 
        padding: '12px 18px', 
        color: '#991b1b', 
        fontSize: '13px', 
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
        <span>
          <b>Report Availability:</b> Campaign reports are available for the last 90 days from today. Contact technical support if you need archival data beyond this retention period.
        </span>
      </div>

      {/* VIEW MODE 1: CAMPAIGN LIST */}
      {viewMode === 'list' && (
        <>
          {/* 4 Metric Cards Matching Screenshot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
            
            {/* SUBMITTED */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #0a66c2', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUBMITTED</span>
                <Send size={16} color="#0a66c2" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
                {metricCards.submitted}
              </div>
            </div>

            {/* DELIVERED */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DELIVERED</span>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>
                {metricCards.delivered}
              </div>
            </div>

            {/* FAILED */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FAILED</span>
                <XCircle size={16} color="#dc2626" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626' }}>
                {metricCards.failed}
              </div>
            </div>

            {/* AWAITED */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AWAITED</span>
                <Clock size={16} color="#d97706" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706' }}>
                {metricCards.awaited}
              </div>
            </div>

          </div>

          {/* Filter Bar */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '14px', 
            padding: '16px 20px', 
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>BOT:</span>
              <select 
                className="form-control"
                value={selectedBot}
                onChange={e => setSelectedBot(e.target.value)}
                style={{ fontSize: '12.5px', padding: '6px 12px', minWidth: '150px' }}
              >
                <option value="All Bots">All Bots</option>
                <option value="PBG INFO">PBG INFO</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>FROM:</span>
              <input 
                type="date" 
                className="form-control"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TO:</span>
              <input 
                type="date" 
                className="form-control"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
            </div>

            <button 
              type="button" 
              className="btn btn-primary"
              style={{ fontSize: '12.5px', padding: '7px 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={14} />
              <span>SEARCH</span>
            </button>
          </div>

          {/* Green Alert (matching screenshot: Loaded 12 row(s).) */}
          <div style={{ 
            background: '#ecfdf5', 
            border: '1px solid #a7f3d0', 
            borderRadius: '8px', 
            padding: '8px 16px', 
            color: '#065f46', 
            fontSize: '12.5px', 
            fontWeight: 600, 
            marginBottom: '16px' 
          }}>
            Loaded {campaigns.length} row(s).
          </div>

          {/* Campaign Report Data Table */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '14px', 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>POST DATETIME</th>
                  <th style={{ padding: '12px 16px' }}>NAME</th>
                  <th style={{ padding: '12px 16px' }}>BOT</th>
                  <th style={{ padding: '12px 16px' }}>TEMPLATE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>TOTAL</th>
                  <th style={{ padding: '12px 16px' }}>TYPE</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(camp => (
                  <tr key={camp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{camp.postDateTime}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {camp.name} <span style={{ fontSize: '11px', color: '#0a66c2' }}>#{camp.id}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{camp.bot}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{camp.template}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>{camp.total}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {camp.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: camp.status === 'DELIVERED' ? '#ecfdf5' : '#fef3c7',
                        color: camp.status === 'DELIVERED' ? '#059669' : '#d97706',
                        padding: '3px 10px', 
                        borderRadius: '9999px', 
                        fontSize: '11px', 
                        fontWeight: 700 
                      }}>
                        {camp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => handleOpenDrilldown(camp)}
                        style={{ padding: '4px 12px', fontSize: '11.5px', fontWeight: 700, color: '#0a66c2', borderColor: '#bfdbfe' }}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VIEW MODE 2: DRILLDOWN DETAILS (Matches media_1789472431153.png & media_1789472431150.png) */}
      {viewMode === 'drilldown' && selectedCampaign && (
        <div>
          {/* Drilldown Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setViewMode('list')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 14px' }}
              >
                <ArrowLeft size={14} />
                <span>Back to list</span>
              </button>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Campaign Report — {selectedCampaign.name} (#{selectedCampaign.id})
              </h2>
            </div>

            {/* Badges: DLR: 1, Events: 0 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ background: '#0a66c2', color: '#ffffff', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                DLR: {selectedCampaign.dlrCount}
              </span>
              <span style={{ background: '#64748b', color: '#ffffff', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                Events: {selectedCampaign.eventsCount}
              </span>
            </div>
          </div>

          {/* Dual Panels: DLR Overview (Donut) & Events Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            
            {/* DLR Overview Panel */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>DLR Overview</h3>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => downloadDlrCsv(selectedCampaign)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', padding: '4px 12px' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                {/* Visual Donut Indicator */}
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'conic-gradient(#059669 0% 100%, #e2e8f0 100% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#059669', fontSize: '16px' }}>
                    100%
                  </div>
                </div>

                {/* Slices Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0a66c2' }}></span>
                    <span>Sent: <b>0%</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }}></span>
                    <span>Delivered: <b style={{ color: '#059669' }}>100%</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }}></span>
                    <span>Read: <b>0%</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }}></span>
                    <span>Failed: <b>0%</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706' }}></span>
                    <span>Awaited: <b>0%</b></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Overview Panel */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Events Overview</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                {/* Visual Circle Indicator */}
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#94a3b8', fontSize: '14px' }}>
                    0%
                  </div>
                </div>

                {/* Event metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }}></span>
                    <span>Clicks: <b>0%</b></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ec4899' }}></span>
                    <span>Replies: <b>0%</b></span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 1: DLR Handset Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>DLR Handset Delivery Log</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '10px 14px' }}>TIME</th>
                  <th style={{ padding: '10px 14px' }}>MSISDN</th>
                  <th style={{ padding: '10px 14px' }}>STATUS</th>
                  <th style={{ padding: '10px 14px' }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {selectedCampaign.dlrLogs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{log.time}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f172a' }}>{log.msisdn}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '10px' }}>
              page 1 of 1 — {selectedCampaign.dlrLogs.length} total
            </div>
          </div>

          {/* Section 2: Events Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>Engagement Events Log</h3>
            {selectedCampaign.eventsLogs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>TIME</th>
                    <th style={{ padding: '10px 14px' }}>MSISDN</th>
                    <th style={{ padding: '10px 14px' }}>TYPE</th>
                    <th style={{ padding: '10px 14px' }}>LABEL/URL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaign.eventsLogs.map((ev, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>{ev.time}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{ev.msisdn}</td>
                      <td style={{ padding: '10px 14px' }}>{ev.type}</td>
                      <td style={{ padding: '10px 14px', color: '#0a66c2' }}>{ev.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                No events recorded for this campaign.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Find Number Modal */}
      {findNumberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={18} color="#0a66c2" />
                <span>Find Number in Campaigns</span>
              </div>
              <button type="button" onClick={() => setFindNumberModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <XCircle size={18} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleFindNumber} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter 10-digit mobile (e.g. 9868040206)"
                  value={searchNumber}
                  onChange={e => setSearchNumber(e.target.value)}
                  style={{ fontSize: '13px', padding: '9px 12px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '9px 16px', fontWeight: 700, fontSize: '13px' }}>
                  Search
                </button>
              </div>
            </form>

            {searchNumberResult && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc', fontSize: '12px' }}>
                {searchNumberResult.length > 0 ? (
                  searchNumberResult.map((res, i) => (
                    <div key={i} style={{ padding: '6px 0', borderBottom: i < searchNumberResult.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div><b>{res.campaignName}</b> (#{res.campaignId})</div>
                      <div style={{ color: '#059669', fontWeight: 700 }}>Status: {res.status}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{res.time} • {res.details}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', textAlign: 'center' }}>No records found for this number.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
