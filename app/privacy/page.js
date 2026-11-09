import PrivacyPolicy from '../../src/components/pages/legal/PrivacyPolicy';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

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
    type: 'website',
    images: getOpenGraphImages(heroImages.primary, 'DJ PHEE booking information photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy for DJ PHEE Bookings',
    description: 'Read how DJ PHEE booking enquiries are collected, used, stored and protected when you submit event details on this website.',
    images: [getShareImageUrl(heroImages.primary)]
  }
};

export default function PrivacyPage() {
  return (
    <main>
      <PrivacyPolicy />
    </main>
  );
}
