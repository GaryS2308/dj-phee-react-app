import PrivacyPolicy from '../../src/components/pages/legal/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy for DJ PHEE Bookings',
  description: 'Read how DJ PHEE booking enquiries are collected, used, stored and protected when you submit event details on this website.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/privacy'
  },
  openGraph: {
    title: 'Privacy Policy for DJ PHEE Bookings',
    description: 'Read how DJ PHEE booking enquiries are collected, used, stored and protected when you submit event details on this website.',
    url: 'https://phee.co.za/privacy',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy for DJ PHEE Bookings',
    description: 'Read how DJ PHEE booking enquiries are collected, used, stored and protected when you submit event details on this website.'
  }
};

export default function PrivacyPage() {
  return (
    <main>
      <PrivacyPolicy />
    </main>
  );
}
