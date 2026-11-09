import LinksPage from '../../src/components/pages/links-page/links-page';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

export const metadata = {
  title: "Book DJ PHEE | Links, Music and Contact",
  description: "Access DJ PHEE booking links, music profiles, social channels and brand contacts in one place.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/links'
  },
  openGraph: {
    title: "Book DJ PHEE | Links, Music and Contact",
    description: 'Direct access to DJ PHEE bookings, music, social channels and collaborations.',
    url: 'https://phee.co.za/links',
    type: 'website',
    images: getOpenGraphImages(heroImages.links, 'DJ PHEE links profile photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: "Book DJ PHEE | Links, Music and Contact",
    description: 'Book DJ PHEE, hear the latest sets, and find every brand connection.',
    images: [getShareImageUrl(heroImages.links)]
  }
};

export default function LinksRoutePage() {
  return (
    <main>
      <LinksPage />
    </main>
  );
}
