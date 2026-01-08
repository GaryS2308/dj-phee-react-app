import React from 'react';
import LegalPage from './LegalPage';

const TermsPage = () => (
  <LegalPage
    title="Terms and Conditions"
    description="Terms for booking and using the PHEE website."
  >
    <p><strong>Effective date:</strong> 2025-09-22</p>

    <h2>Summary</h2>
    <ol>
      <li>You submit a booking request and we confirm availability.</li>
      <li>Your personal info (name, phone, email) is treated as private and not sold.</li>
      <li>You are responsible for ensuring the venue is safe and ready.</li>
      <li>Unforeseen events (weather, load-shedding, emergencies) may affect performance.</li>
      <li>We are not liable for losses outside our control.</li>
      <li>By using this site, you agree to these terms.</li>
    </ol>

    <h2>Official terms</h2>
    <ol>
      <li>
        <p><strong>Bookings</strong></p>
        <ol>
          <li>All bookings are subject to availability and are confirmed only in writing.</li>
          <li>You must provide accurate information in the booking form.</li>
          <li>We reserve the right to decline or cancel a booking at our discretion.</li>
        </ol>
      </li>
      <li>
        <p><strong>Payments and cancellations</strong></p>
        <ol>
          <li>Payment terms are provided upon booking confirmation.</li>
          <li>Our cancellation policy applies to all confirmed bookings.</li>
        </ol>
      </li>
      <li>
        <p><strong>Event conditions</strong></p>
        <ol>
          <li>The client must ensure the venue meets technical and safety requirements.</li>
          <li>We are not liable for delays or cancellations caused by events beyond our control.</li>
          <li>PHEE may refuse to perform in unsafe or illegal conditions.</li>
        </ol>
      </li>
      <li>
        <p><strong>Liability</strong></p>
        <ol>
          <li>We are not liable for loss, damage, injury, or expense arising from the booking or use of the site.</li>
          <li>To the fullest extent permitted by law, we disclaim all warranties.</li>
        </ol>
      </li>
      <li>
        <p><strong>Data protection and privacy</strong></p>
        <ol>
          <li>We collect personal information only to manage your booking.</li>
          <li>We do not sell, rent, or misuse your personal data.</li>
          <li>We use reasonable security measures but cannot guarantee absolute security.</li>
        </ol>
      </li>
      <li>
        <p><strong>Intellectual property</strong></p>
        <ol>
          <li>All site content is the property of PHEE or its licensors.</li>
          <li>You may not copy or redistribute content without written consent.</li>
        </ol>
      </li>
      <li>
        <p><strong>Website use</strong></p>
        <ol>
          <li>You agree not to use this site for unlawful purposes or to disrupt service.</li>
          <li>We may update these terms at any time without prior notice.</li>
        </ol>
      </li>
      <li>
        <p><strong>Governing law</strong></p>
        <p>These terms are governed by the laws of South Africa.</p>
      </li>
    </ol>

    <h2>Contact</h2>
    <p>Email: ramatlotlo7@gmail.com</p>
  </LegalPage>
);

export default TermsPage;
