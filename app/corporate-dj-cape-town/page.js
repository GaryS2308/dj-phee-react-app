import HeroBanner from '../../src/components/hero/HeroBanner';
import CorporateDjPage from '../../src/components/pages/corporate-dj/CorporateDjPage';

export const metadata = {
  title: 'Corporate Event DJ Cape Town | DJ PHEE',
  description:
    'Hire DJ PHEE for corporate events in Cape Town. Year-end functions, brand launches, company parties and conference entertainment. Professional setup, versatile sets, rates from R2,000/hr.',
  alternates: {
    canonical: '/corporate-dj-cape-town'
  },
  openGraph: {
    title: 'Corporate Event DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE for corporate events in Cape Town. Year-end functions, brand launches, company parties and conference entertainment. Professional setup, versatile sets, rates from R2,000/hr.',
    url: 'https://phee.co.za/corporate-dj-cape-town',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corporate Event DJ Cape Town | DJ PHEE',
    description:
      'Hire DJ PHEE for corporate events in Cape Town. Year-end functions, brand launches, company parties and conference entertainment. Professional setup, versatile sets, rates from R2,000/hr.'
  }
};

export default function CorporateDjRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Corporate Event DJ Cape Town",
    "description": "Professional DJ services for corporate events in Cape Town, including year-end functions, brand launches, company parties and conference entertainment.",
    "url": "https://phee.co.za/corporate-dj-cape-town",
    "provider": {
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
    "serviceType": "Corporate DJ",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroBanner
        title="CORPORATE DJ"
        seoTitle="Corporate Event DJ Cape Town | DJ PHEE"
        subtitle="Professional DJ services for company events, brand launches and year-end functions across Cape Town."
        image="https://res.cloudinary.com/dea6wzxd8/image/upload/v1768549868/Phee_Hero_photo_rz1dei.jpg"
        ctaLabel="GET A QUOTE"
        ctaHref="/booking#booking"
      />
      <CorporateDjPage />
    </main>
  );
}
