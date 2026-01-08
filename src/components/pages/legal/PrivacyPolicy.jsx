import React from 'react';
import LegalPage from './LegalPage';

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    description="How PHEE collects, uses, and protects personal information."
  >
    <p><strong>Effective date:</strong> 2025-09-22</p>

    <h2>Who we are</h2>
    <p>PHEE is a professional DJ service based in Cape Town, South Africa. If you have questions about this policy, contact us at ramatlotlo7@gmail.com.</p>

    <h2>Information we collect</h2>
    <ul>
      <li>Booking details you submit (name, email, phone, event type, date, time, location, and notes).</li>
      <li>Usage data and analytics (pages visited, device information, and general location) if you consent to analytics cookies.</li>
    </ul>

    <h2>How we use your information</h2>
    <ul>
      <li>To respond to booking requests and manage your event details.</li>
      <li>To send booking-related messages and confirmations.</li>
      <li>To improve the website and measure performance if you opt in to analytics.</li>
    </ul>

    <h2>Sharing and service providers</h2>
    <p>We use trusted service providers to run the website and deliver services. These may include:</p>
    <ul>
      <li>Firebase (database and hosting).</li>
      <li>EmailJS (sending booking-related emails).</li>
      <li>Google Analytics and Google Tag Manager (analytics, only with consent).</li>
      <li>Cloudinary (image delivery) and SoundCloud embeds (media playback).</li>
    </ul>
    <p>We do not sell your personal information.</p>

    <h2>Data retention</h2>
    <p>We keep booking data only as long as needed to manage the relationship, comply with legal obligations, and resolve disputes.</p>

    <h2>Your choices</h2>
    <ul>
      <li>You can opt out of analytics cookies at any time by changing your cookie consent.</li>
      <li>You can request access, correction, or deletion of your data by emailing us.</li>
    </ul>

    <h2>Security</h2>
    <p>We use reasonable security measures to protect your information. No system is 100% secure, and we cannot guarantee absolute security.</p>

    <h2>Updates</h2>
    <p>We may update this policy from time to time. The effective date at the top will reflect the latest version.</p>

    <h2>Contact</h2>
    <p>Email: ramatlotlo7@gmail.com</p>
  </LegalPage>
);

export default PrivacyPolicy;
