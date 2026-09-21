import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  X, 
  CreditCard, 
  Check, 
  AlertCircle,
  Building2,
  Shield,
  Zap,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const AddBalanceModal = ({ user, onClose, onSuccess }) => {
  if (!user) return null;

  const pendingRequest = useRef(null);
  const submitting = useRef(false);
  const [platform, setPlatform] = useState('RCS'); // RCS | SMS | WHATSAPP
  const [route, setRoute] = useState('Transactional'); // Transactional | Promotional
  const [actionType, setActionType] = useState('Credit'); // Credit | Revoke
  const [credits, setCredits] = useState('0'); // Always default to 0!
  const [rate, setRate] = useState('0.20');
  const [notes, setNotes] = useState('Table Quick Balance Update');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [adminBalances, setAdminBalances] = useState({
    rcsT: 0,
    rcsP: 0,
    bulkSmsT: 0,
    bulkSmsP: 0,
    whatsAppT: 0,
    whatsAppP: 0
  });

  useEffect(() => {
    fetchAdminBalances();
  }, []);

  const fetchAdminBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      const data = res.data?.response || res.data?.Response;
      if (data?.adminBalances || data?.AdminBalances) {
        data.AdminBalances = data.adminBalances || data.AdminBalances;
        setAdminBalances({
          rcsT: data.AdminBalances.rcsT ?? 0,
          rcsP: data.AdminBalances.rcsP ?? 0,
          bulkSmsT: data.AdminBalances.bulkSmsT ?? 0,
          bulkSmsP: data.AdminBalances.bulkSmsP ?? 0,
          whatsAppT: data.AdminBalances.whatsAppT ?? 0,
          whatsAppP: data.AdminBalances.whatsAppP ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin live balances', err);
    }
  };

  // Resolve 2-step dropdowns to target wallet code
  const resolveWalletService = (plat, rt) => {
    if (plat === 'RCS') {
      return rt === 'Transactional' ? 'RCS-T' : 'RCS-P';
    } else if (plat === 'SMS') {
      return rt === 'Transactional' ? 'BULKSMS-T' : 'BULKSMS-P';
    } else if (plat === 'WHATSAPP') {
      return rt === 'Transactional' ? 'WHATSAPP-T' : 'WHATSAPP-P';
    }
    return 'RCS-T';
  };

  const resolvedService = resolveWalletService(platform, route);

  // Get Admin live pool for resolved service
  const getAdminLimit = (svc) => {
    switch (svc) {
      case 'RCS-T': return adminBalances.rcsT;
      case 'RCS-P': return adminBalances.rcsP;
      case 'BULKSMS-T': return adminBalances.bulkSmsT;
      case 'BULKSMS-P': return adminBalances.bulkSmsP;
      case 'WHATSAPP-T': return adminBalances.whatsAppT;
      case 'WHATSAPP-P': return adminBalances.whatsAppP;
      default: return 0;
    }
  };

  // Get user's current balance for resolved service
  const getUserBalance = (svc) => {
    switch (svc) {
      case 'RCS-T': return Number(user.rcsCredits || 0);
      case 'RCS-P': return Number(user.rcsPromoCredits ?? user.rcsPromotionalCredits ?? 0);
      case 'BULKSMS-T': return Number(user.smsCredits || 0);
      case 'BULKSMS-P': return Number(user.bulkSmsPromoCredits ?? user.bulkSmsPromotionalCredits ?? 0);
      case 'WHATSAPP-T': return Number(user.whatsAppCredits || 0);
      case 'WHATSAPP-P': return Number(user.whatsAppPromoCredits ?? user.whatsAppPromotionalCredits ?? 0);
      default: return 0;
    }
  };

  const adminAvail = getAdminLimit(resolvedService);
  const userCurrent = getUserBalance(resolvedService);
  const creditsNum = parseFloat(credits) || 0;
  const isRevoke = actionType === 'Revoke';

  const hasAdminOverdrawn = !isRevoke && creditsNum > adminAvail;
  const hasUserOverdrawn = isRevoke && creditsNum > userCurrent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (creditsNum <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (hasAdminOverdrawn) {
      setErrorMsg(`Limit Exceeded: Admin ke paas sirf ${adminAvail.toLocaleString()} ${resolvedService} balance hai.`);
      return;
    }

    if (hasUserOverdrawn) {
      setErrorMsg(`Limit Exceeded: User ke paas sirf ${userCurrent.toLocaleString()} ${resolvedService} balance hai.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        targetUserId: user.id,
        serviceType: resolvedService,
        actionType: actionType,
        credits: creditsNum,
        pricePerCredit: parseFloat(rate) || 0,
        notes: notes.trim() || `${actionType} ${creditsNum} ${resolvedService}`
      };

      const fingerprint = JSON.stringify(payload);
      if (pendingRequest.current?.fingerprint !== fingerprint) pendingRequest.current = { fingerprint, id: '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)) };
      payload.requestId = pendingRequest.current.id;
      submitting.current = true;
      const res = await api.post('/RCSApi/ManageUserBalance', payload);
      if (res.data?.status === 'OK' || res.data?.Status === 'OK') {
        pendingRequest.current = null;
        setSuccessMsg(
          isRevoke
            ? `Successfully debited ${creditsNum.toLocaleString()} ${resolvedService} from @${user.username}!`
            : `Successfully credited ${creditsNum.toLocaleString()} ${resolvedService} to @${user.username}!`
        );
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.data?.message || 'Transaction failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error while managing balance.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
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
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '16px 20px',
          color: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  Manage User Balance
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
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                {user.fullName || user.username} (@{user.username})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: 30,
              height: 30,
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#16a34a',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 2-STEP SERVICE SELECTION: PLATFORM/CHANNEL + ROUTE/TYPE */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
              📡 Telecom Wallet Service (2-Step Selection)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Platform / Channel</label>
                <select
                  className="form-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  <option value="RCS">RCS SMS</option>
                  <option value="SMS">Bulk SMS</option>
                  <option value="WHATSAPP">WhatsApp SMS</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Route / Traffic Type</label>
                <select
                  className="form-select"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  <option value="Transactional">Transactional</option>
                  <option value="Promotional">Promotional</option>
                </select>
              </div>
            </div>

            {/* Resolved Wallet Indicator */}
            <div style={{ marginTop: 8, fontSize: '11px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Target Wallet:</span>
              <span style={{ background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, color: '#0284c7' }}>
                {resolvedService}
              </span>
            </div>
          </div>

          {/* ACTION: CREDIT VS DEBIT */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Action</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setActionType('Credit')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: actionType === 'Credit' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: actionType === 'Credit' ? '#ecfdf5' : '#ffffff',
                  color: actionType === 'Credit' ? '#059669' : '#64748b'
                }}
              >
                ➕ Credit (Balance Dena)
              </button>
              <button
                type="button"
                onClick={() => setActionType('Revoke')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: actionType === 'Revoke' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  background: actionType === 'Revoke' ? '#fef2f2' : '#ffffff',
                  color: actionType === 'Revoke' ? '#dc2626' : '#64748b'
                }}
              >
                ➖ Debit (Balance Wapas Lena)
              </button>
            </div>
          </div>

          {/* DUAL LIMIT SUMMARY BOX */}
          <div style={{
            background: isRevoke ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isRevoke ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '8px',
            padding: '10px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
                  🟢 Admin Gateway Live Pool
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#15803d', marginTop: 2 }}>
                  {adminAvail.toLocaleString()} <span style={{ fontSize: '10px' }}>{resolvedService}</span>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '3px solid #ef4444' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#991b1b' }}>
                  🔵 User Available Balance
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#b91c1c', marginTop: 2 }}>
                  {userCurrent.toLocaleString()} <span style={{ fontSize: '10px' }}>{resolvedService}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: isRevoke ? '#991b1b' : '#166534', marginTop: 6, fontWeight: 600 }}>
              💡 <b>Rule:</b> {isRevoke 
                ? `Maximum ${userCurrent.toLocaleString()} ${resolvedService} debit kiya ja sakta hai.`
                : `Admin balance me se maximum ${adminAvail.toLocaleString()} ${resolvedService} credit kiya ja sakta hai.`
              }
            </div>
          </div>

          {/* CREDIT / DEBIT AMOUNT INPUT (DEFAULT TO 0) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: isRevoke ? '#dc2626' : '#059669' }}>
                {isRevoke ? 'Debit Amount (Deduct)' : 'Credit Amount (Transfer)'}
              </label>
              <input
                type="number"
                className="form-input"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                min="1"
                placeholder="0"
                required
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  borderColor: (hasAdminOverdrawn || hasUserOverdrawn) ? '#ef4444' : (isRevoke ? '#f87171' : '#86efac')
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                New Expected Balance
              </label>
              <div style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '14px',
                color: '#0f172a'
              }}>
                {isRevoke 
                  ? Math.max(0, userCurrent - creditsNum).toLocaleString() 
                  : (userCurrent + creditsNum).toLocaleString()
                } {resolvedService}
              </div>
            </div>
          </div>

          {/* Smart Presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Quick:</span>
            {[10, 25, 50].map(amt => (
              <button
                key={amt}
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => setCredits(amt.toString())}
              >
                +{amt}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-sm"
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: isRevoke ? '#fef2f2' : '#ecfdf5',
                color: isRevoke ? '#dc2626' : '#059669',
                border: `1px solid ${isRevoke ? '#fca5a5' : '#86efac'}`,
                fontWeight: 800
              }}
              onClick={() => {
                const maxVal = isRevoke ? userCurrent : adminAvail;
                setCredits(maxVal.toString());
              }}
            >
              ⚡ Max ({isRevoke ? userCurrent.toLocaleString() : adminAvail.toLocaleString()})
            </button>
          </div>

          {/* Rate & Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Rate (₹ / credit)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Remarks</label>
              <input
                type="text"
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || hasAdminOverdrawn || hasUserOverdrawn || creditsNum <= 0}
              style={{
                background: isRevoke ? '#dc2626' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                borderColor: isRevoke ? '#dc2626' : '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <CreditCard size={15} />
              <span>
                {loading 
                  ? 'Processing...' 
                  : (isRevoke ? `Debit ${creditsNum.toLocaleString()} ${resolvedService}` : `Credit ${creditsNum.toLocaleString()} ${resolvedService}`)
                }
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
