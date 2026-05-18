'use client';

import React from 'react';
import Link from 'next/link';
import { getOptimizedCloudinaryUrl, usePheeGalleryImages } from '../../shared/usePheeGalleryImages';

const GalleryPage = () => {
  const images = usePheeGalleryImages();
  const featuredImages = images.slice(0, 3);
  const galleryImages = images.length > 3 ? images.slice(3) : images;
  const galleryTags = ['Weddings', 'Corporate Events', 'Private Parties', 'Club Sets', 'Brand Activations'];

  return (
    <section id="gallery" className="gallery-page reveal-scope">
      <div className="gallery-inner">
        <div className="gallery-intro" data-reveal data-reveal-order="0">
          <div className="gallery-intro__copy">
            <p className="gallery-eyebrow">Cape Town Event Gallery</p>
            <h2>Real rooms, real crowds, real moments</h2>
            <p className="gallery-lead">
              A quick look through the gallery gives you a feel for the range of events PHEE plays across Cape Town and the Western Cape. You will see wedding receptions, private celebrations, corporate functions, nightlife sets and branded events, each with its own crowd, pace and atmosphere.
            </p>
            <div className="gallery-tags" aria-label="Gallery categories">
              {galleryTags.map((tag) => (
                <span key={tag} className="gallery-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="gallery-note">
            <h3>What the gallery shows</h3>
            <p>
              The common thread is not one genre or one venue. It is the ability to read very different rooms and make each one feel alive in its own way.
            </p>
            <p>
              You will see dance-floor energy, elegant wedding moments, polished corporate settings and smaller celebrations that still feel full of character.
            </p>
          </aside>
        </div>

        {featuredImages.length ? (
          <div className="gallery-featured" data-reveal data-reveal-order="1">
            {featuredImages.map((img, index) => (
              <div
                key={`${img.src}-${index}`}
                className={`gallery-featured__item gallery-featured__item--${index + 1}`}
              >
                <img
                  src={getOptimizedCloudinaryUrl(img.src, { width: 1200, height: 1200 })}
                  srcSet={`${getOptimizedCloudinaryUrl(img.src, { width: 480, height: 560 })} 480w, ${getOptimizedCloudinaryUrl(img.src, { width: 720, height: 840 })} 720w, ${getOptimizedCloudinaryUrl(img.src, { width: 1200, height: 1200 })} 1200w`}
                  sizes="(max-width: 900px) 100vw, 33vw"
                  alt={img.alt || 'DJ PHEE performing at a Cape Town event'}
                  loading="lazy"
                  width="1200"
                  height="1200"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-placeholder gallery-placeholder--featured" data-reveal data-reveal-order="1">
            <div className="gallery-tile" aria-hidden="true"></div>
            <div className="gallery-tile" aria-hidden="true"></div>
            <div className="gallery-tile" aria-hidden="true"></div>
          </div>
        )}

        <div className="gallery-story" data-reveal data-reveal-order="2">
          <div className="gallery-story__heading">
            <h3>A clearer picture of the work</h3>
          </div>
          <div className="gallery-story__copy">
            <p>
              PHEE plays very different kinds of events, from rooftop parties and private bookings to wedding receptions, year-end functions and club nights. That variety matters because clients are rarely looking for a DJ in the abstract. They want someone who can fit their room, their crowd and the kind of atmosphere they are trying to create.
            </p>
            <p>
              You will spot venues and settings that feel recognisably Cape Town, from polished city events to more relaxed celebrations that open up later in the night. If the style here feels close to what you are planning, the <Link href="/booking">booking page</Link> is the next step.
            </p>
          </div>
        </div>

        {galleryImages.length ? (
          <div className="gallery-grid">
            {galleryImages.map((img, index) => (
              <img
                key={`${img.src}-${index}`}
                src={getOptimizedCloudinaryUrl(img.src, { width: 1000, height: 1200 })}
                srcSet={`${getOptimizedCloudinaryUrl(img.src, { width: 360, height: 480 })} 360w, ${getOptimizedCloudinaryUrl(img.src, { width: 600, height: 800 })} 600w, ${getOptimizedCloudinaryUrl(img.src, { width: 900, height: 1200 })} 900w`}
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 360px"
                alt={img.alt || 'DJ PHEE performing at a Cape Town event'}
                loading="lazy"
                width="900"
                height="1200"
              />
            ))}
          </div>
        ) : (
          <div className="gallery-placeholder">
            <div className="gallery-tile" aria-hidden="true"></div>
            <div className="gallery-tile" aria-hidden="true"></div>
            <div className="gallery-tile" aria-hidden="true"></div>
          </div>
        )}

        <div className="gallery-cta" data-reveal data-reveal-order="3">
          <h3>Planning an event with a similar feel?</h3>
          <p>
            If you want the music to feel this considered in your own space, send through your event details and PHEE will come back with availability and a tailored quote.
          </p>
          <Link href="/booking#booking" className="cta-button gallery-cta__button">
            BOOK NOW
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPage;
