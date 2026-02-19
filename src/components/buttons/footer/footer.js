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
        <p className="footer-credit">Website designed by Gary Strybis</p>
      </footer>
    </>
  );
};

export default Footer;
