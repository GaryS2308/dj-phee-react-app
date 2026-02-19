const getSitemap = () => {
  const urls = [
    'https://phee.co.za/',
    'https://phee.co.za/bio',
    'https://phee.co.za/past-events',
    'https://phee.co.za/gallery',
    'https://phee.co.za/booking',
    'https://phee.co.za/links',
    'https://phee.co.za/privacy',
    'https://phee.co.za/cookies',
    'https://phee.co.za/terms',
    'https://phee.co.za/cancellation'
  ];

  const body = urls
    .map(
      (url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
};

export async function GET() {
  const xml = getSitemap();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
