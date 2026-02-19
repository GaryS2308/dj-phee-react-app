import TermsPage from '../../src/components/pages/legal/TermsPage';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for DJ Phee bookings.',
  alternates: {
    canonical: '/terms'
  },
  openGraph: {
    title: 'Terms & Conditions | PHEE',
    description: 'Terms and conditions for DJ Phee bookings.',
    url: 'https://phee.co.za/terms',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | PHEE',
    description: 'Terms and conditions for DJ Phee bookings.'
  }
};

export default function TermsRoutePage() {
  return (
    <main>
      <h1 className="sr-only">Terms and Conditions</h1>
      <TermsPage />
    </main>
  );
}
