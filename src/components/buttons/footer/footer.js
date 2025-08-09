import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- useNavigate import
import SocialLinks from '../../buttons/social-links/social-links';
import './footer.css';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const navigate = useNavigate(); // <-- initialize navigate

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          {/* Changed from <Link> to <div> with navigate */}
          <div
            className="footer-item footer-brand"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')} // programmatic navigation
          >
            PHEE
          </div>

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

      {/* Modals stay exactly the same */}
      {showPrivacy && (
        <div className="modal-backdrop" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <div className="modal-body">
              <p>Your Privacy Policy text goes here...</p>
            </div>
            <button
              className="modal-close"
              onClick={() => setShowPrivacy(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="modal-backdrop" onClick={() => setShowCancel(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cancellation Policy</h2>
            <div className="modal-body">
              <p>Your Cancellation Policy text goes here...</p>
            </div>
            <button
              className="modal-close"
              onClick={() => setShowCancel(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
