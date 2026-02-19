'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

const GalleryPage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          const aboutImages = Array.isArray(fetchedData?.aboutImages) ? fetchedData.aboutImages : [];
          setImages(aboutImages.slice(4));
        } else {
          console.error('No document found!');
        }
      } catch (error) {
        console.error('Error fetching Gallery images:', error);
      }
    };

    fetchGalleryImages();
  }, []);

  const getOptimizedCloudinaryUrl = (url, { width, height }) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const transformation = `f_auto,q_auto,dpr_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_fill,g_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  };

  return (
    <section id="gallery" className="gallery-page">
      <div className="gallery-inner">
        <h2>GALLERY</h2>
        <p className="gallery-lead">
          High-energy moments from DJ Phee’s performances across Cape Town, from weddings and corporate events to clubs, private functions, and festival stages.
          <br />
          <br />
          A curated look at DJ Phee in action. Real crowds, real venues, and real energy. These highlights capture the Afro tech driven sound and versatile style that keep dance floors moving at every type of event.
          <br />
          <br />
          
        </p>
        {images.length ? (
          <div className="gallery-grid">
            {images.map((img, index) => (
              <img
                key={index}
                src={getOptimizedCloudinaryUrl(img.src, { width: 1000, height: 1200 })}
                srcSet={`${getOptimizedCloudinaryUrl(img.src, { width: 360, height: 480 })} 360w, ${getOptimizedCloudinaryUrl(img.src, { width: 600, height: 800 })} 600w, ${getOptimizedCloudinaryUrl(img.src, { width: 900, height: 1200 })} 900w`}
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 360px"
                alt={img.alt}
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
      </div>
    </section>
  );
};

export default GalleryPage;
