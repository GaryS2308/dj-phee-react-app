export const siteUrl = 'https://phee.co.za';

export const heroImages = {
  home: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1758540552/Phee_background_photo_fbayer.png',
  primary: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/Phee_Hero_photo_rz1dei.jpg',
  bio: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/phee_hero_photo_2_fs1a9g.jpg',
  gallery: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549983/phee_hero_desktop_xqxsc2.jpg',
  links: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png',
  pastEvents: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549983/phee_photo_amgvyt.jpg'
};

export function getShareImageUrl(url) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/f_jpg,q_auto,w_1200,h_630,c_fill,g_auto/');
}

export function getOpenGraphImages(url, alt = 'DJ PHEE') {
  return [
    {
      url: getShareImageUrl(url),
      width: 1200,
      height: 630,
      alt
    }
  ];
}
