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
- `app/admin`: private noindex admin dashboard routes
- `lib/firestore`: Firestore booking and invoice helpers
- `lib/analytics`: reusable revenue and tax reporting calculations
- `src/utils/`: client-side utilities
- `public/`: static assets only (for this project: favicon and links helper files)
- `scripts/verify-static-export.mjs`: checks required exported pages after build

## Admin Dashboard
- Visit `/admin` and sign in with a Firebase Authentication admin user.
- The dashboard reads the existing Firestore `bookings` collection and normalizes current booking-form fields such as `name`, `email`, `event`, `event_date`, `duration`, `location`, `details`, and `timestamp`.
- Admin routes are marked `noindex` and hidden from the public navigation.
- Booking detail is opened from `/admin/bookings` with a `?booking=<documentId>` query, which keeps the feature compatible with static export.
- Invoice metadata is written to the `invoices` collection when an invoice is generated from a booking.
- CSV exports are available for bookings and invoices from the admin header, invoice page, and reports page.

Create `.env.local` from `.env.example` if you want to configure Firebase outside source:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Suggested Firestore rules for the admin workflow:
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function isAdmin() {
      return isSignedIn() && request.auth.token.admin == true;
    }
    match /bookings/{bookingId} {
      allow read, update: if isAdmin();
      allow create: if true;
      allow delete: if false;
    }
    match /invoices/{invoiceId} {
      allow read, write: if isAdmin();
    }
  }
}
```

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
