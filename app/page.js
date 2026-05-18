import HeroSection from '../src/components/pages/home/HeroSection';
import HomeBioSection from '../src/components/pages/home/HomeBioSection';
import WherePheePerforms from '../src/components/pages/home/WherePheePerforms';
import HomeBottomSection from '../src/components/pages/home/HomeBottomSection';
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
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to hire DJ PHEE in Cape Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE charges from R2,000 per hour. A 4-hour set costs R8,000. Use the booking form to get an instant estimate. Travel outside Cape Town is quoted separately."
        }
      },
      {
        "@type": "Question",
        "name": "What is Afrotech music?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Afrotech (also written Afro Tech or Afro-Tech) blends traditional African percussion, instruments and vocal samples with modern house and techno production. It celebrates African identity while delivering high-energy dance floor sets. DJ PHEE is a Cape Town Afrotech specialist."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between Afro House and Afrotech?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Afro House focuses on groove, soul and African vocal layers within a classic house structure. Afrotech layers traditional African instruments with techno and house production for a higher energy feel. DJ PHEE performs both and adapts to the event vibe and crowd."
        }
      },
      {
        "@type": "Question",
        "name": "What genres does DJ PHEE play besides Afrotech?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE plays versatile all-genre sets including Afrotech, Afro House, Deep House, Top 40, hip-hop and 90s classics. For corporate events and weddings, PHEE blends genres to match the crowd. Every set is read in real-time and adapted to the guests' energy."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book DJ PHEE for a wedding in Cape Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Visit the booking page and fill in your ceremony or reception date, start time, duration, venue and any music preferences. You will see an estimated cost before submitting. PHEE responds with availability and can accommodate ceremony ambience, cocktail hour and dance floor sets."
        }
      },
      {
        "@type": "Question",
        "name": "Does DJ PHEE travel for gigs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DJ PHEE is based in Cape Town and available for bookings across South Africa and internationally. Travel costs are quoted separately and covered by the client. International touring enquiries are welcome."
        }
      },
      {
        "@type": "Question",
        "name": "How far in advance should I book DJ PHEE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Booking 4 to 8 weeks in advance is recommended, especially for weddings and large events. Popular dates fill quickly, so submit a booking request early to check availability."
        }
      },
      {
        "@type": "Question",
        "name": "What events has DJ PHEE performed at in Cape Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE performs at clubs, festivals, corporate year-end functions, private parties, weddings and brand launches across Cape Town. Past venues include Halo Nightclub, Cabo Beach Club, Modular and The Village Idiot. Follow @__phee__ on Instagram for recent event highlights."
        }
      }
    ]
  };

  return (
    <>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
