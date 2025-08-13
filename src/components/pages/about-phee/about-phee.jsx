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
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1754907611/phee6_qfq0by.jpg", alt: "DJPhee in Action" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1755076091/phee7_sfiwkd.jpg", alt: "DJPhee at Festival" },
    { src: "https://res.cloudinary.com/dea6wzxd8/image/upload/v1755076092/phee8_wi2s8x.jpg", alt: "DJPhee Backstage" }

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
          Phee is a Cape Town based DJ, originally from Johannesburg, making waves in the South African music scene with his signature blend of deep, hypnotic Afrotech rhythms and high-energy Electronic beats.
          Known for reading the crowd and creating unforgettable atmospheres, DJ Phee brings his sound to Cape Town’s hottest clubs, intimate restaurants, vibey coffee shops, and high-profile private events. From matric dances to exclusive parties and festivals, he transforms every set into a journey, keeping the dance floor alive from the first beat to the last.
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
