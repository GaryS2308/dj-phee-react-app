import React from 'react';
import './HeroSection.css';


const player = cloudinary.player('player', {
  cloudName: 'dea6wzxd8',
  publicId: 'phee-dj-video-1_hsfjz1',
  profile: 'gary1'
});

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
      <video autoPlay muted loop className="bg-video">
        <source src="https://player.cloudinary.com/embed/?cloud_name=dea6wzxd8&public_id=phee-dj-video-1_hsfjz1&profile=gary1" type="video/mp4" />
        
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