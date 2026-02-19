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
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch (error) {
    console.error('Consent write failed:', error);
  }
};

export const clearConsent = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch (error) {
    console.error('Consent clear failed:', error);
  }
};
