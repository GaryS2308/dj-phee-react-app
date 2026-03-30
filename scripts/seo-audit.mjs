import fs from 'fs';
import path from 'path';

const SITE_ORIGIN = 'https://phee.co.za';
const PUBLIC_ROUTES = [
  '/',
  '/bio',
  '/past-events',
  '/gallery',
  '/booking',
  '/links',
  '/privacy',
  '/cookies',
  '/terms',
  '/cancellation'
];
const NOINDEX_ROUTES = ['/response'];
const GLOBAL_KEYWORDS = [
  'dj',
  'book',
  'booking',
  'cape town',
  'events',
  'private events',
  'weddings',
  'clubs',
  'festivals',
  'brand launches',
  'afrotech',
  'afro tech',
  'afro-tech'
];
const ROUTE_KEYWORDS = new Map([
  ['/', ['book dj', 'cape town', 'private events', 'weddings', 'festivals', 'afrotech']],
  ['/bio', ['dj bio', 'afrotech', 'afro tech', 'cape town', 'versatile']],
  ['/booking', ['book dj', 'booking', 'brand launches', 'private events', 'travel']],
  ['/past-events', ['past events', 'clubs', 'festivals', 'cape town']],
  ['/gallery', ['gallery', 'performances', 'events']],
  ['/links', ['bookings', 'music', 'contact']],
  ['/privacy', ['privacy policy', 'personal information']],
  ['/cookies', ['cookie policy', 'analytics', 'cookies']],
  ['/terms', ['terms and conditions', 'booking terms']],
  ['/cancellation', ['cancellation policy', 'bookings']],
  ['/response', ['booking response']]
]);

const MIN_TEXT_LENGTH = new Map([
  ['/', 350],
  ['/bio', 220],
  ['/past-events', 180],
  ['/gallery', 80],
  ['/booking', 220],
  ['/links', 70],
  ['/privacy', 160],
  ['/cookies', 160],
  ['/terms', 160],
  ['/cancellation', 120],
  ['/response', 0]
]);

const projectRoot = process.cwd();
const buildDir = fs.existsSync(path.join(projectRoot, 'build'))
  ? path.join(projectRoot, 'build')
  : path.join(projectRoot, 'out');

if (!fs.existsSync(buildDir)) {
  console.error(`SEO audit failed: static export directory not found at ${buildDir}`);
  process.exit(1);
}

