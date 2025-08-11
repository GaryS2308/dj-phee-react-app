import React from 'react';
import './HeroSection.css';


const HeroSection = () => {
  const scrollToBooking = (e) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero">
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="https://res.cloudinary.com/dea6wzxd8/video/upload/v1754915471/phee-dj-video-1_hsfjz1.mp4" type="video/mp4" />  
      </video>
      <div className="overlay">
        <h1>PHEE </h1>
        <h2>clubs, events, dances, weddings, coffee shops, anywhere with a speaker</h2>
        <a href="#/booking" onClick={scrollToBooking} className="cta-button">BOOK NOW</a>
        
      
      </div>
    </div>
  );
};

export default HeroSection;