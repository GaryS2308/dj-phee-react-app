const getSitemap = () => {
  const urls = [
    'https://phee.co.za/',
    'https://phee.co.za/bio',
    'https://phee.co.za/past-events',
    'https://phee.co.za/gallery',
    'https://phee.co.za/booking',
    'https://phee.co.za/wedding-dj-cape-town',
    'https://phee.co.za/corporate-dj-cape-town',
    'https://phee.co.za/event-dj-cape-town'
  ];

  const body = urls
    .map((url) => {
      return `<url><loc>${url}</loc></url>`;
    })
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
