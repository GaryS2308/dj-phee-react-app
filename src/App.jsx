import React from 'react';
import HeroSection from './components/pages/home/HeroSection';
import PastEvents from './components/pages/past-events/past-events';
import AboutPhee from './components/pages/about-phee/about-phee';
import BookingForm from './components/pages/booking-form/BookingForm'
import './styles/styles.css';

const App = () => {
  return (
    <div>
      <HeroSection />
      <AboutPhee />
      <PastEvents />
      <BookingForm />
    </div>
  );
};

export default App;