import React from 'react';
import Link from 'next/link';
import SocialLinks from '../../buttons/social-links/social-links';

const Footer = () => {

  return (
    <>
      <footer className="footer">
        <div className="footer-top">
          <a href="/" className="footer-item footer-brand">
            PHEE
          </a>

          <nav className="footer-item footer-nav" aria-label="Primary">
          </nav>

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
        <p className="footer-credit">Website designed by <a href="https://strydes.co.za" target="_blank" rel="noopener noreferrer" className="footer-credit-link"><img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1772612263/Stylish_metallic_S_and_D_logo_lkqfmr.png" alt="Strydes" className="footer-strydes-logo" /> Strydes</a></p>
      </footer>
    </>
  );
};

export default Footer;
