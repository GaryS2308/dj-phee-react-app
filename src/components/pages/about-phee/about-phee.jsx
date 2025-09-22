import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // adjust the path to your firebase config
import './about-phee.css';

const AboutPhee = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAboutPhee = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee'); // 'phee' is your document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.error('No document found!');
        }
      } catch (error) {
        console.error('Error fetching About Phee data:', error);
      }
    };

    fetchAboutPhee();
  }, []);

  return (
    <>
      <Helmet>
        <title>{data?.metaTitle || 'About DJ Phee - Versatile Afrotech DJ'}</title>
        <meta
          name="description"
          content={
            data?.metaDescription ||
            'Learn about DJ Phee, a versatile Afrotech DJ known for unforgettable vibes.'
          }
        />
      </Helmet>

      <section id="about-phee">
        <h2 data-reveal data-reveal-order="0">{data?.aboutTitle || 'About Phee'}</h2>
        <p data-reveal data-reveal-order="1">
          {data?.aboutDescription ||
            'Loading Phee’s story... hang tight while we fetch the latest updates.'}
        </p>

        {data?.aboutImages?.length ? (
          <div
            className="phee-gallery"
            data-reveal
            data-reveal-order="2"
          >
            {data.aboutImages.map((img, index) => (
              <img key={index} src={img.src} alt={img.alt} loading="lazy" />
            ))}
          </div>
        ) : (
          <p data-reveal data-reveal-order="2">Gallery will be updated shortly.</p>
        )}
      </section>
    </>
  );
};

export default AboutPhee;
