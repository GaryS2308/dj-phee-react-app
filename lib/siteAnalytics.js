export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-0FHGPWSFKK';
export const isPrivateRoute = (path) => /^\/(admin|response)(\/|$)/.test(path);

export function analyticsAllowed(path = window.location.pathname) {
  try {
    return !isPrivateRoute(path) && window.localStorage.getItem('phee_consent_v1') === 'granted';
  } catch { return false; }
}

// Only fixed, non-personal fields are accepted by the event API.
const fields = {
  generate_lead: ['form_id', 'event_type'],
  booking_form_error: ['form_id', 'error_type'],
  booking_estimate: ['hours', 'value', 'currency'],
  cta_click: ['cta_text', 'cta_location', 'link_url'],
  email_click: ['link_location'],
  phone_click: ['link_location'],
  whatsapp_click: ['link_location'],
  social_click: ['platform', 'link_location']
};

/** @param {keyof typeof fields} eventName @param {Record<string, string | number>} params */
export function track(eventName, params = {}) {
  if (typeof window === 'undefined' || !analyticsAllowed() || !window.gtag || !fields[eventName]) return;
  const safe = Object.fromEntries(Object.entries(params).filter(([key]) => fields[eventName].includes(key)));
  window.gtag('event', eventName, {
    ...safe,
    page_location: `${window.location.origin}${window.location.pathname}`,
    ...(new URLSearchParams(window.location.search).get('ga_debug') === '1' ? { debug_mode: true } : {})
  });
}

export function eventCategory(value) {
  const text = value.trim().toLowerCase();
  return ['wedding', 'corporate', 'club', 'festival', 'birthday', 'private party'].includes(text) ? text : 'other';
}

export function trackLinkClick(event) {
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  const url = new URL(link.href, window.location.origin);
  const location = link.closest('nav, header') ? 'nav' : link.closest('footer') ? 'footer' : window.location.pathname;
  if (url.protocol === 'mailto:') track('email_click', { link_location: location });
  else if (url.protocol === 'tel:') track('phone_click', { link_location: location });
  else if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) track('whatsapp_click', { link_location: location });
  else if (/(^|\.)(instagram\.com|soundcloud\.com)$/.test(url.hostname)) {
    track('social_click', { platform: url.hostname.includes('instagram') ? 'instagram' : 'soundcloud', link_location: location });
  } else if (url.origin === window.location.origin && (url.pathname === '/booking' || url.hash === '#booking')) {
    track('cta_click', { cta_text: link.textContent.trim().slice(0, 100), cta_location: location, link_url: url.origin + url.pathname + url.hash });
  }
}
