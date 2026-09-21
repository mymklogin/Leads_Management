import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const defaultBranding = {
  companyName: 'SAAS',
  brandLogoUrl: '',
  webDomain: typeof window !== 'undefined' ? window.location.origin : 'http://10.25.215.137:5173',
  apiDomain: typeof window !== 'undefined' ? (window.location.protocol + '//' + window.location.hostname + ':5108') : 'http://10.25.215.137:5108',
  supportEmail: 'support@rcsflow.io',
  supportPhone: '+91 98765 43210',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  activeApiKey: 'A58463AEB7AE41CD9901D23D18BC2482883'
};

const BrandingContext = createContext({
  branding: defaultBranding,
  refreshBranding: () => {},
  updateBranding: () => {}
});

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('lead_mgmt_branding');
      if (saved) return { ...defaultBranding, ...JSON.parse(saved) };
    } catch (_) {}
    return defaultBranding;
  });

  const fetchBranding = async () => {
    try {
      const res = await api.get('/Settings/gateway-config');
      if (res.data) {
        const b = res.data.branding || {};
        const g = res.data.gateway || {};
        const merged = {
          companyName: b.companyName || defaultBranding.companyName,
          brandLogoUrl: b.brandLogoUrl || '',
          webDomain: b.webDomain || defaultBranding.webDomain,
          apiDomain: b.apiDomain || defaultBranding.apiDomain,
          supportEmail: b.supportEmail || defaultBranding.supportEmail,
          supportPhone: b.supportPhone || defaultBranding.supportPhone,
          termsUrl: b.termsUrl || defaultBranding.termsUrl,
          privacyUrl: b.privacyUrl || defaultBranding.privacyUrl,
          activeApiKey: g.apiKey || defaultBranding.activeApiKey,
          gatewayBaseUrl: g.baseUrl || 'https://gateway.rcsflow.io/api/RCSApi',
          defaultBotId: g.defaultBotId || '3c4fa9a066274cd2',
          defaultBotName: g.defaultBotName || 'PBG INFO',
          defaultTemplateId: g.defaultTemplateId || 'YCSLPB_vg'
        };
        setBranding(merged);
        localStorage.setItem('lead_mgmt_branding', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Could not fetch remote branding/gateway config:', err);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBranding = (newBranding) => {
    const updated = { ...branding, ...newBranding };
    setBranding(updated);
    localStorage.setItem('lead_mgmt_branding', JSON.stringify(updated));
  };

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding: fetchBranding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
