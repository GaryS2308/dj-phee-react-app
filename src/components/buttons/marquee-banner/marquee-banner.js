import React from 'react';
import '../../buttons/marquee-banner/marquee-banner.css';

const MarqueeBanner = () => {
  const places = [
    'Johannesburg',
    'Cape Town',
    'Durban',
    'Stellenbosch',
    'Pretoria',
    'London',
    'Ibiza',
    'Berlin',
    'Soweto',
    'Ballito',
    'Gqeberha',
    'Lisbon',
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {places.map((place, index) => (
          <div className="marquee-item" key={index}>
            📍 {place}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
