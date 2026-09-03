import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, RefreshCw, Eye, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export const LiveWebhookLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayload, setSelectedPayload] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/webhook-logs?limit=50');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load webhook logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Live Webhook Audit Trail</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Real-time incoming payloads received from ExpressIVR dialer engine
          </p>
        </div>

        <button className="btn btn-outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mobile</th>
                <th>Event Type</th>
                <th>Template</th>
                <th>DTMF Key</th>
                <th>Duration</th>
                <th>Computed Lead Status</th>
                <th>Timestamp</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No webhook logs recorded yet. When ExpressIVR triggers events, they will stream here.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 700 }}>{log.mobile}</td>
                    <td>
                      <span className={`badge ${
                        log.eventType === 'HANGUP' ? 'badge-cold' :
                        log.eventType === 'DTMF' ? 'badge-warm' : 'badge-success'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td>Template {log.templateId}</td>
                    <td>{log.pressedKey ? `Key: ${log.pressedKey}` : '-'}</td>
                    <td>{log.duration}s</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {log.computedLeadStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(log.receivedAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedPayload(log.rawPayload)}
                      >
                        <Eye size={12} />
                        <span>JSON</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Raw Webhook JSON</h3>
              <button onClick={() => setSelectedPayload(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#0f172a', borderRadius: '6px', margin: '16px' }}>
              <pre style={{ color: '#38bdf8', fontSize: '12px', margin: 0, overflowX: 'auto' }}>
                {JSON.stringify(JSON.parse(selectedPayload || '{}'), null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedPayload(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
