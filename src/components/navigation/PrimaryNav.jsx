'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './primary-nav.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/bio', label: 'Bio' },
  { href: '/past-events', label: 'Past Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/booking', label: 'Booking' }
];

const PrimaryNav = ({ variant }) => {
  const pathname = usePathname();
  const resolvedVariant = variant || (pathname === '/' ? 'home' : 'default');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleToggle = () => {
    setMenuOpen((open) => !open);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`primary-nav primary-nav--${resolvedVariant}`} aria-label="Primary">
        <div className="primary-nav__bar">
          <Link href="/" className="primary-nav__brand">
            PHEE
          </Link>
          <div className="primary-nav__links">
            {NAV_LINKS.filter((link) => link.href !== '/').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'is-active' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="primary-nav__burger"
          aria-expanded={menuOpen}
          aria-controls="primary-nav-menu"
          onClick={handleToggle}
        >
          <span className="primary-nav__burger-box" aria-hidden="true">
            <span className="primary-nav__burger-line" />
            <span className="primary-nav__burger-line" />
            <span className="primary-nav__burger-line" />
          </span>
          <span className="sr-only">Toggle menu</span>
        </button>
      </nav>

      <div
        id="primary-nav-menu"
        className={`primary-nav__overlay ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="primary-nav__overlay-inner">
          <button type="button" className="primary-nav__close" onClick={handleClose}>
            Close
          </button>
          <div className="primary-nav__overlay-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'is-active' : undefined}
                onClick={handleClose}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrimaryNav;
