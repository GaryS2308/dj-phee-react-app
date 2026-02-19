'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsent, setConsent } from '../../utils/consent';

const ConsentBanner = ({ consent, onDecision }) => {
  const [mounted, setMounted] = useState(false);
  const [localConsent, setLocalConsent] = useState(undefined);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (consent === undefined) {
      setLocalConsent(getConsent());
      return;
    }
    setLocalConsent(consent);
  }, [consent, mounted]);

  if (!mounted || dismissed || localConsent === undefined || localConsent !== null) return null;

  const handleDecision = (value) => {
    setDismissed(true);
    setLocalConsent(value);
    setConsent(value);
    if (typeof onDecision === 'function') {
      onDecision(value);
    }
  };

  return (
    <div className="consent-banner__backdrop" onClick={() => handleDecision('denied')}>
      <div
        className="consent-banner"
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="consent-banner__content">
          <p>
            We use cookies and analytics to understand traffic and improve the site. You can accept or
            reject non-essential tracking. See our{' '}
            <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </div>
        <div className="consent-banner__actions">
          <button
            type="button"
            className="consent-banner__button consent-banner__button--accept"
            onClick={() => handleDecision('granted')}
          >
            Accept
          </button>
          <button
            type="button"
            className="consent-banner__button consent-banner__button--reject"
            onClick={() => handleDecision('denied')}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
