import HeroBanner from '../../src/components/hero/HeroBanner';
import AboutPhee from '../../src/components/pages/about-phee/about-phee';

export const metadata = {
  title: 'Bio',
  description:
    'Phee is a Cape Town-based DJ known for delivering high-energy Afrotech sets across corporate events, clubs, festivals and private functions.',
  alternates: {
    canonical: '/bio'
  },
  openGraph: {
    title: 'Bio | PHEE',
    description:
      'Phee is a Cape Town-based DJ known for delivering high-energy Afrotech sets across corporate events, clubs, festivals and private functions.',
    url: 'https://phee.co.za/bio',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bio | PHEE',
    description:
      'Phee is a Cape Town-based DJ known for delivering high-energy Afrotech sets across corporate events, clubs, festivals and private functions.'
  }
};

export default function BioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "PHEE",
    "jobTitle": "DJ",
    "description": "Cape Town-based DJ delivering high-energy Afrotech sets for private and public events.",
    "url": "https://phee.co.za/bio",
    "sameAs": [
      "https://instagram.com/__phee__",
      "https://soundcloud.com/phemelo-ramatlotlo-122152686"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cape Town",
      "addressCountry": "ZA"
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroBanner
        title="BIO"
        subtitle="Cape Town-based DJ delivering high-energy Afrotech sets for private and public events."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/phee_hero_photo_2_fs1a9g.jpg"
        imagePosition="center 78%"
        imagePositionDesktop="center 15%"
        ctaLabel="BOOK NOW"
        ctaHref="/booking#booking"
      />
      <h1 className="sr-only">Bio</h1>
      <AboutPhee />
    </main>
  );
}
