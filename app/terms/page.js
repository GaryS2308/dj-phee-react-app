import TermsPage from '../../src/components/pages/legal/TermsPage';

export const metadata = {
  title: 'Booking Terms and Conditions',
  description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.',
  alternates: {
    canonical: '/terms'
  },
  openGraph: {
    title: 'Booking Terms and Conditions',
    description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.',
    url: 'https://phee.co.za/terms',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Terms and Conditions',
    description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.'
  }
};

export default function TermsRoutePage() {
  return (
    <main>
      <TermsPage />
    </main>
  );
}
