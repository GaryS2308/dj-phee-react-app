import React from 'react';

const defaultPlaces = [
  'CABO BEACH CLUB',  
  'HALO NIGHTCLUB',
    'MODULAR',
    'DEUS EX MACHINA',
    'CAFE CAPRICE',
    'RITAS',
    'THE VILLAGE IDIOT',
    'ARCADE',
    'FOOLS GOLD',
    'DESTINY',
    'RED BULL UNLOCKED',
    'NICE CAFE',
    'SAINTS ST FRANCIS',
];

const MarqueeBanner = ({ items = defaultPlaces, flush = false }) => {
  const marqueeItems = items.length ? items : defaultPlaces;

  return (
    <div className={`marquee-container${flush ? ' marquee-container--flush' : ''}`}>
      <div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((place, index) => (
  <div className="marquee-item" key={index}>
    📍 {place}
  </div>
))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
