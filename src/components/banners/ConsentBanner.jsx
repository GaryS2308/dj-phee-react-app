import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '../../utils/consent';
import './ConsentBanner.css';

const ConsentBanner = () => {
  const [consent, setConsentState] = useState(() => getConsent());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleChange = (event) => {
      if (event && event.detail) {
        setConsentState(event.detail);
      } else {
        setConsentState(getConsent());
      }
    };

    window.addEventListener('phee-consent-change', handleChange);
    return () => window.removeEventListener('phee-consent-change', handleChange);
  }, []);

  if (consent !== 'unknown') return null;

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="consent-banner__content">
        <p>
          We use cookies and analytics to understand traffic and improve the site. You can accept or
          reject non-essential tracking. See our{' '}
          <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link>.
        </p>
      </div>
      <div className="consent-banner__actions">
        <button type="button" className="consent-banner__button consent-banner__button--accept" onClick={() => setConsent('accepted')}>
          Accept
        </button>
        <button type="button" className="consent-banner__button consent-banner__button--reject" onClick={() => setConsent('rejected')}>
          Reject
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
