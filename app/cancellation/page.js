import CancellationPage from '../../src/components/pages/legal/CancellationPage';

export const metadata = {
  title: 'Cancellation Policy | DJ PHEE Cape Town',
  robots: {
    index: false,
    follow: true,
  },
  description: 'Read DJ PHEE cancellation terms for confirmed bookings, including notice periods, fees and event-date changes.',
  alternates: {
    canonical: '/cancellation'
  },
  openGraph: {
    title: 'Booking Cancellation Policy',
    description: 'Read DJ PHEE cancellation terms for confirmed bookings, including notice periods, fees and event-date changes.',
    url: 'https://phee.co.za/cancellation',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Cancellation Policy',
    description: 'Read DJ PHEE cancellation terms for confirmed bookings, including notice periods, fees and event-date changes.'
  }
};

export default function CancellationRoutePage() {
  return (
    <main>
      <CancellationPage />
    </main>
  );
}
