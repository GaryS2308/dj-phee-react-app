'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './primary-nav.css';

const SERVICE_LINKS = [
  {
    href: '/wedding-dj-cape-town',
    label: 'Wedding DJ',
    description: 'Ceremony, canapes and reception sets'
  },
  {
    href: '/corporate-dj-cape-town',
    label: 'Corporate DJ',
    description: 'Launches, year-end functions and company events'
  },
  {
    href: '/event-dj-cape-town',
    label: 'Event DJ',
    description: 'Private parties, brand activations and special occasions'
  }
];

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
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef(null);

  const isServiceActive = SERVICE_LINKS.some((l) => l.href === pathname);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`primary-nav primary-nav--${resolvedVariant}`} aria-label="Primary">
        <div className="primary-nav__bar">
          <Link href="/" className="primary-nav__brand">
            PHEE
          </Link>
          <div className="primary-nav__links">
            {NAV_LINKS.filter((link) => link.href !== '/').slice(0, 1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`primary-nav__top-link${pathname === link.href ? ' is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}

            <div
              className={`nav-services${servicesOpen ? ' is-open' : ''}${isServiceActive ? ' is-active' : ''}`}
              ref={servicesRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
              onFocus={() => setServicesOpen(true)}
              onBlur={(event) => {
                if (!servicesRef.current?.contains(event.relatedTarget)) {
                  setServicesOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="nav-services__trigger primary-nav__top-link"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                aria-controls="primary-nav-services-menu"
                onClick={() => setServicesOpen((o) => !o)}
              >
                Services
                <span className="nav-services__chevron" aria-hidden="true" />
              </button>
              <div
                id="primary-nav-services-menu"
                className="nav-services__dropdown"
                role="menu"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setServicesOpen(false);
                  }
                }}
              >
                <p className="nav-services__eyebrow">Cape Town bookings</p>
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-services__item${pathname === link.href ? ' is-active' : ''}`}
                    role="menuitem"
                  >
                    <span className="nav-services__item-title">{link.label}</span>
                    <span className="nav-services__item-copy">{link.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            {NAV_LINKS.filter((link) => link.href !== '/').slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`primary-nav__top-link${pathname === link.href ? ' is-active' : ''}`}
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
          onClick={() => setMenuOpen((o) => !o)}
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
          <button type="button" className="primary-nav__close" onClick={() => setMenuOpen(false)}>
            Close
          </button>
          <div className="primary-nav__overlay-links">
            <Link
              href="/"
              className={pathname === '/' ? 'is-active' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/bio"
              className={pathname === '/bio' ? 'is-active' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Bio
            </Link>

            {/* Services group in mobile menu */}
            <div className="overlay-services">
              <span className="overlay-services__label">Services</span>
              <div className="overlay-services__links">
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`overlay-services__item${pathname === link.href ? ' is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {NAV_LINKS.filter((l) => l.href !== '/' && l.href !== '/bio').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'is-active' : undefined}
                onClick={() => setMenuOpen(false)}
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