const resolveHtmlPath = (route) => {
  if (route === '/') {
    return path.join(buildDir, 'index.html');
  }

  const normalized = route.replace(/^\//, '');
  const htmlPath = path.join(buildDir, `${normalized}.html`);
  const indexPath = path.join(buildDir, normalized, 'index.html');

  if (fs.existsSync(htmlPath)) return htmlPath;
  if (fs.existsSync(indexPath)) return indexPath;
  return null;
};

const getCanonicalForRoute = (route) => {
  if (route === '/') return SITE_ORIGIN;
  return `${SITE_ORIGIN}${route}`;
};

const extract = (html, regex) => {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
};

const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const decodeEntities = (value) =>
  value
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const extractHeadingTexts = (html, tagName) => {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches = [];
  let match = regex.exec(html);
  while (match) {
    const headingText = stripHtml(decodeEntities(match[1]));
    if (headingText) matches.push(headingText);
    match = regex.exec(html);
  }
  return matches;
};

const countKeyword = (text, keyword) => {
  if (!text || !keyword) return 0;
  const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

const failures = [];
const warnings = [];
const reports = [];

const checkPage = (route, expectNoindex = false) => {
  const htmlPath = resolveHtmlPath(route);
  if (!htmlPath) {
    failures.push(`${route}: missing HTML export`);
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const title = decodeEntities(extract(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decodeEntities(
    extract(html, /<meta name="description" content="([\s\S]*?)"\s*\/?>/i)
  );
  const canonical = extract(html, /<link rel="canonical" href="([\s\S]*?)"\s*\/?>/i);
  const robots = extract(html, /<meta name="robots" content="([\s\S]*?)"\s*\/?>/i).toLowerCase();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const h1Headings = extractHeadingTexts(html, 'h1');
  const h2Headings = extractHeadingTexts(html, 'h2');
  const h3Headings = extractHeadingTexts(html, 'h3');

  const mainHtml = extract(html, /<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const bodyHtml = extract(html, /<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  const text = stripHtml(mainHtml || bodyHtml);
  const textLength = text.length;
  const keywordTargets = [...new Set([...GLOBAL_KEYWORDS, ...(ROUTE_KEYWORDS.get(route) || [])])];
  const keywordBreakdown = keywordTargets.map((keyword) => ({
    keyword,
    titleCount: countKeyword(title.toLowerCase(), keyword.toLowerCase()),
    descriptionCount: countKeyword(description.toLowerCase(), keyword.toLowerCase()),
    bodyCount: countKeyword(text.toLowerCase(), keyword.toLowerCase())
  }));
  const missingKeywords = keywordBreakdown
    .filter((item) => item.titleCount + item.descriptionCount + item.bodyCount === 0)
    .map((item) => item.keyword);

  if (!title) failures.push(`${route}: missing <title>`);
  if (!description) failures.push(`${route}: missing meta description`);
  if (!canonical) failures.push(`${route}: missing canonical URL`);

  const expectedCanonical = getCanonicalForRoute(route);
  if (canonical && canonical !== expectedCanonical) {
    failures.push(`${route}: canonical mismatch (expected ${expectedCanonical}, found ${canonical})`);
  }

  if (expectNoindex) {
    if (!robots.includes('noindex')) {
      failures.push(`${route}: expected noindex`);
    }
  } else if (robots.includes('noindex')) {
    failures.push(`${route}: unexpected noindex`);
  }

  if (!expectNoindex && textLength < (MIN_TEXT_LENGTH.get(route) || 80)) {
    failures.push(`${route}: very low crawlable text content (${textLength} chars)`);
  }

  if (h1Count !== 1) {
    warnings.push(`${route}: expected 1 <h1>, found ${h1Count}`);
  }

  if (!expectNoindex && title && (title.length < 25 || title.length > 70)) {
    warnings.push(`${route}: title length ${title.length} chars (recommended ~25-70)`);
  }

  if (!expectNoindex && description && (description.length < 80 || description.length > 170)) {
    warnings.push(`${route}: description length ${description.length} chars (recommended ~80-170)`);
  }

  reports.push({
    route,
    title,
    description,
    h1Headings,
    h2Headings,
    h3Headings,
    titleLength: title.length,
    descriptionLength: description.length,
    h1Count,
    textLength,
    keywordBreakdown,
    missingKeywords
  });
};

for (const route of PUBLIC_ROUTES) {
  checkPage(route, false);
}

for (const route of NOINDEX_ROUTES) {
  checkPage(route, true);
}

const legacyLinksRedirectPath = path.join(buildDir, 'links', 'index.html');
if (fs.existsSync(legacyLinksRedirectPath)) {
  const legacyLinksHtml = fs.readFileSync(legacyLinksRedirectPath, 'utf8');
  if (
    legacyLinksHtml.includes("sessionStorage.redirect = '/links'") ||
    legacyLinksHtml.includes('http-equiv="refresh"') ||
    legacyLinksHtml.includes('window.location.replace')
  ) {
    failures.push('/links: legacy redirect stub detected at build/links/index.html');
  }
}

const robotsPath = path.join(buildDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  failures.push('robots.txt: missing');
} else {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  if (!/User-agent:\s*\*/i.test(robotsTxt)) failures.push('robots.txt: missing User-agent: *');
  if (!/Allow:\s*\/\s*/i.test(robotsTxt)) warnings.push('robots.txt: missing Allow: /');
  if (!/Sitemap:\s*https:\/\/phee\.co\.za\/sitemap\.xml/i.test(robotsTxt)) {
    failures.push('robots.txt: missing sitemap URL');
  }
}

const sitemapPath = path.join(buildDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  failures.push('sitemap.xml: missing');
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  for (const route of PUBLIC_ROUTES) {
    const expectedLoc = route === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
    if (!locs.includes(expectedLoc)) {
      failures.push(`sitemap.xml: missing ${expectedLoc}`);
    }
  }
}

console.log('SEO audit report');
for (const row of reports) {
  console.log(
    `- ${row.route}: text=${row.textLength}, h1=${row.h1Count}, title=${row.titleLength}, desc=${row.descriptionLength}`
  );
  console.log(`  title: ${row.title || '(missing)'}`);
  console.log(`  description: ${row.description || '(missing)'}`);
  console.log(`  headings.h1: ${row.h1Headings.length ? row.h1Headings.join(' | ') : '(none)'}`);
  console.log(`  headings.h2: ${row.h2Headings.length ? row.h2Headings.join(' | ') : '(none)'}`);
  console.log(`  headings.h3: ${row.h3Headings.length ? row.h3Headings.join(' | ') : '(none)'}`);
  console.log('  keywords:');
  for (const keyword of row.keywordBreakdown) {
    const total = keyword.titleCount + keyword.descriptionCount + keyword.bodyCount;
    if (total === 0) continue;
    console.log(
      `    - ${keyword.keyword}: total=${total} (title=${keyword.titleCount}, desc=${keyword.descriptionCount}, body=${keyword.bodyCount})`
    );
  }
  if (row.missingKeywords.length) {
    console.log(`  keywords.missing: ${row.missingKeywords.join(', ')}`);
  } else {
    console.log('  keywords.missing: (none)');
  }
}

if (warnings.length) {
  console.log('\nWarnings');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.error('\nFailures');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nSEO audit passed with no blocking failures.');
