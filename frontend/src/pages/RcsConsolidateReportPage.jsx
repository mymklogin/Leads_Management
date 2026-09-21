import React, { useState } from 'react';
import { 
  Database, 
  Calendar, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const RcsConsolidateReportPage = () => {
  const [reportType, setReportType] = useState('DLR_SUMMARY');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  // Initial Requests matching screenshot
  const [reportRequests, setReportRequests] = useState([
    {
      id: 'REQ-91024',
      type: 'DLR Detailed Log',
      fromDate: '2026-09-01',
      toDate: '2026-09-15',
      status: 'PROCESSED',
      requestedAt: '15-09-2026 10:30',
      processedAt: '15-09-2026 10:32',
      records: 12
    },
    {
      id: 'REQ-91023',
      type: 'User Events & Clicks',
      fromDate: '2026-09-01',
      toDate: '2026-09-15',
      status: 'PROCESSED',
      requestedAt: '14-09-2026 16:20',
      processedAt: '14-09-2026 16:22',
      records: 3
    }
  ]);

  const handleRequestReport = (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestSuccess('');

    setTimeout(() => {
      const newReq = {
        id: `REQ-${Math.floor(91000 + Math.random() * 9000)}`,
        type: reportType === 'DLR_SUMMARY' ? 'DLR Detailed Log' : (reportType === 'EVENTS' ? 'User Events & Clicks' : 'Campaign Full Audit'),
        fromDate,
        toDate,
        status: 'PENDING',
        requestedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        processedAt: 'Processing...',
        records: 0
      };

      setReportRequests(prev => [newReq, ...prev]);
      setRequestLoading(false);
      setRequestSuccess('Consolidate report request submitted! Your data file is being generated.');

      // Simulate async completion
      setTimeout(() => {
        setReportRequests(prev => prev.map(r => r.id === newReq.id ? { ...r, status: 'PROCESSED', processedAt: 'Just now', records: 12 } : r));
      }, 3000);
    }, 600);
  };

  const handleDownloadReport = (req) => {
    const csvContent = `Request ID: ${req.id}\nReport Type: ${req.type}\nPeriod: ${req.fromDate} to ${req.toDate}\n\nMSISDN,Status,PostDateTime,ErrorCode\n9868040206,DELIVERED,2026-09-15 14:10,None\n9170304221,DELIVERED,2026-09-15 14:11,None\n7840095957,DELIVERED,2026-09-15 14:12,None\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${req.id}_${req.type.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. TOP BLUE BANNER (MATCHING SUITE STANDARDS) */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '12px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Database size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                RCS Consolidate Audit Report
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                BULK ARCHIVE
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Request aggregated bulk audit logs and export multi-day historical deliverability archives
            </p>
          </div>
        </div>
      </div>

      {requestSuccess && (
        <div style={{ 
          background: '#ecfdf5', 
          border: '1px solid #a7f3d0', 
          borderRadius: '10px', 
          padding: '12px 16px', 
          color: '#065f46', 
          fontSize: '13.5px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{requestSuccess}</span>
        </div>
      )}

      {/* Card 1: Request Consolidate Report Form */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '14px', 
        padding: '22px 26px', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)' 
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSpreadsheet size={18} color="#0a66c2" />
          Request Consolidate Report
        </h2>

        <form onSubmit={handleRequestReport}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            
            {/* Report Type */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Report Type <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select 
                className="form-control" 
                value={reportType} 
                onChange={e => setReportType(e.target.value)}
                style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
                required
              >
                <option value="DLR_SUMMARY">DLR Detailed Log</option>
                <option value="EVENTS">User Engagement Events</option>
                <option value="FULL_AUDIT">Campaign Full Reconciliation Audit</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                From Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-control" 
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                required
                style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
              />
            </div>

            {/* To Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                To Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-control" 
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                required
                style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
              />
            </div>

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={requestLoading}
                style={{ 
                  background: '#059669', 
                  borderColor: '#059669', 
                  padding: '10px 22px', 
                  fontWeight: 700, 
                  fontSize: '13px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)' 
                }}
              >
                <Clock size={15} />
                <span>{requestLoading ? 'Requesting...' : 'Request Report'}</span>
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Card 2: My Report Requests Table */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '14px', 
        padding: '22px 26px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#0a66c2" />
            My Report Requests
          </h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Historical requests are archived for 30 days.
          </span>
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>REQUEST ID</th>
                <th style={{ padding: '12px 16px' }}>TYPE</th>
                <th style={{ padding: '12px 16px' }}>FROM DATE</th>
                <th style={{ padding: '12px 16px' }}>TO DATE</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>REQUESTED</th>
                <th style={{ padding: '12px 16px' }}>PROCESSED</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {reportRequests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0a66c2' }}>{req.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{req.type}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{req.fromDate}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{req.toDate}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4, 
                      padding: '3px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '11px', 
                      fontWeight: 700,
                      background: req.status === 'PROCESSED' ? '#ecfdf5' : '#fef3c7',
                      color: req.status === 'PROCESSED' ? '#059669' : '#d97706'
                    }}>
                      {req.status === 'PROCESSED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{req.status}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>{req.requestedAt}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>{req.processedAt}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {req.status === 'PROCESSED' ? (
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => handleDownloadReport(req)}
                        style={{ padding: '5px 12px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Download size={13} color="#0a66c2" />
                        <span>Download</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Generating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
