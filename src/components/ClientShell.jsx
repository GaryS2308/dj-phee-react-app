'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import ConsentBanner from './banners/ConsentBanner';
import { useScrollReveal } from '../utils/useScrollReveal';
import { clearConsent, getConsent } from '../utils/consent';
import { GA_ID, analyticsAllowed, isPrivateRoute, trackLinkClick } from '../../lib/siteAnalytics';

const ClientShell = () => {
  const [consent, setConsentState] = useState(undefined);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  useScrollReveal();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('consent') === 'reset') {
      clearConsent();
      params.delete('consent');
      window.history.replaceState({}, '', `${window.location.pathname}${params.size ? `?${params}` : ''}${window.location.hash}`);
    }
    setConsentState(getConsent());
    // Set the disable flag before history-based enhanced measurement sees private navigation.
    const originals = {};
    for (const method of ['pushState', 'replaceState']) {
      originals[method] = window.history[method];
      window.history[method] = function (state, title, url) {
        const path = url == null ? window.location.pathname : new URL(url, window.location.href).pathname;
        window[`ga-disable-${GA_ID}`] = !analyticsAllowed(path);
        return originals[method].apply(this, arguments);
      };
    }
    const onPop = () => { window[`ga-disable-${GA_ID}`] = !analyticsAllowed(); };
    window.addEventListener('popstate', onPop);
    document.addEventListener('click', trackLinkClick);
    return () => {
      for (const method of Object.keys(originals)) window.history[method] = originals[method];
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', trackLinkClick);
    };
  }, []);

  useEffect(() => {
    const allowed = consent === 'granted' && !isPrivateRoute(pathname);
    window[`ga-disable-${GA_ID}`] = !allowed;
    if (!allowed) {
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (!window.__pheeAnalyticsConfigured) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
      });
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, {
        ...(new URLSearchParams(window.location.search).get('ga_debug') === '1' ? { debug_mode: true } : {})
      });
      window.__pheeAnalyticsConfigured = true;
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    setReady(true);
  }, [consent, pathname]);

  return <>
    {ready && consent === 'granted' && !isPrivateRoute(pathname) && <Script id="phee-ga" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />}
    <ConsentBanner consent={consent} onDecision={setConsentState} />
  </>;
};

export default ClientShell;
