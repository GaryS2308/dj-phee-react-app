'use client';

import { useEffect, useState } from 'react';
import ConsentBanner from './banners/ConsentBanner';
import { useScrollReveal } from '../utils/useScrollReveal';
import { initAnalytics } from '../firebase';
import { loadGTM } from '../utils/loadGTM';
import { clearConsent, getConsent } from '../utils/consent';

const GTAG_ID = 'G-0FHGPWSFKK';

const ClientShell = () => {
  const [consent, setConsentState] = useState(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const requestedReset = params.get('consent') === 'reset';
    if (requestedReset) {
      clearConsent();
      setConsentState(null);
      params.delete('consent');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
      return;
    }
    setConsentState(getConsent());
  }, []);

  useScrollReveal();

  useEffect(() => {
    if (consent !== 'granted') return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let cancelled = false;

    const configureGtag = () => {
      if (cancelled) return;
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
      }
      try {
        window.gtag('js', new Date());
        window.gtag('config', GTAG_ID);
      } catch (error) {
        console.error('Gtag config failed:', error);
      }
    };

    const loadAnalytics = () => {
      try {
        const existing = document.getElementById('gtag-js');
        if (existing) {
          if (window.gtag) {
            configureGtag();
          } else {
            existing.addEventListener('load', configureGtag, { once: true });
          }
          return;
        }

        const script = document.createElement('script');
        script.id = 'gtag-js';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
        script.addEventListener('load', configureGtag);
        document.head.appendChild(script);
      } catch (error) {
        console.error('Analytics script load failed:', error);
      }
    };

    const timer =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(loadAnalytics, { timeout: 1500 })
        : window.setTimeout(loadAnalytics, 1200);

    return () => {
      cancelled = true;
      if (typeof timer === 'number') {
        window.clearTimeout(timer);
      } else if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(timer);
      }
    };
  }, [consent]);

  useEffect(() => {
    if (consent !== 'granted') return undefined;
    if (typeof window === 'undefined') return undefined;

    const timer = window.setTimeout(() => {
      try {
        initAnalytics();
      } catch (error) {
        console.error('Analytics init failed:', error);
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [consent]);

  useEffect(() => {
    if (consent !== 'granted') return undefined;
    if (typeof window === 'undefined') return undefined;

    let loaded = false;
    const fireGTM = () => {
      if (loaded) return;
      loaded = true;
      try {
        loadGTM();
      } catch (error) {
        console.error('GTM load failed:', error);
      }
    };

    const idleHandle =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(() => fireGTM(), { timeout: 2500 })
        : window.setTimeout(fireGTM, 2500);

    const onInteract = () => fireGTM();
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      if (typeof idleHandle === 'number') {
        window.clearTimeout(idleHandle);
      } else if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [consent]);

  return <ConsentBanner consent={consent} onDecision={setConsentState} />;
};

export default ClientShell;
