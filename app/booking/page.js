import HeroBanner from '../../src/components/hero/HeroBanner';
import BookingForm from '../../src/components/pages/booking-form/BookingForm';

export const metadata = {
  title: 'Book DJ PHEE for Events in Cape Town',
  description:
    'Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel available by arrangement.',
  alternates: {
    canonical: '/booking'
  },
  openGraph: {
    title: 'Book DJ PHEE for Events in Cape Town',
    description:
      'Book DJ PHEE for private events, brand launches, parties, dances, weddings, clubs and festivals in Cape Town, with travel available by arrangement.',
    url: 'https://phee.co.za/booking',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book DJ PHEE for Events in Cape Town',
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
        "name": "Which events can DJ PHEE perform at?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DJ PHEE performs at corporate events, year-end functions, clubs, festivals, weddings, and private celebrations in Cape Town."
        }
      },
      {
        "@type": "Question",
        "name": "How do I request availability and pricing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the booking form to submit your event date, start time, duration, venue, and event details. You will receive a direct response with availability and rates."
        }
      },
      {
        "@type": "Question",
        "name": "What do you charge?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Current rates are R2000 per hour. After you choose your date, start time, and duration in the booking form, you will see an estimated cost before submitting your request."
        }
      },
      {
        "@type": "Question",
        "name": "What information helps speed up a booking response?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Include event type, date, location, expected timing, and any specific music or atmosphere requirements so the quote can be tailored quickly."
        }
      },
      {
        "@type": "Question",
        "name": "Do you take bookings outside of Cape Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Bookings outside Cape Town are available, and travel or related expenses are quoted separately and covered by the client."
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
        subtitle="Request availability, rates, and booking details for DJ Phee in Cape Town."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/Phee_Hero_photo_rz1dei.jpg"
      />
      <BookingForm />
    </main>
  );
}
