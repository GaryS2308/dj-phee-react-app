import { Suspense } from 'react';
import BookingResponse from '../../src/components/pages/booking-response/booking-response';

export const metadata = {
  title: 'Booking Response',
  description: 'Respond to a DJ Phee booking request.',
  robots: {
    index: false,
    follow: false
  },
  googleBot: {
    index: false,
    follow: false
  },
  alternates: {
    canonical: '/response'
  },
  openGraph: {
    title: 'Booking Response | PHEE',
    description: 'Respond to a DJ Phee booking request.',
    url: 'https://phee.co.za/response',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Response | PHEE',
    description: 'Respond to a DJ Phee booking request.'
  }
};

export default function ResponsePage() {
  return (
    <main>
      <h1 className="sr-only">Booking Response</h1>
      <Suspense fallback={<div />}>
        <BookingResponse />
      </Suspense>
    </main>
  );
}
