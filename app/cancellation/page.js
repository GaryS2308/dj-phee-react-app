import CancellationPage from '../../src/components/pages/legal/CancellationPage';

export const metadata = {
  title: 'Cancellation Policy',
  description: 'Cancellation terms for DJ Phee bookings.',
  alternates: {
    canonical: '/cancellation'
  },
  openGraph: {
    title: 'Cancellation Policy | PHEE',
    description: 'Cancellation terms for DJ Phee bookings.',
    url: 'https://phee.co.za/cancellation',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cancellation Policy | PHEE',
    description: 'Cancellation terms for DJ Phee bookings.'
  }
};

export default function CancellationRoutePage() {
  return (
    <main>
      <h1 className="sr-only">Cancellation Policy</h1>
      <CancellationPage />
    </main>
  );
}
