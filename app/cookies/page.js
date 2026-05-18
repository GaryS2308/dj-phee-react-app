import CookiePolicy from '../../src/components/pages/legal/CookiePolicy';

export const metadata = {
  title: 'Cookie Policy for DJ PHEE Website',
  description: 'Learn which cookies and analytics tools are used on the DJ PHEE website and how you can manage your cookie preferences.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/cookies'
  },
  openGraph: {
    title: 'Cookie Policy for DJ PHEE Website',
    description: 'Learn which cookies and analytics tools are used on the DJ PHEE website and how you can manage your cookie preferences.',
    url: 'https://phee.co.za/cookies',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy for DJ PHEE Website',
    description: 'Learn which cookies and analytics tools are used on the DJ PHEE website and how you can manage your cookie preferences.'
  }
};

export default function CookiesPage() {
  return (
    <main>
      <CookiePolicy />
    </main>
  );
}
