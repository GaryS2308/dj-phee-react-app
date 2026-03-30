import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const buildDir = fs.existsSync(path.join(projectRoot, 'build'))
  ? path.join(projectRoot, 'build')
  : path.join(projectRoot, 'out');

if (!fs.existsSync(buildDir)) {
  console.error(`Static export output not found. Expected build/ or out/ in ${projectRoot}.`);
  process.exit(1);
}

const routeSignatures = [
  {
    route: '/',
    signature: 'Professional DJ for corporate events, clubs, festivals and private functions in Cape Town.'
  },
  {
    route: '/bio',
    signature: 'Cape Town-based DJ delivering high-energy Afrotech sets for private and public events.'
  },
  {
    route: '/past-events',
    signature: 'performed at a wide range of Cape Town clubs'
  },
  {
    route: '/gallery',
    signature: 'High-energy moments from DJ Phee’s performances across Cape Town'
  },
  {
    route: '/booking',
    signature: 'Book DJ Phee for your next event in Cape Town'
  },
  {
    route: '/links',
    signature: 'DJ PHEE Bookings'
  },
  {
    route: '/privacy',
    signature: 'collects, uses, and protects personal information'
  },
  {
    route: '/cookies',
    signature: 'Cookie Policy for DJ PHEE Website'
  },
  {
    route: '/terms',
    signature: 'Booking Terms and Conditions'
  },
  {
    route: '/cancellation',
    signature: 'Booking Cancellation Policy'
  }
];

const resolveHtmlPath = (route) => {
  if (route === '/') {
    return path.join(buildDir, 'index.html');
  }

  const normalized = route.replace(/^\//, '');
  const indexPath = path.join(buildDir, normalized, 'index.html');
  const htmlPath = path.join(buildDir, `${normalized}.html`);

  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  if (fs.existsSync(htmlPath)) {
    return htmlPath;
  }

  return null;
};

const failures = [];

const legacyLinksRedirectPath = path.join(buildDir, 'links', 'index.html');
if (fs.existsSync(legacyLinksRedirectPath)) {
  const legacyLinksHtml = fs.readFileSync(legacyLinksRedirectPath, 'utf8');
  if (
    legacyLinksHtml.includes("sessionStorage.redirect = '/links'") ||
    legacyLinksHtml.includes('http-equiv="refresh"') ||
    legacyLinksHtml.includes('window.location.replace')
  ) {
    failures.push({
      route: '/links',
      reason: 'Legacy redirect stub detected at build/links/index.html'
    });
  }
}

for (const { route, signature } of routeSignatures) {
  const htmlPath = resolveHtmlPath(route);

  if (!htmlPath) {
    failures.push({
      route,
      reason: 'Missing exported HTML file'
    });
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  if (!html.includes(signature)) {
    failures.push({
      route,
      reason: `Signature string not found: "${signature}"`
    });
  }
}

if (failures.length) {
  console.error('Static export verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure.route}: ${failure.reason}`);
  }
  process.exit(1);
}

console.log(`Static export verification passed for ${routeSignatures.length} routes in ${buildDir}.`);
