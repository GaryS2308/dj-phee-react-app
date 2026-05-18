import HeroBanner from '../../src/components/hero/HeroBanner';
import BookingForm from '../../src/components/pages/booking-form/BookingForm';

export const metadata = {
  title: 'Book DJ PHEE | Cape Town Wedding, Corporate & Event DJ',
  description:
    'Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel available by arrangement.',
  alternates: {
    canonical: '/booking'
  },
  openGraph: {
    title: 'Book DJ PHEE | Cape Town Wedding, Corporate & Event DJ',
    description:
      'Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel available by arrangement.',
    url: 'https://phee.co.za/booking',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book DJ PHEE | Cape Town Wedding, Corporate & Event DJ',
    description:
      'Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel available by arrangement.'
  }
};

export default function BookingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "PHEE DJ Booking",
    "description": "Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel by arrangement.",
    "url": "https://phee.co.za/booking",
    "areaServed": "Cape Town, South Africa, and travel destinations by arrangement",
    "serviceType": "DJ booking and performance",
    "provider": {
      "@type": "Person",
      "name": "PHEE",
      "jobTitle": "DJ"
    }
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to hire a DJ in Cape Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE charges R2,000 per hour. A 4-hour event costs R8,000. Select your date, start time and duration in the booking form to see an instant estimate before submitting."
        }
      },
      {
        "@type": "Question",
        "name": "What events can DJ PHEE perform at?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE performs at weddings, private parties, birthdays, year-end functions, brand launches, club nights, festivals and corporate events across Cape Town and the Western Cape."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book DJ PHEE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fill in the booking form with your event date, start time, expected duration, venue and any music preferences or genre requests. PHEE responds directly with availability confirmation and a tailored quote."
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
        "name": "What information do I need to book a DJ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To get an accurate quote, include your event date, start time, expected duration, venue address and any music preferences or genre requests. The more detail you provide, the faster PHEE can confirm availability and pricing."
        }
      },
      {
        "@type": "Question",
        "name": "Does DJ PHEE play Afrotech?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Afrotech is DJ PHEE's core speciality. Based in Cape Town, he delivers high-energy Afrotech and Afro House sets that blend traditional African rhythms with modern house and techno production. PHEE performs Afrotech at club nights, festivals, corporate events and private parties across the Western Cape."
        }
      }
    ]
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HeroBanner
        title="BOOKING"
        seoTitle="Book DJ PHEE for Your Cape Town Event"
        subtitle="Request availability, rates, and booking details for DJ Phee in Cape Town."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/Phee_Hero_photo_rz1dei.jpg"
      />
      <BookingForm />
    </main>
  );
}
