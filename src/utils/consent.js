import { GA_ID } from '../../lib/siteAnalytics';

const CONSENT_KEY = 'phee_consent_v1';

export const getConsent = () => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    if (value === 'granted' || value === 'denied') return value;
  } catch (error) {
    console.error('Consent read failed:', error);
  }
  return null;
};

export const setConsent = (value) => {
  if (typeof window === 'undefined') return;
  if (value !== 'granted' && value !== 'denied') return;
  if (value === 'denied') disableAnalytics();
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch (error) {
    console.error('Consent write failed:', error);
  }
};

export const clearConsent = () => {
  if (typeof window === 'undefined') return;
  disableAnalytics();
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch (error) {
    console.error('Consent clear failed:', error);
  }
};

function disableAnalytics() {
  window[`ga-disable-${GA_ID}`] = true;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  // Remove GA cookies for host-only and parent-domain configurations.
  const hostParts = window.location.hostname.split('.');
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (let i = 0; i < hostParts.length - 1; i += 1) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostParts.slice(i).join('.')}`;
    }
  }
}
