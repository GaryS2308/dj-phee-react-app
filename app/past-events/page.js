import HeroBanner from '../../src/components/hero/HeroBanner';
import PastEvents from '../../src/components/pages/past-events/past-events';

export const metadata = {
  title: 'Past Events',
  description:
    'PHEE has performed at a wide range of Cape Town clubs, festivals and special events, showcasing his versatility as a DJ for hire.',
  alternates: {
    canonical: '/past-events'
  },
  openGraph: {
    title: 'Past Events | PHEE',
    description:
      'PHEE has performed at a wide range of Cape Town clubs, festivals and special events, showcasing his versatility as a DJ for hire.',
    url: 'https://phee.co.za/past-events',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Past Events | PHEE',
    description:
      'PHEE has performed at a wide range of Cape Town clubs, festivals and special events, showcasing his versatility as a DJ for hire.'
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
      <h1 className="sr-only">Past Events</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PastEvents />
    </main>
  );
}
