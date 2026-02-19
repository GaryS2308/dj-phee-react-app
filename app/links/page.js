import LinksPage from '../../src/components/pages/links-page/links-page';

export const metadata = {
  title: "PHEE'S Links",
  description: "Explore DJ Phee's booking portal, music, brands, and partners all in one place.",
  alternates: {
    canonical: '/links'
  },
  openGraph: {
    title: "PHEE'S Links",
    description: 'Direct access to DJ Phee bookings, music, and collaborations.',
    url: 'https://phee.co.za/links',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "PHEE'S Links",
    description: 'Book DJ Phee, hear the latest sets, and find every brand connection.',
    images: ['https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png']
  }
};

export default function LinksRoutePage() {
  return (
    <main>
      <LinksPage />
    </main>
  );
}
