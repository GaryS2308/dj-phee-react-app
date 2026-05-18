'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const GALLERY_REPLACEMENTS = {
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416289/phee3_g7ybop.jpg':
    'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759158539/phee_image_2_fkvd1p.jpg',
  'https://res.cloudinary.com/dea6wzxd8/image/upload/v1755076092/phee8_wi2s8x.jpg':
    'https://res.cloudinary.com/dea6wzxd8/image/upload/v1759158539/phee_image_1_oj1yyt.jpg'
};

const normalizeGalleryImages = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => {
      if (!image?.src) return null;

      return {
        ...image,
        src: GALLERY_REPLACEMENTS[image.src] || image.src
      };
    })
    .filter(Boolean);
};

export const getOptimizedCloudinaryUrl = (
  url,
  { width, height, crop = 'fill', gravity = 'auto', background } = {}
) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;

  const transformations = ['f_auto', 'q_auto', 'dpr_auto'];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  transformations.push(`c_${crop}`);

  if (gravity) transformations.push(`g_${gravity}`);
  if (background) transformations.push(`b_${background}`);

  return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
};

export const getGallerySelection = (images, indexes) => {
  if (!images.length) return [];

  return indexes
    .map((index) => images[index % images.length])
    .filter(Boolean);
};

export const usePheeGalleryImages = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    let isActive = true;

    const fetchGalleryImages = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'phee');
        const docSnap = await getDoc(docRef);

        if (!isActive || !docSnap.exists()) return;

        const fetchedData = docSnap.data();
        setImages(normalizeGalleryImages(fetchedData?.aboutImages));
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    };

    fetchGalleryImages();

    return () => {
      isActive = false;
    };
  }, []);

  return images;
};
