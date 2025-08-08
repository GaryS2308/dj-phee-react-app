import React, { useState } from 'react';
import SocialLinks from '../../buttons/social-links/social-links'; // Adjust the import path as needed
import './footer.css';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-item footer-brand">PHEE</div>

          <button className="footer-item footer-link" onClick={() => setShowPrivacy(true)}>
            Privacy Policy
          </button>

          <button className="footer-item footer-link" onClick={() => setShowCancel(true)}>
            Cancellation Policy
          </button>

          <div className="footer-item footer-social">
            <SocialLinks />
          </div>
        </div>

        <div className="footer-bio">
          'clubs, events, dances, weddings, coffee shops, anywhere with a speaker'
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-backdrop" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <div className="modal-body">
              {/* Add your Privacy Policy content here */}
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
              {/* Add your Cancellation Policy content here */}
              <p>Your Cancellation Policy text goes here...</p>
            </div>
            <button className="modal-close" onClick={() => setShowCancel(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
