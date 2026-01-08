import { useEffect } from 'react';

const GTM_ID = 'GTM-MG8B7XV5';
const GTAG_ID = 'G-0FHGPWSFKK';

const createScript = (id, attributes = {}, innerHTML) => {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  Object.entries(attributes).forEach(([key, value]) => {
    script[key] = value;
  });
  document.head.appendChild(script);
};

export const useLoadAnalyticsScripts = (shouldLoad = true, delayMs = 1200) => {
  useEffect(() => {
    if (!shouldLoad) return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let loaded = false;

    const loadScripts = () => {
      if (loaded) return;
      loaded = true;
      window.dataLayer = window.dataLayer || [];

      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

      createScript('gtag-js', {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`,
        onload: () => {
          window.gtag('js', new Date());
          window.gtag('config', GTAG_ID);
        }
      });
    };

    const schedule = () => {
      if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(loadScripts, { timeout: delayMs });
      }
      return window.setTimeout(loadScripts, delayMs);
    };

    let timer;
    if (document.readyState === 'complete') {
      timer = schedule();
    } else {
      const onLoad = () => {
        timer = schedule();
        window.removeEventListener('load', onLoad);
      };
      window.addEventListener('load', onLoad);
    }

    return () => {
      if (typeof timer === 'number') {
        window.clearTimeout(timer);
      } else if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(timer);
      }
    };
  }, [delayMs, shouldLoad]);
};
