const CONSENT_KEY = 'phee-consent';

export const getConsent = () => {
  if (typeof window === 'undefined') return 'unknown';
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') return value;
  return 'unknown';
};

export const setConsent = (value) => {
  if (typeof window === 'undefined') return;
  if (value !== 'accepted' && value !== 'rejected') return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('phee-consent-change', { detail: value }));
};
