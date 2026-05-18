import HeroBanner from '../../src/components/hero/HeroBanner';
import EventDjPage from '../../src/components/pages/event-dj/EventDjPage';

export const metadata = {
  title: 'Event DJ Cape Town | DJ PHEE',
  description:
    'Hire DJ PHEE as your event DJ in Cape Town. Private parties, birthdays, brand activations and special occasions across the Western Cape. Versatile sets, rates from R2,000/hr.',
  alternates: {
    canonical: '/event-dj-cape-town'
  },
  openGraph: {
    title: 'Event DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE as your event DJ in Cape Town. Private parties, birthdays, brand activations and special occasions across the Western Cape. Versatile sets, rates from R2,000/hr.',
    url: 'https://phee.co.za/event-dj-cape-town',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE as your event DJ in Cape Town. Private parties, birthdays, brand activations and special occasions across the Western Cape. Versatile sets, rates from R2,000/hr.'
  }
};

export default function EventDjRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Event DJ Cape Town",
    "description": "Professional event DJ services in Cape Town and the Western Cape for private parties, birthdays, brand activations and special occasions.",
    "url": "https://phee.co.za/event-dj-cape-town",
    "provider": {
      "@type": "Person",
      "name": "PHEE",
      "jobTitle": "DJ",
      "url": "https://phee.co.za",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cape Town",
        "addressRegion": "Western Cape",
        "addressCountry": "ZA"
      }
    },
    "areaServed": ["Cape Town", "Western Cape", "South Africa"],
    "serviceType": "Event DJ",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "ZAR",
      "price": "2000",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "2000",
        "priceCurrency": "ZAR",
        "unitText": "per hour"
      }
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroBanner
        title="EVENT DJ"
        seoTitle="Event DJ Cape Town | DJ PHEE"
        subtitle="Private parties, birthdays, brand activations and special occasions across Cape Town and the Western Cape."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/Phee_Hero_photo_rz1dei.jpg"
        ctaLabel="GET A QUOTE"
        ctaHref="/booking#booking"
      />
      <EventDjPage />
    </main>
  );
}
