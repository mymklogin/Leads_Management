import React from 'react';
import { 
  X, 
  User, 
  Building2, 
  Shield, 
  FileText, 
  CreditCard, 
  MessageSquare,
  PhoneCall,
  Send,
  Mail,
  Phone,
  Download
} from 'lucide-react';

export const ViewUserModal = ({ user, onClose, onAddBalance, onEditUser }) => {
  if (!user) return null;

  const allowed = user.allowedServices || ['RCS-T', 'RCS-P'];
  const hasService = (svc) => allowed.includes(svc);

  const handleDownloadDoc = (docName) => {
    const element = document.createElement('a');
    const file = new Blob([
      `KYC Compliance Document Verification Record\nDocument: ${docName}\nUser: ${user.fullName} (@${user.username})\nCompany: ${user.companyName || 'N/A'}\nDLT Entity ID: ${user.dltEntityId || 'N/A'}\nStatus: Officially Verified\nTimestamp: ${new Date().toISOString()}`
    ], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = docName.endsWith('.pdf') || docName.endsWith('.png') ? docName : `${docName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '16px 24px',
          color: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  {user.fullName || user.username}
                </h3>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  UID: #{user.id}
                </span>
                <span style={{
                  background: user.isActive ? '#22c55e' : '#ef4444',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800
                }}>
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                @{user.username} • {user.roleName || user.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Business & Identity Details */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: 10 }}>
              🏢 Enterprise & Identity
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={13} color="#0284c7" /> Company / Business
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  {user.companyName || user.fullName}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={13} color="#0284c7" /> DLT Entity ID
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                    {user.dltEntityId || 'N/A'}
                  </code>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={13} color="#0284c7" /> Email Address
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: 4, wordBreak: 'break-all' }}>
                  {user.email}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={13} color="#0284c7" /> Mobile / Phone
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: 4 }}>
                  {user.phoneNumber || '+91 9876543210'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Allowed Telecom Services */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: 10 }}>
              📡 Allowed Telecom Platforms & Traffic Routes
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              
              {/* RCS SMS */}
              <div style={{
                background: (hasService('RCS-T') || hasService('RCS-P')) ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${(hasService('RCS-T') || hasService('RCS-P')) ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#059669' }}>
                  <MessageSquare size={16} />
                  <span>RCS SMS</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('RCS-T') ? '#10b981' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('RCS-T') ? '✓ Transactional' : '✗ Txn Disabled'}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('RCS-P') ? '#0284c7' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('RCS-P') ? '✓ Promotional' : '✗ Promo Disabled'}
                  </span>
                </div>
              </div>

              {/* Bulk SMS */}
              <div style={{
                background: (hasService('BULKSMS-T') || hasService('BULKSMS-P')) ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${(hasService('BULKSMS-T') || hasService('BULKSMS-P')) ? '#93c5fd' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#2563eb' }}>
                  <PhoneCall size={16} />
                  <span>Bulk SMS</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('BULKSMS-T') ? '#2563eb' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('BULKSMS-T') ? '✓ Transactional' : '✗ Txn Disabled'}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('BULKSMS-P') ? '#6366f1' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('BULKSMS-P') ? '✓ Promotional' : '✗ Promo Disabled'}
                  </span>
                </div>
              </div>

              {/* WhatsApp SMS */}
              <div style={{
                background: (hasService('WHATSAPP-T') || hasService('WHATSAPP-P')) ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${(hasService('WHATSAPP-T') || hasService('WHATSAPP-P')) ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#16a34a' }}>
                  <Send size={16} />
                  <span>WhatsApp SMS</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('WHATSAPP-T') ? '#16a34a' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('WHATSAPP-T') ? '✓ Transactional' : '✗ Txn Disabled'}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: hasService('WHATSAPP-P') ? '#059669' : '#cbd5e1',
                    color: '#ffffff'
                  }}>
                    {hasService('WHATSAPP-P') ? '✓ Promotional' : '✗ Promo Disabled'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Live Real-Time Wallet Balances */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: 10 }}>
              💳 Live User Wallet Balances
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              
              {/* RCS Balances */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>RCS SMS Balances</div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Transactional (RCS-T):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
                    {Number(user.rcsCredits || 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Promotional (RCS-P):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0284c7' }}>
                    {Number(user.rcsPromoCredits ?? user.rcsPromotionalCredits ?? 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
              </div>

              {/* Bulk SMS Balances */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>Bulk SMS Balances</div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Transactional (BULKSMS-T):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#2563eb' }}>
                    {Number(user.smsCredits || 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Promotional (BULKSMS-P):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#6366f1' }}>
                    {Number(user.bulkSmsPromoCredits ?? user.bulkSmsPromotionalCredits ?? 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Balances */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>WhatsApp SMS Balances</div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Transactional (WhatsApp-T):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a' }}>
                    {Number(user.whatsAppCredits || 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Promotional (WhatsApp-P):</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
                    {Number(user.whatsAppPromoCredits ?? user.whatsAppPromotionalCredits ?? 0).toLocaleString()} <span style={{ fontSize: '10px' }}>Credits</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Attached KYC Documents */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: 10 }}>
              📎 KYC & Compliance Documents ({user.documents?.length || 0})
            </h4>
            {user.documents && user.documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {user.documents.map((doc, idx) => (
                  <div key={idx} style={{
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={16} color="#0284c7" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{doc}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(doc)}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#0284c7',
                          borderColor: '#bae6fd',
                          background: '#ffffff',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title={`Download ${doc}`}
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                No KYC documents uploaded yet.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ borderColor: '#0284c7', color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                onClose();
                if (onEditUser) onEditUser(user);
              }}
            >
              ✏️ Edit User & Services
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                onClose();
                if (onAddBalance) onAddBalance(user);
              }}
            >
              <CreditCard size={15} />
              <span>Add / Revoke Balance</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
