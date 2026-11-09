import { HOME_FAQS } from '../src/components/shared/homeFaqData';
import HeroSection from '../src/components/pages/home/HeroSection';
import HomeBioSection from '../src/components/pages/home/HomeBioSection';
import WherePheePerforms from '../src/components/pages/home/WherePheePerforms';
import HomeBottomSection from '../src/components/pages/home/HomeBottomSection';
import MarqueeBanner from '../src/components/buttons/marquee-banner/marquee-banner';
import { getOpenGraphImages, getShareImageUrl, heroImages } from './seo';

export const metadata = {
  title: 'Book DJ PHEE in Cape Town | Weddings, Parties, Clubs and Festivals',
  description:
    'Hire DJ PHEE for private events, brand launches, parties, weddings, clubs and festivals in Cape Town. Afrotech specialist with all-genre sets and travel by arrangement.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Book DJ PHEE in Cape Town | Weddings, Parties, Clubs and Festivals',
    description:
      'Hire DJ PHEE for private events, brand launches, parties, weddings, clubs and festivals in Cape Town. Afrotech specialist with all-genre sets and travel by arrangement.',
    url: 'https://phee.co.za/',
    type: 'website',
    images: getOpenGraphImages(heroImages.home, 'DJ PHEE Cape Town DJ hero photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book DJ PHEE in Cape Town | Weddings, Parties, Clubs and Festivals',
    description:
      'Hire DJ PHEE for private events, brand launches, parties, weddings, clubs and festivals in Cape Town. Afrotech specialist with all-genre sets and travel by arrangement.',
    images: [getShareImageUrl(heroImages.home)]
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DJ PHEE",
    "description": "Cape Town DJ specializing in Afrotech (also written Afro Tech or Afro-Tech) with versatile all-genre sets for weddings, private events, brand launches, clubs and festivals.",
    "url": "https://phee.co.za/",
    "telephone": "+27815570146",
    "priceRange": "RR",
    "areaServed": ["Cape Town", "Western Cape", "South Africa"],
    "sameAs": [
      "https://instagram.com/__phee__",
      "https://soundcloud.com/phemelo-ramatlotlo-122152686"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cape Town",
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.9249,
      "longitude": 18.4241
    }
  };

  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
  const entityGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...jsonLd, '@id': 'https://phee.co.za/#business', founder: { '@id': 'https://phee.co.za/#person' } },
      { '@type': 'Person', '@id': 'https://phee.co.za/#person', name: 'DJ PHEE',
        alternateName: ['PHEE', 'DJ Phee', 'Phee'], jobTitle: 'DJ', url: 'https://phee.co.za/', sameAs: jsonLd.sameAs },
      { '@type': 'WebSite', '@id': 'https://phee.co.za/#website', name: 'DJ PHEE', alternateName: 'PHEE',
        url: 'https://phee.co.za/', publisher: { '@id': 'https://phee.co.za/#person' } }
    ]
  };

  return (
    <>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraph) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <HeroSection />
        <HomeBioSection />
        <MarqueeBanner
          flush
          items={[
            'CAPE TOWN AFROTECH',
            'PROFESSIONAL DJ BOOKINGS',
            'CORPORATE EVENTS',
            'CLUBS & NIGHTLIFE',
            'FESTIVALS',
            'PRIVATE EVENTS',
            'WEDDINGS',
            'HIGH-ENERGY SETS'
          ]}
        />
        <WherePheePerforms />
        <HomeBottomSection />
      </main>
    </>
  );
}
