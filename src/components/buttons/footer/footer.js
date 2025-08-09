import React, { useState } from 'react';
import SocialLinks from '../../buttons/social-links/social-links';
import './footer.css';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          <a href="/" className="footer-item footer-brand">
            PHEE
          </a>

          <button
            className="footer-item footer-link"
            onClick={() => setShowPrivacy(true)}
          >
            Privacy Policy
          </button>

          <button
            className="footer-item footer-link"
            onClick={() => setShowCancel(true)}
          >
            Cancellation Policy
          </button>

          <div className="footer-item footer-social">
            <SocialLinks />
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-backdrop" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <div className="modal-body">
              <p>Your Privacy Policy text goes here...</p>
            </div>
            <button className="modal-close" onClick={() => setShowPrivacy(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Cancellation Policy Modal */}
      {showCancel && (
  <div className="modal-backdrop" onClick={() => setShowCancel(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2>Cancellation Policy</h2>
      <div className="modal-body">
        <ol style={{ paddingLeft: '20px', marginTop: 0 }}>
          <li>
            <p><strong>Free Cancellation:</strong><br />Customers may cancel their booking free of charge up to 24 hours prior to the scheduled event date and time.</p>
          </li>
          <li>
            <p><strong>Partial Cancellation Fee:</strong><br />Cancellations made between 24 hours and 6 hours before the event date and time will incur a cancellation fee equal to 50% of the booking cost.
            </p>
          </li>
          <li>
            <p>
              <strong>Full Cancellation Fee:</strong><br />
              Cancellations made less than 6 hours before the event date and time will be charged the full booking cost.
            </p>
          </li>
          <li>
            <p>
              <strong>On-Arrival Cancellation:</strong><br />
              If DJ Phee arrives at the event location and the client cancels or informs that his services are no longer required, the full booking cost will apply.
            </p>
          </li>
          <li>
            <p>
              <strong>Payment Terms:</strong><br />
              Any applicable cancellation fees will be invoiced accordingly and must be settled within the terms outlined in your booking agreement.
            </p>
          </li>
        </ol>
      </div>
      <button className="modal-close" onClick={() => setShowCancel(false)}>Close</button>
    </div>
  </div>
)}
    </>
  );
};

export default Footer;
