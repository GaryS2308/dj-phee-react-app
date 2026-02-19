import PrivacyPolicy from '../../src/components/pages/legal/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How PHEE collects, uses, and protects personal information.',
  alternates: {
    canonical: '/privacy'
  },
  openGraph: {
    title: 'Privacy Policy | PHEE',
    description: 'How PHEE collects, uses, and protects personal information.',
    url: 'https://phee.co.za/privacy',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | PHEE',
    description: 'How PHEE collects, uses, and protects personal information.'
  }
};

export default function PrivacyPage() {
  return (
    <main>
      <h1 className="sr-only">Privacy Policy</h1>
      <PrivacyPolicy />
    </main>
  );
}
