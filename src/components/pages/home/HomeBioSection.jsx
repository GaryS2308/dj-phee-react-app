import React from 'react';
import Link from 'next/link';

const HomeBioSection = () => {
  return (
    <section id="home-bio" className="reveal-scope">
      <div className="home-bio__inner">
        <div className="home-bio__copy" data-reveal data-reveal-order="0">
          <h2>MEET DJ PHEE</h2>
          <p>
            DJ PHEE is a Cape Town-based Afrotech and electronic DJ delivering high-energy sets for corporate
            events, clubs, festivals, weddings and private parties. As a professional DJ in Cape Town, he brings
            crisp transitions, deep grooves and a steady, crowd-first presence to every booking.
          </p>
          <p>
            Known for reading the room and keeping dance floors locked in, PHEE blends warmth and precision with
            a bold, forward sound that feels both polished and personal.
          </p>
          <p>
            Available for events across South Africa and open to international bookings, the approach stays the
            same wherever the gig takes him, read the room, set the energy and keep it building till the lights come on. From intimate
            Cape Town celebrations to festival stages at Balito rage and touring bookings abroad, each set is shaped around the
            moment and the crowd.
          </p>
          <p>
            If you have your event in mind, get in touch via the <Link href="/booking" className="home-bio__link">booking form</Link>.
            South African and international enquiries are welcome.
          </p>
        </div>
        <div className="home-bio__stack">
          <div className="home-bio__photo-wrap" data-reveal data-reveal-order="1">
            <img
              src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416288/phee1_of7hnv.jpg"
              alt="DJ PHEE performing"
              loading="lazy"
              width="640"
              height="820"
            />
          </div>
          <div className="home-bio__social" data-reveal data-reveal-order="2">
            <h3>FOLLOW PHEE</h3>
            <div className="home-bio__links">
              <a href="https://instagram.com/__phee__" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://soundcloud.com/phemelo-ramatlotlo-122152686" target="_blank" rel="noopener noreferrer">
                SoundCloud
              </a>
              <a href="/past-events#live-mixes">
                Live Mixes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBioSection;
