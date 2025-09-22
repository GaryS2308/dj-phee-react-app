// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import HeroSection from './components/pages/home/HeroSection';
import PastEvents from './components/pages/past-events/past-events';
import AboutPhee from './components/pages/about-phee/about-phee';
import BookingForm from './components/pages/booking-form/BookingForm';
import BookingResponse from './components/pages/booking-response/booking-response'; // make sure this path is correct
import './styles/styles.css';
import LinksPage from './components/pages/links-page/links-page'; 
import { useScrollReveal } from './utils/useScrollReveal';


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
      <BookingForm />
    </>
  );
};


const App = () => {
  useScrollReveal();

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

      </Routes>
    </Router>
  </HelmetProvider>
  );
};

export default App;
