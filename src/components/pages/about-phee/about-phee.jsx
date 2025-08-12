import React from 'react';
import { Helmet } from 'react-helmet-async';
import './about-phee.css';

const AboutPhee = () => {
  const images = [
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416287/phee2_ogysjy.jpg", alt: "DJPhee DJing" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/phee1_of7hnv.jpg", alt: "DJPhee at Event" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/phee4_dmdhvv.jpg", alt: "DJPhee Performing" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png", alt: "DJPhee on Decks" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/phee3_g7ybop.jpg", alt: "DJPhee with Crowd" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754907611/phee6_qfq0by.jpg", alt: "DJPhee in Action" }
  ];

  return (
    <>
      <Helmet>
        <title>About DJ Phee - Versatile Afrotech DJ</title>
        <meta
          name="description"
          content="Learn about DJ Phee, a versatile Afrotech DJ known for unforgettable vibes at clubs, weddings, coffee shops, and festivals. Discover his unique style and energy."
        />
      </Helmet>

      <section id="about-phee">
        <h2>ABOUT PHEE</h2>
        <p>
          Phee is a versatile DJ rooted in the pulsating rhythms of Afrotech. With an ear for energy and a talent for reading any room, he brings unforgettable vibes to clubs, weddings, coffee shops, and festivals, effortlessly blending genres to suit every crowd.
        </p>

        <div className="phee-gallery">
          {images.map((img, index) => (
            <img key={index} src={img.src} alt={img.alt} />
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutPhee;
