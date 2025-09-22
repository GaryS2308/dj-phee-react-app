import React, { useEffect, useState } from 'react';
import { Helmet} from 'react-helmet-async';
import './HeroSection.css';

const HeroSection = () => {
  const [videoReady, setVideoReady] = useState(false);

  const scrollToBooking = (e) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const video = document.getElementById('hero-video');
    if (!video) return;

    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Failed due to autoplay policy; wait for user gesture
        });
      }
    };

    attemptPlay();

    let resumed = false;
    const resumeOnGesture = () => {
      if (resumed) return;
      resumed = true;
      attemptPlay();
    };

    document.addEventListener('pointerdown', resumeOnGesture, { once: true });
    document.addEventListener('touchstart', resumeOnGesture, { once: true });

    return () => {
      document.removeEventListener('pointerdown', resumeOnGesture);
      document.removeEventListener('touchstart', resumeOnGesture);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>DJ Phee</title>
        <meta
          name="description"
          content="DJ Phee - professional DJ for clubs, events, weddings, coffee shops, and anywhere with a speaker. Bringing unforgettable vibes to your event."
        />
      </Helmet>

      <section className={`hero ${videoReady ? 'video-ready' : ''}`} id="hero">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="bg-video"
          poster="https://res.cloudinary.com/dea6wzxd8/image/upload/v1758540552/Phee_background_photo_fbayer.png"
          id="hero-video"
          onPlaying={() => setVideoReady(true)}
        >
          <source
            src="https://res.cloudinary.com/dea6wzxd8/video/upload/v1754915471/phee-dj-video-1_hsfjz1.mp4"
            type="video/mp4"
          />
        </video>
        <div className="overlay">
          <div className="hero-copy" data-reveal data-reveal-order="0">
            <h1 data-reveal data-reveal-order="1">PHEE</h1>
            <h2 data-reveal data-reveal-order="2">clubs, events, dances, weddings, coffee shops, anywhere with a speaker</h2>
          </div>
          <div className="hero-cta">
            <a href="#booking" onClick={scrollToBooking} className="cta-button">
              BOOK NOW
            </a>
            <button
              type="button"
              className="scroll-indicator"
              onClick={scrollToBooking}
              aria-label="Scroll to booking"
            >
              <span className="chevron" aria-hidden="true"></span>
              <span className="chevron" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
