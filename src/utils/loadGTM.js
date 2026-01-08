let gtmLoaded = false;

export const loadGTM = () => {
  if (gtmLoaded || typeof window === 'undefined' || typeof document === 'undefined') return;
  gtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MG8B7XV5';
  document.head.appendChild(script);
};
