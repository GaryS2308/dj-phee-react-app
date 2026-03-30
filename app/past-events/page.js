import HeroBanner from '../../src/components/hero/HeroBanner';
import PastEvents from '../../src/components/pages/past-events/past-events';

export const metadata = {
  title: 'Past DJ Events and Club Sets in Cape Town',
  description:
    'See past DJ PHEE events across Cape Town clubs, festivals, private events and brand activations, including live-set highlights and venue history.',
  alternates: {
    canonical: '/past-events'
  },
  openGraph: {
    title: 'Past DJ Events and Club Sets in Cape Town',
    description:
      'See past DJ PHEE events across Cape Town clubs, festivals, private events and brand activations, including live-set highlights and venue history.',
    url: 'https://phee.co.za/past-events',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Past DJ Events and Club Sets in Cape Town',
    description:
      'See past DJ PHEE events across Cape Town clubs, festivals, private events and brand activations, including live-set highlights and venue history.'
  }
};

export default function PastEventsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Past Events | PHEE",
    "description": "A selection of DJ PHEE performances, venues, and featured moments.",
    "url": "https://phee.co.za/past-events",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "Event",
          "name": "SOULSHAKER SET @ VILLAGE IDIOT",
        "startDate": "2025-03-19",
        "location": {
          "@type": "Place",
          "name": "Village Idiot"
        },
        "performer": {
          "@type": "Person",
          "name": "PHEE"
        }
      },
      {
        "@type": "Event",
        "name": "CLOUD 9 SET @ FOOLS GOLD SOCIAL",
        "startDate": "2025-04-18",
        "location": {
          "@type": "Place",
          "name": "Fools Gold Social"
        },
        "performer": {
          "@type": "Person",
          "name": "PHEE"
        }
        }
      ]
    }
  };

  return (
    <main>
      <HeroBanner
        title="PAST EVENTS"
        subtitle="A selection of performances, venues, and featured moments."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549983/phee_photo_amgvyt.jpg"
        ctaLabel="BOOK NOW"
        ctaHref="/booking#booking"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PastEvents />
    </main>
  );
}
