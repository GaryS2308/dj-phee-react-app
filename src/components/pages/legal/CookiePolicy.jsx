import React from 'react';
import LegalPage from './LegalPage';

const CookiePolicy = () => (
  <LegalPage
    title="Cookie Policy"
    description="How PHEE uses cookies and similar technologies."
  >
    <p><strong>Effective date:</strong> 2025-09-22</p>

    <h2>What are cookies?</h2>
    <p>Cookies are small text files stored on your device that help websites remember preferences and understand usage.</p>

    <h2>How we use cookies</h2>
    <ul>
      <li><strong>Essential:</strong> Required to make the site function and keep it secure.</li>
      <li><strong>Analytics:</strong> Helps us understand site traffic and improve performance (only if you consent).</li>
      <li><strong>Embedded media:</strong> SoundCloud players may set their own cookies when loaded.</li>
    </ul>

    <h2>Your choices</h2>
    <p>You can accept or reject non-essential cookies using the consent banner. You can also clear cookies in your browser at any time.</p>

    <h2>Third-party cookies</h2>
    <p>Third-party services such as Google Analytics, Google Tag Manager, and SoundCloud may set cookies when enabled. These are governed by their own privacy policies.</p>

    <h2>Updates</h2>
    <p>We may update this policy from time to time. The effective date at the top will reflect the latest version.</p>

    <h2>Contact</h2>
    <p>Email: ramatlotlo7@gmail.com</p>
  </LegalPage>
);

export default CookiePolicy;
