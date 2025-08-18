// App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import {Helmet, HelmetProvider} from 'react-helmet-async';

import HeroSection from './components/pages/home/HeroSection';
import PastEvents from './components/pages/past-events/past-events';
import AboutPhee from './components/pages/about-phee/about-phee';
import BookingForm from './components/pages/booking-form/BookingForm';
import BookingResponse from './components/pages/booking-response/booking-response'; // make sure this path is correct
import './styles/styles.css';
import LinksPage from './components/pages/links-page/links-page'; 


const HomePage = () => (
  <>
    <HeroSection />
    <AboutPhee />
    <PastEvents />
    <BookingForm />
  </>
);


const App = () => {
  return (
  <HelmetProvider> 
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/response" element={<BookingResponse />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/past-events" element={<PastEvents />} />
        <Route path="/about" element={<AboutPhee />} />
        <Route path="/booking" element={<BookingForm />} />

      </Routes>
    </Router>
  </HelmetProvider>
  );
};

export default App;
