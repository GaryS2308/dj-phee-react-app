import React from 'react';
import LegalPage from './LegalPage';

const CancellationPage = () => (
  <LegalPage
    title="Cancellation Policy"
    description="Cancellation terms for bookings with PHEE."
  >
    <p><strong>Effective date:</strong> 2025-09-22</p>

    <ol>
      <li>
        <p><strong>Free cancellation:</strong> You may cancel free of charge up to 24 hours before the event.</p>
      </li>
      <li>
        <p><strong>Partial fee:</strong> Cancellations between 24 hours and 6 hours before the event incur a 50% fee.</p>
      </li>
      <li>
        <p><strong>Full fee:</strong> Cancellations less than 6 hours before the event are charged in full.</p>
      </li>
      <li>
        <p><strong>On-arrival cancellation:</strong> If services are canceled after arrival, the full fee applies.</p>
      </li>
      <li>
        <p><strong>Payment terms:</strong> Any applicable fees are invoiced and due per your booking agreement.</p>
      </li>
    </ol>

    <h2>Contact</h2>
    <p>Email: ramatlotlo7@gmail.com</p>
  </LegalPage>
);

export default CancellationPage;
