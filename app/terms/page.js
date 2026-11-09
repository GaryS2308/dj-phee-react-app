import TermsPage from '../../src/components/pages/legal/TermsPage';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

export const metadata = {
  title: 'Booking Terms and Conditions | DJ PHEE Cape Town',
  robots: {
    index: false,
    follow: true,
  },
  description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.',
  alternates: {
    canonical: '/terms'
  },
  openGraph: {
    title: 'Booking Terms and Conditions',
    description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.',
    url: 'https://phee.co.za/terms',
    type: 'website',
    images: getOpenGraphImages(heroImages.primary, 'DJ PHEE booking terms photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Terms and Conditions',
    description: 'Review DJ PHEE booking terms and conditions, including payments, event requirements, performance terms and client responsibilities.',
    images: [getShareImageUrl(heroImages.primary)]
  }
};

export default function TermsRoutePage() {
  return (
    <main>
      <TermsPage />
    </main>
  );
}
