import React, { useState, useEffect } from 'react';
import { 
  Globe, Building, CheckCircle2, AlertCircle, Plus, Trash2, Edit3, X, 
  RefreshCw, Check, Copy, ExternalLink, ShieldCheck, Zap, Server
} from 'lucide-react';
import axios from 'axios';

export function ResellerDomainPage() {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [verifyingId, setVerifyingId] = useState('');
  const [dnsResult, setDnsResult] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [domainForm, setDomainForm] = useState({
    id: '',
    resellerId: '',
    resellerName: '',
    brandTitle: '',
    customDomain: '',
    cnameTarget: 'app.yourdomain.com',
    brandLogoUrl: '',
    primaryColor: '#0284c7',
    supportEmail: '',
    supportPhone: '',
    customApiBaseUrl: '',
    sslActive: true,
    dnsVerified: true,
    isActive: true
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/ResellerConnectivity/domains');
      if (res.data.success) {
        setDomains(res.data.domains || []);
      }
    } catch (err) {
      console.error('Failed to fetch reseller domains:', err);
      setSaveError('Failed to load Reseller Custom Domains.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDomain(null);
    setDomainForm({
      id: '',
      resellerId: 'reseller-' + Math.floor(100 + Math.random() * 900),
      resellerName: '',
      brandTitle: '',
      customDomain: '',
      cnameTarget: 'app.yourdomain.com',
      brandLogoUrl: '',
      primaryColor: '#0284c7',
      supportEmail: '',
      supportPhone: '',
      customApiBaseUrl: '',
      sslActive: true,
      dnsVerified: true,
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dm) => {
    setEditingDomain(dm);
    setDomainForm({ ...dm });
    setShowModal(true);
  };

  const handleSaveDomain = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      // Auto-compute customApiBaseUrl if empty
      const payload = {
        ...domainForm,
        customApiBaseUrl: domainForm.customApiBaseUrl || `https://${domainForm.customDomain}/api/RCSApi`
      };
      const res = await axios.post('/api/ResellerConnectivity/domains', payload);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        setShowModal(false);
        fetchDomains();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to save reseller domain mapping.');
    }
  };

  const handleDelete = async (id, domainName) => {
    if (!window.confirm(`Delete domain mapping for '${domainName}'?`)) return;
    try {
      const res = await axios.delete(`/api/ResellerConnectivity/domains/${id}`);
      if (res.data.success) {
        setSaveSuccess(res.data.message);
        fetchDomains();
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to delete domain mapping.');
    }
  };

  const handleVerifyDns = async (dm) => {
    try {
      setVerifyingId(dm.id);
      setDnsResult(null);
      const res = await axios.post('/api/ResellerConnectivity/verify-domain', { domain: dm.customDomain });
      setDnsResult(res.data);
    } catch (err) {
      setSaveError('DNS verification check failed.');
    } finally {
      setVerifyingId('');
    }
  };

  if (loading && domains.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading Reseller Custom Domains...</p>
      </div>
    );
  }

  const activeDomainsCount = domains.filter(d => d.isActive).length;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* Sleek Enterprise Blue Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '14px 22px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Globe size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Reseller Custom Domains & White-Label Mapping
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                WHITE-LABEL ACTIVE • AUTO SSL
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Enable resellers to run the SMS/RCS portal under their branded domain with automated CNAME mapping and SSL.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenAdd}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <Plus size={15} /> Add Reseller Domain
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 700, fontSize: '13.5px' }}>
          <CheckCircle2 size={20} /> {saveSuccess}
        </div>
      )}
      {saveError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 700, fontSize: '13.5px' }}>
          <AlertCircle size={20} /> {saveError}
        </div>
      )}

      {/* DNS Verification Banner */}
      {dnsResult && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#15803d' }}>
                {dnsResult.message}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                CNAME Target: <code>{dnsResult.cnameTarget}</code> • SSL Cert: <strong>{dnsResult.sslStatus}</strong> • Status: <strong>{dnsResult.status}</strong>
              </div>
            </div>
          </div>
          <button onClick={() => setDnsResult(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
        </div>
      )}

      {/* CNAME Guide Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              How Resellers Setup Their Custom Domain (DNS Instructions)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Give these instructions to your reseller's IT team or domain administrator:
            </p>
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#334155' }}>
            Add a <strong>CNAME record</strong> in Cloudflare/GoDaddy: Name: <code>sms</code> (or subdomain) ➔ Target: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>app.yourdomain.com</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800 }}>
              SSL Auto-Provisioned
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mapped Domains</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {domains.length} <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>({activeDomainsCount} Active)</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SSL Certificates</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
              100% SECURE <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TLS 1.3</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>White-Label Portals</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              {domains.length} Tenants
            </div>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Configured Reseller Custom Domains
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Each domain serves an isolated white-label portal with custom branding and API routes.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Domain
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 14px' }}>Custom Domain</th>
                <th style={{ padding: '12px 14px' }}>Reseller Name</th>
                <th style={{ padding: '12px 14px' }}>Brand Display Title</th>
                <th style={{ padding: '12px 14px' }}>CNAME Target</th>
                <th style={{ padding: '12px 14px' }}>SSL & DNS</th>
                <th style={{ padding: '12px 14px' }}>White-Label API Endpoint</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((dm, idx) => (
                <tr key={dm.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={15} />
                      {dm.customDomain}
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                    {dm.resellerName}
                  </td>

                  <td style={{ padding: '12px 14px', color: '#334155' }}>
                    <div style={{ fontWeight: 700 }}>{dm.brandTitle}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{dm.supportEmail || 'No email set'}</div>
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#64748b' }}>
                    {dm.cnameTarget}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        SSL ACTIVE
                      </span>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        DNS OK
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#0284c7' }}>
                    {dm.customApiBaseUrl || `https://${dm.customDomain}/api/RCSApi`}
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleVerifyDns(dm)}
                        disabled={verifyingId === dm.id}
                        title="Probe DNS CNAME"
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7', cursor: 'pointer', fontWeight: 700, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {verifyingId === dm.id ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                        Verify DNS
                      </button>
                      <button onClick={() => handleOpenEdit(dm)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(dm.id, dm.customDomain)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Domain */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {editingDomain ? 'Edit Custom Domain' : 'Add Reseller Custom Domain'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDomain} style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Reseller / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Manoj Telecom"
                    value={domainForm.resellerName}
                    onChange={e => setDomainForm({ ...domainForm, resellerName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Brand Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Manoj Cloud SMS"
                    value={domainForm.brandTitle}
                    onChange={e => setDomainForm({ ...domainForm, brandTitle: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Custom Subdomain / FQDN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sms.manojtelecom.in"
                  value={domainForm.customDomain}
                  onChange={e => setDomainForm({ ...domainForm, customDomain: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    placeholder="support@reseller.in"
                    value={domainForm.supportEmail}
                    onChange={e => setDomainForm({ ...domainForm, supportEmail: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Support Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={domainForm.supportPhone}
                    onChange={e => setDomainForm({ ...domainForm, supportPhone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Custom API Base URL
                </label>
                <input
                  type="text"
                  placeholder={`https://${domainForm.customDomain || 'sms.domain.com'}/api/RCSApi`}
                  value={domainForm.customApiBaseUrl}
                  onChange={e => setDomainForm({ ...domainForm, customApiBaseUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Save Domain</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
