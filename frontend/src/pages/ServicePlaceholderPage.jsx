import React from 'react';
import { Send, CheckCircle2, FileText, BarChart2 } from 'lucide-react';

export const ServicePlaceholderPage = ({ title, serviceCode, icon }) => {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{title}</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Multi-channel messaging console for <b>{serviceCode}</b> campaigns
        </p>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        <div className="card-header">
          <div className="card-title">Send Test {serviceCode} Message</div>
          <span className="badge badge-success">Gateway Active</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert(`Test ${serviceCode} message queued successfully!`); }}>
          <div className="form-group">
            <label className="form-label">Recipient Mobile Number</label>
            <input type="text" className="form-input" placeholder="8571844348" required defaultValue="8571844348" />
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea 
              className="form-input" 
              rows={4} 
              placeholder={`Type your ${serviceCode} promotional or transactional message...`} 
              defaultValue={`Hello from Leads Engine! Your promotional ${serviceCode} alert is confirmed.`}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
            <Send size={14} />
            <span>Send {serviceCode} Message</span>
          </button>
        </form>
      </div>
    </div>
  );
};
