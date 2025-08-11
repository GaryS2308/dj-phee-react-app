// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HeroSection from './components/pages/home/HeroSection';
import PastEvents from './components/pages/past-events/past-events';
import AboutPhee from './components/pages/about-phee/about-phee';
import BookingForm from './components/pages/booking-form/BookingForm';
import BookingResponse from './components/pages/booking-response/booking-response'; // make sure this path is correct
import './styles/styles.css';

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
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/response" element={<BookingResponse />} />
      </Routes>
    </Router>
  );
};

export default App;
