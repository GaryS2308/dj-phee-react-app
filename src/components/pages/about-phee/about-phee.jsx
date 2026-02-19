'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // adjust the path to your firebase config

const AboutPhee = () => {
  const [data, setData] = useState(null);
  const aboutParagraphs = [
    <>
      Phee is a Cape Town–based DJ known for his infectious energy, feel-good presence, and ability to turn any gathering into a proper celebration. Often described as the “Mayor of Cape Town” behind the decks, Phee brings people together through music, greeting everyone with a smile, knowing the room, and creating an atmosphere where guests instantly feel welcome and ready to move. 
      <br />
      <br />
      Specialising in Afrotech, Phee’s sound is driven by rhythm, groove, and high-energy selections that keep dance floors alive. His sets are dynamic, uplifting, and expertly curated to match the moment. Whether it’s a packed club at midnight, a sunset corporate event, or an intimate private celebration.
    </>,
    <>
      While Afrotech sits at the core of his style, Phee is a highly versatile DJ, confidently delivering House, Tech House, Afro House, Commercial, and custom genre requests to suit each event and audience. As a professional DJ in Cape Town, Phee has built a strong reputation for his ability to read the room. He understands that no two events are the same and that great DJing goes beyond track selection. From smoothly guiding the energy early in the evening to elevating the crowd when it matters most, Phee adapts his sound in real time to ensure every event flows effortlessly.
      <br />
      <br />
      Phee is regularly booked for:
      <br />
      • Corporate Events and Year-end Functions
      <br />
      • Weddings and Private Events
      <br />
      • Clubs and Nightlife Venues
      <br />
      • Festivals and Large-scale Events
      <br />
      • Brand Activations and Curated Experiences
    </>,
    <>
      His experience across corporate functions, weddings, clubs, festivals, and private events makes him a reliable choice for clients who want both professionalism and personality. Event organisers value his punctuality, preparation, and polished setup, while guests remember him for his friendly energy and ability to keep the dance floor buzzing.
      <br />
      <br />
      With a solid presence in Cape Town’s music and events scene, DJ Phee has performed at leading clubs, festival stages, and premium venues across the city such as Halo Nightclub, Cabo Beach club, Modular, The Village Idiot, and many more.
    </>,
    <>
      Whether he’s entertaining a corporate crowd, setting the tone for a wedding reception, or delivering a high-impact club set, his focus remains the same: great music, great energy, and an unforgettable experience.
      <br />
      <br />
      If you’re searching for a corporate event DJ in Cape Town, a wedding DJ who understands flow and crowd energy, a club or festival DJ with Afrotech expertise, or a versatile private event DJ, DJ Phee offers a flexible, professional, and high-energy approach tailored to your event. From planning to performance, he works closely with clients to ensure the music matches the moment and that every booking ends with a full dance floor and a great vibe.
    </>
  ];
  const aboutImages = Array.isArray(data?.aboutImages) ? data.aboutImages : [];
  const bioImages = aboutImages.slice(0, 4);

  useEffect(() => {
    const fetchAboutPhee = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee'); // 'phee' is your document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          const replacements = {
            'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/phee3_g7ybop.jpg':
              'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759158539/phee_image_2_fkvd1p.jpg',
            'https://res.cloudinary.com/dea6wzxd8/image/upload/v1755076092/phee8_wi2s8x.jpg':
              'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759158539/phee_image_1_oj1yyt.jpg'
          };

          const updatedImages = Array.isArray(fetchedData.aboutImages)
            ? fetchedData.aboutImages.map((img) => {
                if (img?.src && replacements[img.src]) {
                  return { ...img, src: replacements[img.src] };
                }
                return img;
              })
            : fetchedData.aboutImages;

          setData({ ...fetchedData, aboutImages: updatedImages });
        } else {
          console.error('No document found!');
        }
      } catch (error) {
        console.error('Error fetching About Phee data:', error);
      }
    };

    fetchAboutPhee();
  }, []);

  const getOptimizedCloudinaryUrl = (url, { width, height }) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const transformation = `e_trim,f_auto,q_auto,dpr_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_pad,g_center,b_black`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  };

  const getOptimizedCloudinaryUrlFill = (url, { width, height }) => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const transformation = `f_auto,q_auto,dpr_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_fill,g_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  };

  return (
    <>
      <section id="about-phee" className="reveal-scope">
        <h2 data-reveal data-reveal-order="0">{data?.aboutTitle || 'About Phee'}</h2>
        <div className="about-phee__blocks">
          {aboutParagraphs.map((paragraph, index) => {
            const image = bioImages[index];
            const isReversed = index % 2 === 1;
            const useCrop = index < 3;
            const isBullets = index === 1;

            return (
              <div
                key={index}
                className={`about-phee__block${isReversed ? ' is-reversed' : ''}${isBullets ? ' about-phee__block--bullets' : ''}`}
                data-reveal
                data-reveal-order={index + 1}
              >
                <div className="about-phee__text">
                  <p>{paragraph}</p>
                </div>
                {image ? (
                  <div className={`about-phee__media${useCrop ? ' about-phee__media--crop' : ' about-phee__media--fit'}`}>
                    <img
                      src={(useCrop ? getOptimizedCloudinaryUrlFill : getOptimizedCloudinaryUrl)(image.src, { width: 900, height: 900 })}
                      srcSet={`${(useCrop ? getOptimizedCloudinaryUrlFill : getOptimizedCloudinaryUrl)(image.src, { width: 320, height: 320 })} 320w, ${(useCrop ? getOptimizedCloudinaryUrlFill : getOptimizedCloudinaryUrl)(image.src, { width: 480, height: 480 })} 480w, ${(useCrop ? getOptimizedCloudinaryUrlFill : getOptimizedCloudinaryUrl)(image.src, { width: 720, height: 720 })} 720w, ${(useCrop ? getOptimizedCloudinaryUrlFill : getOptimizedCloudinaryUrl)(image.src, { width: 1080, height: 1080 })} 1080w`}
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 42vw, 520px"
                      alt={image.alt}
                      loading="lazy"
                      width="900"
                      height="900"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="about-phee__cta" data-reveal data-reveal-order={aboutParagraphs.length + 1}>
          <Link href="/booking#booking" className="cta-button">
            BOOK NOW
          </Link>
        </div>
      </section>
    </>
  );
};

export default AboutPhee;
