import HeroBanner from '../../src/components/hero/HeroBanner';
import GalleryPage from '../../src/components/pages/gallery/GalleryPage';

export const metadata = {
  title: 'DJ PHEE Event Gallery in Cape Town',
  description: 'Browse gallery highlights from DJ PHEE performances at private events, weddings, clubs, festivals and brand events in Cape Town.',
  alternates: {
    canonical: '/gallery'
  },
  openGraph: {
    title: 'DJ PHEE Event Gallery in Cape Town',
    description: 'Browse gallery highlights from DJ PHEE performances at private events, weddings, clubs, festivals and brand events in Cape Town.',
    url: 'https://phee.co.za/gallery',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DJ PHEE Event Gallery in Cape Town',
    description: 'Browse gallery highlights from DJ PHEE performances at private events, weddings, clubs, festivals and brand events in Cape Town.'
  }
};

export default function GalleryRoutePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Gallery | PHEE",
    "description": "Highlights from recent DJ PHEE performances and events.",
    "url": "https://phee.co.za/gallery"
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroBanner
        title="GALLERY"
        subtitle="Highlights from recent performances and events."
        imageMobile="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549869/phee-mobile_hero_1_rjeczb.jpg"
        imageDesktop="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549983/phee_hero_desktop_xqxsc2.jpg"
        ctaLabel="BOOK NOW"
        ctaHref="/booking#booking"
      />
      <GalleryPage />
    </main>
  );
}
