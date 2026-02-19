export async function GET() {
  const content = `User-agent: *
Allow: /

Sitemap: https://phee.co.za/sitemap.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
