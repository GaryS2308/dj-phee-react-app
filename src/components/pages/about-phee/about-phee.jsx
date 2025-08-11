import React from 'react';
import './about-phee.css';

const AboutPhee = () => {
  return (
    <section id="about-phee">
      <h2>ABOUT PHEE</h2>
      <p>
        Phee is a versatile DJ rooted in the pulsating rhythms of Afrotech. With an ear for energy and a talent for reading any room, he brings unforgettable vibes to clubs, weddings, coffee shops, and festivals, effortlessly blending genres to suit every crowd.
      </p>
      <div className="phee-gallery">
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/phee2_ogysjy.jpg" alt="DJPhee DJing" />
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/phee1_of7hnv.jpg" alt="DJPhee at Event" />
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/phee4_dmdhvv.jpg" alt="DJPhee Performing" />
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png" alt="DJPhee on Decks" />
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/phee3_g7ybop.jpg" alt="DJPhee with Crowd" />
        <img src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754907611/phee6_qfq0by.jpg" alt="DJPhee in Action" />
      </div>
    </section>
  );
};

export default AboutPhee;