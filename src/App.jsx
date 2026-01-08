// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import HeroSection from './components/pages/home/HeroSection';
import PastEvents from './components/pages/past-events/past-events';
import AboutPhee from './components/pages/about-phee/about-phee';
import WherePheePerforms from './components/pages/home/WherePheePerforms';
import BookingForm from './components/pages/booking-form/BookingForm';
import BookingResponse from './components/pages/booking-response/booking-response'; // make sure this path is correct
import './styles/styles.css';
import LinksPage from './components/pages/links-page/links-page'; 
import { useScrollReveal } from './utils/useScrollReveal';
import { useLoadAnalyticsScripts } from './utils/useLoadAnalyticsScripts';
import { initAnalytics } from './firebase';
import { loadGTM } from './utils/loadGTM';
import { getConsent } from './utils/consent';
import ConsentBanner from './components/banners/ConsentBanner';
import PrivacyPolicy from './components/pages/legal/PrivacyPolicy';
import CookiePolicy from './components/pages/legal/CookiePolicy';
import TermsPage from './components/pages/legal/TermsPage';
import CancellationPage from './components/pages/legal/CancellationPage';


const HomePage = ({ sectionId }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let timeoutId;
    let attempts = 0;

    const scrollToSection = () => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 20) {
        attempts += 1;
        timeoutId = window.setTimeout(scrollToSection, 150);
      }
    };

    scrollToSection();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [sectionId]);

  return (
    <>
      <HeroSection />
      <AboutPhee />
      <PastEvents />
      <WherePheePerforms />
      <BookingForm />
    </>
  );
};


const App = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const redirect = sessionStorage.redirect;
    if (redirect) {
      delete sessionStorage.redirect;
      const url = new URL(redirect, window.location.origin);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }, []);

  const [consent, setConsent] = useState(() => getConsent());
  const consentGranted = consent === 'accepted';

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleConsentChange = (event) => {
      if (event && event.detail) {
        setConsent(event.detail);
      } else {
        setConsent(getConsent());
      }
    };
    window.addEventListener('phee-consent-change', handleConsentChange);
    return () => window.removeEventListener('phee-consent-change', handleConsentChange);
  }, []);

  useScrollReveal();
  useLoadAnalyticsScripts(consentGranted);
  useEffect(() => {
    if (!consentGranted) return undefined;
    const timer = window.setTimeout(() => {
      initAnalytics();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [consentGranted]);

  useEffect(() => {
    if (!consentGranted) return undefined;
    if (typeof window === 'undefined') return undefined;
    let loaded = false;
    const fireGTM = () => {
      if (loaded) return;
      loaded = true;
      loadGTM();
    };

    const idleHandle =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(() => fireGTM(), { timeout: 2500 })
        : window.setTimeout(fireGTM, 2500);

    const onInteract = () => fireGTM();
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      if (typeof idleHandle === 'number') {
        window.clearTimeout(idleHandle);
      } else if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [consentGranted]);

  return (
  <HelmetProvider> 
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<HomePage sectionId="about-phee" />} />
        <Route path="/past-events" element={<HomePage sectionId="past-events" />} />
        <Route path="/booking" element={<HomePage sectionId="booking" />} />
        <Route path="/response" element={<BookingResponse />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cancellation" element={<CancellationPage />} />
      </Routes>
      <ConsentBanner />
    </Router>
  </HelmetProvider>
  );
};

export default App;
