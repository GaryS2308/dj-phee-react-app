# DJ PHEE Website (Next.js Static Export)

This project powers `https://phee.co.za` using Next.js App Router and Firebase Hosting.

## Stack
- Next.js 14 (App Router, static export)
- React 18
- Firebase Firestore
- EmailJS

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open `http://localhost:3000`

## Build and Deploy
- Production build + static export:
```bash
npm run build
```
- Deploy to Firebase Hosting:
```bash
npm run deploy:firebase
```

## Project Structure
- `app/`: routes, metadata, robots, sitemap
- `src/components/`: UI components and page sections
- `src/utils/`: client-side utilities
- `public/`: static assets only (for this project: favicon and links helper files)
- `scripts/verify-static-export.mjs`: checks required exported pages after build

## SEO Notes
- Metadata is defined per route in `app/*/page.js`.
- Global metadata is in `app/layout.js`.
- `robots.txt` and `sitemap.xml` are generated from:
  - `app/robots.txt/route.js`
  - `app/sitemap.xml/route.js`

## Maintenance Tips
- If dev server shows missing chunk/module errors, clear Next cache:
```bash
rm -rf .next
```
- Re-run `npm run dev`.
