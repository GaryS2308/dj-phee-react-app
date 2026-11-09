import HeroBanner from '../../src/components/hero/HeroBanner';
import EventDjPage from '../../src/components/pages/event-dj/EventDjPage';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

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
    type: 'website',
    images: getOpenGraphImages(heroImages.primary, 'DJ PHEE event DJ hero photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE as your event DJ in Cape Town. Private parties, birthdays, brand activations and special occasions across the Western Cape. Versatile sets, rates from R2,000/hr.',
    images: [getShareImageUrl(heroImages.primary)]
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
      "@id": "https://phee.co.za/#person",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, {
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://phee.co.za/' },
            { '@type': 'ListItem', position: 2, name: jsonLd.name, item: jsonLd.url }
          ]
        }]) }}
      />
      <HeroBanner
        title="EVENT DJ"
        seoTitle="Event DJ Cape Town | DJ PHEE"
        subtitle="Private parties, birthdays, brand activations and special occasions across Cape Town and the Western Cape."
        image={heroImages.primary}
        ctaLabel="GET A QUOTE"
        ctaHref="/booking#booking"
      />
      <EventDjPage />
    </main>
  );
}
