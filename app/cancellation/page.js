import CancellationPage from '../../src/components/pages/legal/CancellationPage';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

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
    type: 'website',
    images: getOpenGraphImages(heroImages.primary, 'DJ PHEE cancellation policy photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Cancellation Policy',
    description: 'Read DJ PHEE cancellation terms for confirmed bookings, including notice periods, fees and event-date changes.',
    images: [getShareImageUrl(heroImages.primary)]
  }
};

export default function CancellationRoutePage() {
  return (
    <main>
      <CancellationPage />
    </main>
  );
}
