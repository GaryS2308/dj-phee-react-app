import CookiePolicy from '../../src/components/pages/legal/CookiePolicy';

export const metadata = {
  title: 'Cookie Policy',
  description: 'How PHEE uses cookies and analytics.',
  alternates: {
    canonical: '/cookies'
  },
  openGraph: {
    title: 'Cookie Policy | PHEE',
    description: 'How PHEE uses cookies and analytics.',
    url: 'https://phee.co.za/cookies',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | PHEE',
    description: 'How PHEE uses cookies and analytics.'
  }
};

export default function CookiesPage() {
  return (
    <main>
      <h1 className="sr-only">Cookie Policy</h1>
      <CookiePolicy />
    </main>
  );
}
