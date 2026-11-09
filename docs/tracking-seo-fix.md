# Tracking and SEO changes — 20 October 2026

Implemented locally; not pushed or deployed. Existing unrelated working-tree changes were preserved.

## Findings and changes

- `src/components/ClientShell.jsx`: replaced three independent analytics loaders (direct gtag, Firebase Analytics, GTM) with one consent-gated Next Script loader. Retained existing measurement ID G-0FHGPWSFKK, overridable with NEXT_PUBLIC_GA_MEASUREMENT_ID. Configures once; relies on GA4 Enhanced Measurement for history page views. Excludes admin and booking-response routes, with a disable flag set before programmatic history changes. GTM container contents were not inspected; any non-GA tags in that container no longer load.
- `src/utils/consent.js`: revocation/reset disables measurement and clears GA cookies. Existing banner text, design and storage key unchanged.
- `lib/siteAnalytics.js`: delegated click tracking and allowlisted event parameters; no form names, email addresses, phones, dates, locations or messages are sent in custom events. Query strings omitted from custom-event page locations. Debug mode via ?ga_debug=1.
- `BookingForm.jsx`: generate_lead only after EmailJS succeeds; synchronous submission lock prevents duplicate submissions until an explicit new booking. Removed the previous dataLayer object containing event details. Tracks validation, Firestore and EmailJS failures separately.
- `firebase.json`: regional Google Analytics collection hosts permitted by CSP; legacy corporate URL redirected permanently; trailing-slash normalization configured.
- Homepage and service route files: connected entity IDs, service breadcrumbs, homepage FAQ schema generated from the same data as the visible FAQs. No visible FAQ text changed.
- Sitemap: removed arbitrary weekly change frequency and priority values. Did not invent lastmod dates: deployment dates are not reliable content-modification dates.
- Robots: excludes admin and booking-response routes; static assets remain crawlable.
- SEO audit: checks all three service pages and honors existing intentional noindex routes.

## Custom events

All include a query-free page_location; debug_mode=true when requested.

| Event | Parameters |
| --- | --- |
| generate_lead | form_id, event_type (fixed categories; free text becomes other) |
| booking_form_error | form_id, error_type (validation, firestore_failed, emailjs_failed) |
| booking_estimate | hours, value, currency |
| cta_click | cta_text, cta_location, link_url |
| email_click | link_location |
| phone_click | link_location |
| whatsapp_click | link_location |
| social_click | platform, link_location |

## Verification

- Production build including Next lint/type checks passed.
- Static export verification passed.
- Analytics helper tests passed: consent, private routes, parameter filtering, category sanitization, SSR safety, click classification.
- SEO audit passed, with existing long-description warnings on corporate and event pages.
- Live legacy corporate URL confirmed 404 before deployment.
- Live HTTP and www variants confirmed 301 to https://phee.co.za/.

## Limits and follow-up

This implements basic consent mode: ignored/rejected consent does not send analytics. Advanced mode proposed in the supplied notes was not enabled, and policy wording was not changed. GA4 therefore still measures only consenting visitors; Search Console clicks and GA4 sessions are different metrics.

No GA4/Search Console account data was accessed. The supplied traffic figures and reported October decline remain unverified. There is no basis yet to attribute the decline entirely to tracking or to promise ranking gains from schema.

Before production release, verify real GA requests and one page_view per navigation with Enhanced Measurement enabled, consent acceptance/rejection/reset, public-to-admin navigation including browser back, and a controlled successful booking in GA4 DebugView. No test booking or email was sent. Mark generate_lead as a key event in GA4 and configure internal-traffic filtering. Compare Search Console clicks, impressions, queries and indexed pages across equal periods.

No preview deployment, screenshot comparison, Lighthouse run or external schema validator was performed. No mix playback integration was added. Code changes do not alter styles, page copy, layout or image assets, but pixel identity has not been independently verified.
