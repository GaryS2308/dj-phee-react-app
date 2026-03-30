import HeroSection from '../src/components/pages/home/HeroSection';
import HomeBioSection from '../src/components/pages/home/HomeBioSection';
import WherePheePerforms from '../src/components/pages/home/WherePheePerforms';
import MarqueeBanner from '../src/components/buttons/marquee-banner/marquee-banner';

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
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book DJ PHEE in Cape Town | Weddings, Parties, Clubs and Festivals',
    description:
      'Hire DJ PHEE for private events, brand launches, parties, weddings, clubs and festivals in Cape Town. Afrotech specialist with all-genre sets and travel by arrangement.'
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "PHEE",
    "jobTitle": "DJ",
    "description": "Cape Town DJ specializing in Afrotech (also written Afro Tech or Afro-Tech) with versatile all-genre sets for weddings, private events, brand launches, clubs and festivals.",
    "url": "https://phee.co.za/",
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
    <>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      </main>
    </>
  );
}
