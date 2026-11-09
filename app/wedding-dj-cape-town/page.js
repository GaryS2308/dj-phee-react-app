import HeroBanner from '../../src/components/hero/HeroBanner';
import WeddingDjPage from '../../src/components/pages/wedding-dj/WeddingDjPage';
import { getOpenGraphImages, getShareImageUrl, heroImages } from '../seo';

export const metadata = {
  title: 'Wedding DJ Cape Town | DJ PHEE',
  description:
    'Hire DJ PHEE as your wedding DJ in Cape Town. Afrotech specialist covering ceremony, cocktail hour and full reception sets across the Western Cape. Rates from R2,000/hr.',
  alternates: {
    canonical: '/wedding-dj-cape-town'
  },
  openGraph: {
    title: 'Wedding DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE as your wedding DJ in Cape Town. Afrotech specialist covering ceremony, cocktail hour and full reception sets across the Western Cape. Rates from R2,000/hr.',
    url: 'https://phee.co.za/wedding-dj-cape-town',
    type: 'website',
    images: getOpenGraphImages(heroImages.primary, 'DJ PHEE wedding DJ hero photo')
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE as your wedding DJ in Cape Town. Afrotech specialist covering ceremony, cocktail hour and full reception sets across the Western Cape. Rates from R2,000/hr.',
    images: [getShareImageUrl(heroImages.primary)]
  }
};

export default function WeddingDjRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Wedding DJ Cape Town",
    "description": "Professional wedding DJ services in Cape Town and the Western Cape, covering ceremony, cocktail hour and reception sets. Afrotech specialist with all-genre capability.",
    "url": "https://phee.co.za/wedding-dj-cape-town",
    "provider": {
      "@id": "https://phee.co.za/#person",
      "@type": "Person",
      "name": "PHEE",
      "jobTitle": "DJ",
      "url": "https://phee.co.za",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cape Town",
        "addressRegion": "Western Cape",
        "addressCountry": "ZA"
      }
    },
    "areaServed": ["Cape Town", "Western Cape", "South Africa"],
    "serviceType": "Wedding DJ",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "ZAR",
      "price": "2000",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "2000",
        "priceCurrency": "ZAR",
        "unitText": "per hour"
      }
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, {
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://phee.co.za/' },
            { '@type': 'ListItem', position: 2, name: jsonLd.name, item: jsonLd.url }
          ]
        }]) }}
      />
      <HeroBanner
        title="WEDDING DJ"
        seoTitle="Wedding DJ Cape Town | DJ PHEE"
        subtitle="From ceremony to last dance, professional wedding DJ services across Cape Town and the Western Cape."
        image={heroImages.primary}
        ctaLabel="GET A QUOTE"
        ctaHref="/booking#booking"
      />
      <WeddingDjPage />
    </main>
  );
}
