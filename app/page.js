import HeroSection from '../src/components/pages/home/HeroSection';
import HomeBioSection from '../src/components/pages/home/HomeBioSection';
import WherePheePerforms from '../src/components/pages/home/WherePheePerforms';
import MarqueeBanner from '../src/components/buttons/marquee-banner/marquee-banner';

export const metadata = {
  title: 'Hire a Professional DJ in Cape Town | Corporate, Clubs, Festivals & Private Events',
  description:
    'Book DJ PHEE for corporate events, year-end functions, clubs, festivals, weddings and private parties in Cape Town. A professional Afrotech DJ delivering high-energy sets and reliable service.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'PHEE | Hire a Professional DJ in Cape Town | Corporate, Clubs, Festivals & Private Events',
    description:
      'Book DJ PHEE for corporate events, year-end functions, clubs, festivals, weddings and private parties in Cape Town. A professional Afrotech DJ delivering high-energy sets and reliable service.',
    url: 'https://phee.co.za/',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PHEE | Hire a Professional DJ in Cape Town | Corporate, Clubs, Festivals & Private Events',
    description:
      'Book DJ PHEE for corporate events, year-end functions, clubs, festivals, weddings and private parties in Cape Town. A professional Afrotech DJ delivering high-energy sets and reliable service.'
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "PHEE",
    "jobTitle": "DJ",
    "description": "Professional DJ for corporate events, clubs, festivals and private functions in Cape Town.",
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
