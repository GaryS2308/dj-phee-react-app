import React from 'react';
import './HeroSection.css';
import SocialLinks from '../../buttons/social-links/social-links'; // ✅ Add this

const HeroSection = () => {
  return (
    <div className="hero">
      <video autoPlay muted loop className="bg-video">
        <source src="https://res.cloudinary.com/dea6wzxd8/video/upload/v1754336431/dj-video_pdpmey.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>
      <div className="overlay">
        <h1>PHEE </h1>
        <h2>clubs, events, dances, weddings, coffee shops, anywhere with a</h2>
        <a href="#booking" className="cta-button">Book Now</a>
        
      
      </div>
    </div>
  );
};

export default HeroSection;