'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const HeroSection = () => {
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);
  const scrollToNextSection = (e) => {
    e.preventDefault();
    const nextSection = document.getElementById('home-bio');
    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
  };

  // ONE optimized asset used for CSS bg + poster (prevents duplicated downloads)
  const heroPosterMobile =
    'https://res.cloudinary.com/dea6wzxd8/image/upload/f_auto,q_auto,dpr_auto,w_900/v1758540552/Phee_background_photo_fbayer.png';
  const heroPosterDesktop =
    'https://res.cloudinary.com/dea6wzxd8/image/upload/f_auto,q_auto,dpr_auto,w_1440/v1758540552/Phee_background_photo_fbayer.png';

  const heroVideoSrc =
    'https://res.cloudinary.com/dea6wzxd8/video/upload/v1754915471/phee-dj-video-1_hsfjz1.mp4';

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let hasPlayed = false;

    const attemptPlay = () => {
      if (!videoRef.current || hasPlayed) return;
      if (!shouldLoadVideo) setShouldLoadVideo(true);
      const p = videoRef.current.play();
      if (p && typeof p.then === 'function') {
        p.then(() => (hasPlayed = true)).catch(() => {});
      }
    };

    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener('canplay', handleCanPlay);

    // Desktop: start video quickly but NOT immediately (max 500ms delay)
    if (!isMobile) {
      window.setTimeout(() => {
        attemptPlay();
      }, 450);
    }

    // Mobile: only on first user interaction
    const resumeOnGesture = () => {
      if (hasPlayed) return;
      attemptPlay();
    };

    document.addEventListener('pointerdown', resumeOnGesture, { once: true });
    document.addEventListener('touchstart', resumeOnGesture, { once: true });
    document.addEventListener('scroll', resumeOnGesture, { once: true, passive: true });
    document.addEventListener('keydown', resumeOnGesture, { once: true });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('pointerdown', resumeOnGesture);
      document.removeEventListener('touchstart', resumeOnGesture);
      document.removeEventListener('scroll', resumeOnGesture);
      document.removeEventListener('keydown', resumeOnGesture);
    };
  }, [shouldLoadVideo]);

  return (
    <>
      <section
        className={`hero ${videoReady ? 'video-ready' : ''}`}
        id="hero"
        style={{ '--hero-bg': `url(${heroPosterDesktop})` }}
      >
        <video
          muted
          loop
          playsInline
          className="bg-video"
          poster={heroPosterMobile}
          id="hero-video"
          ref={videoRef}
          preload={shouldLoadVideo ? 'metadata' : 'none'}
        >
          {shouldLoadVideo && <source src={heroVideoSrc} type="video/mp4" />}
        </video>

        <div className="overlay">
          <div className="hero-copy">
            <h1>PHEE</h1>
            <h2>Professional DJ for corporate events, clubs, festivals and private functions in Cape Town.</h2>
          </div>
          <div className="hero-cta">
            <Link href="/booking#booking" className="cta-button">BOOK NOW</Link>
            <button
              type="button"
              className="scroll-indicator"
              onClick={scrollToNextSection}
              aria-label="Scroll to content"
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
