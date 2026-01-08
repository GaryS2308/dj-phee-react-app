import React from 'react';
import SocialLinks from '../../buttons/social-links/social-links';
import './footer.css';

const Footer = () => {

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          <a href="/" className="footer-item footer-brand">
            PHEE
          </a>

          <div className="footer-item footer-legal">
            <a href="/privacy" className="footer-legal-link">Privacy</a>
            <a href="/cookies" className="footer-legal-link">Cookies</a>
            <a href="/terms" className="footer-legal-link">Terms</a>
            <a href="/cancellation" className="footer-legal-link">Cancellation</a>
          </div>

          <div className="footer-item footer-social">
            <SocialLinks />
          </div>
        </div>
        <p className="footer-credit">Website designed by Gary Strybis</p>
      </footer>
    </>
  );
};

export default Footer;
