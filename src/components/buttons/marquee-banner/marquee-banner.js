import React from 'react';
import '../../buttons/marquee-banner/marquee-banner.css';

const MarqueeBanner = () => {
  const places = [
    'HALO NIGHTCLUB',
    'MODULAR',
    'DEUS EX MACHINA',
    'CAPRICE',
    'RITAS',
    'THE VILLAGE IDIOT',
    'ARCADE',
    'FOOLS GOLD',
    'DESTINY',
    'RED BULL UNLOCKED',
    'Nice Cafe',
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {[...places, ...places].map((place, index) => (
  <div className="marquee-item" key={index}>
    📍 {place}
  </div>
))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
