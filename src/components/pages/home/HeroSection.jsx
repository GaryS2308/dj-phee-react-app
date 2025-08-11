import React from 'react';
import './HeroSection.css';


const HeroSection = () => {
  return (
    <div className="hero">
      <video autoPlay muted loop className="bg-video">
        <source src="https://res.cloudinary.com/dea6wzxd8/video/upload/v1754336431/dj-video_pdpmey.mp4" type="video/mp4" />
        
      </video>
      <div className="overlay">
        <h1>PHEE </h1>
        <h2>clubs, events, dances, weddings, coffee shops, anywhere with a speaker</h2>
        <a href="#booking" onClick={scrollToBooking} className="cta-button">BOOK NOW</a>
        
      
      </div>
    </div>
  );
};

export default HeroSection;