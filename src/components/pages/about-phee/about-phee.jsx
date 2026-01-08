import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // adjust the path to your firebase config
import './about-phee.css';

const AboutPhee = () => {
  const [data, setData] = useState(null);
  const defaultMetaTitle = 'PHEE | Hire a Professional DJ in Cape Town | Corporate, Clubs, Festivals & Private Events';
  const defaultMetaDescription =
    'Book DJ PHEE for corporate events, year-end functions, clubs, festivals, weddings and private parties in Cape Town. A professional Afrotech DJ delivering high-energy sets and reliable service.';
  const aboutParagraphs = [
    'Phee is a Cape Town-based DJ known for delivering high-energy Afrotech sets across corporate events, clubs, festivals and private functions. As a professional DJ in Cape Town, he has built a reputation for reading the room, keeping the crowd moving, and adapting his sound to every environment. From year-end corporate functions and company parties to weddings, birthday celebrations and late-night venues.',
    'With a solid presence in Cape Town’s music scene, DJ PHEE performs at some of the city’s leading clubs and festival stages, bringing a distinct Afrotech and Electronic blend to the dance floor. Whether he’s playing a large-scale festival, a corporate event, a club night or an intimate private gathering, he delivers a polished, reliable and memorable experience every time.',
    "If you're searching for a corporate event DJ in Cape Town, a club DJ for a Friday night slot, a festival-ready performer or a private event DJ, PHEE offers a versatile and professional approach to every booking."
  ];

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
    const transformation = `f_auto,q_auto,dpr_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_fill,g_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  };

  return (
    <>
      <Helmet>
        <title>{data?.metaTitle || defaultMetaTitle}</title>
        <meta
          name="description"
          content={data?.metaDescription || defaultMetaDescription}
        />
      </Helmet>

      <section id="about-phee">
        <h2 data-reveal data-reveal-order="0">{data?.aboutTitle || 'About Phee'}</h2>
        {aboutParagraphs.map((paragraph, index) => (
          <p key={index} data-reveal data-reveal-order={index + 1}>
            {paragraph}
          </p>
        ))}

        {data?.aboutImages?.length ? (
          <div
            className="phee-gallery"
            data-reveal
            data-reveal-order={aboutParagraphs.length + 1}
        >
            {data.aboutImages.map((img, index) => (
              <img
                key={index}
                src={getOptimizedCloudinaryUrl(img.src, { width: 900, height: 900 })}
                srcSet={`${getOptimizedCloudinaryUrl(img.src, { width: 480, height: 480 })} 480w, ${getOptimizedCloudinaryUrl(img.src, { width: 720, height: 720 })} 720w, ${getOptimizedCloudinaryUrl(img.src, { width: 1080, height: 1080 })} 1080w`}
                sizes="(max-width: 480px) 90vw, (max-width: 768px) 70vw, 320px"
                alt={img.alt}
                loading="lazy"
                width="900"
                height="900"
              />
            ))}
          </div>
        ) : (
          <p data-reveal data-reveal-order={aboutParagraphs.length + 1}>Gallery will be updated shortly.</p>
        )}
      </section>
    </>
  );
};

export default AboutPhee;
