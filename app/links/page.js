import LinksPage from '../../src/components/pages/links-page/links-page';

export const metadata = {
  title: "Book DJ PHEE | Links, Music and Contact",
  description: "Access DJ PHEE booking links, music profiles, social channels and brand contacts in one place.",
  alternates: {
    canonical: '/links'
  },
  openGraph: {
    title: "Book DJ PHEE | Links, Music and Contact",
    description: 'Direct access to DJ PHEE bookings, music, social channels and collaborations.',
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
    title: "Book DJ PHEE | Links, Music and Contact",
    description: 'Book DJ PHEE, hear the latest sets, and find every brand connection.',
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
