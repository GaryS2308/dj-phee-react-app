# Admin Dashboard — Full Replication Guide & Prompts

This document contains:
1. A full system architecture reference
2. Eight page-specific prompts to replicate every feature precisely

Hand each numbered prompt to a fresh Claude instance in order. Each prompt is self-contained. Complete each one fully before moving to the next, as later pages depend on the data layer built in earlier ones.

---

## SYSTEM ARCHITECTURE REFERENCE

### Tech Stack
- Next.js App Router (`app/` directory, all admin pages use `'use client'`)
- Firebase Firestore (real-time listeners via `onSnapshot`)
- Firebase Auth (email/password, `signInWithEmailAndPassword`)
- No chart library — all charts are custom SVG/CSS
- No UI component library — all components are bespoke

### Firestore Collections

| Collection | Purpose |
|---|---|
| `bookings` | All event bookings (web form or admin-created) |
| `invoices` | Financial invoices with line items |
| `quotations` | Quotes sent before invoicing |
| `clients` | Saved contact records (auto-aggregated) |
| `quoteServices` | Preset service line items |
| `documentTemplates` | PDF styling configuration |

### Environment Variables Required
```
NEXT_PUBLIC_ADMIN_EMAILS=youremail@domain.com   # comma-separated for multiple admins
```

### URL Routes
```
/admin              → Overview
/admin/bookings     → Bookings list
/admin/revenue      → Revenue charts
/admin/quotations   → Quotations list + editor
/admin/invoices     → Invoices list + editor
/admin/clients      → Client CRM
/admin/reports      → Reports & exports
/admin/settings     → Settings & templates
```

### Query Parameter Convention
`?booking={bookingId}` on `/admin/quotations` or `/admin/invoices` pre-fills the editor from that booking's data.

---

## CRITICAL SHARED DATA LOGIC

These functions must be implemented exactly — all pages depend on them.

### Currency Display
```js
function money(value) {
  return `R ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value) || 0)}`;
}
// Output: "R 15,200"
```

### Outstanding Balance Per Booking
```js
function outstandingForBooking(booking) {
  const quoted = Number(booking.quotedAmount || 0);
  const paid = Number(booking.amountPaid || 0);
  const status = String(booking.status || '').toLowerCase();
  if (['accepted', 'completed', 'confirmed'].includes(status)) return Math.max(quoted - paid, 0);
  if (status === 'cancelled') {
    const percent = Number(booking.cancellationFeePercent || 0);
    return Math.max((quoted * (percent / 100)) - paid, 0);
  }
  return 0; // pending/enquiry/declined owe nothing
}
```

### Client Deduplication Key
```js
function clientKey({ email, phone, name }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanEmail) return `email:${cleanEmail}`;
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone) return `phone:${cleanPhone}`;
  return `name:${String(name || '').toLowerCase().replace(/\s+/g, '-')}`;
}
```

### Event Type Normalisation
Canonical options: `['event / club', 'festival', 'wedding', 'private event', 'brand activation', 'other']`

Map free text → canonical via substring matching (festival, wedding, corporate/brand/activation, private/birthday/party, club/bar/event → other as fallback).

### Invoice Numbering
Format: `INV-{year}-{padded 4-digit sequence}`
Scan all existing invoices for the current year, find the max sequence, increment by 1.
Quote numbering: same pattern with `QUO-` prefix.

### Booking ↔ Invoice Bi-Directional Status Sync

**When booking STATUS changes → update all linked invoices:**
- `accepted/confirmed/completed` → invoice keeps its payment state; if invoice was `draft` or `cancelled`, bump to `sent`
- `cancelled` → invoice status = `'cancelled'`, `balanceDue = max((invoice.total * cancellationFeePercent/100) - invoice.amountPaid, 0)`
- `pending/enquiry/declined` → invoice status = `'draft'`, `balanceDue = 0`

**When booking PAYMENT STATUS changes → update all linked invoices:**
- `paid` → invoice: `status='paid'`, `amountPaid=invoice.total`, `balanceDue=0`
- `deposit` → invoice: `status='partial'`, `amountPaid=min(booking.amountPaid, invoice.total)`, `balanceDue=max(total-paid, 0)`
- `unpaid` → invoice: `status=('draft' if was draft, else 'sent')`, `amountPaid=0`, `balanceDue=invoice.total`

**Finding linked invoices:** `invoice.bookingId === booking.id` OR `invoice.invoiceNumber === booking.invoiceNumber`

### Auto-Create Booking from Quote or Invoice (`ensureBookingForQuotation` / `ensureBookingForInvoice`)
- If the document has a `bookingId` → update that booking (never create a new one)
- If no `bookingId` → call `createManualBooking()`, store the returned ID on the quote/invoice
- Quote status → booking status: `accepted→accepted`, `declined/expired→declined`, otherwise `pending`
- Invoice status → booking status: `paid→accepted`, `draft→pending`, otherwise `accepted`

---

---

# PROMPT 1 — FOUNDATION, AUTH & DATA LAYER

> Use this prompt first. It establishes all shared utilities, Firestore listeners, normalisation functions, and the auth wrapper that every other page depends on.

---

## PROMPT

You are building the complete data and authentication foundation for a DJ/performer admin dashboard. This is a Next.js App Router project using Firebase Firestore and Firebase Auth. Do not build any UI pages yet — only the shared infrastructure.

**Your aesthetic brief:** The dashboard is for a DJ. Style it as a dark, high-contrast professional tool. Dark backgrounds (`#0a0a0a`, `#111`, `#1a1a1a`), off-white/cream text (`#f0ece4`), a deep red accent (`#9b1c24`), and amber/gold secondary tones (`#c49a3c`). Monospace headings, clean sans-serif body. It must feel like a music industry operations tool, not a generic SaaS dashboard. Apply this aesthetic consistently across all CSS you write for the dashboard.

---

### STEP 1 — File structure to create

```
lib/adminUtils.js
lib/adminDataShapes.js
lib/adminBookingLinks.js
lib/adminCrm.js
lib/adminCsv.js
lib/analytics/revenue.js
lib/analytics/tax.js
lib/firestore/bookings.js
lib/firestore/invoices.js
lib/firestore/quotations.js
lib/firestore/clients.js
lib/firestore/quoteServices.js
lib/firestore/documentTemplates.js
lib/firestore/adminCollections.js
src/components/admin/AdminProvider.jsx
app/admin/layout.js
app/admin/page.js
app/admin/bookings/page.js
app/admin/revenue/page.js
app/admin/quotations/page.js
app/admin/invoices/page.js
app/admin/clients/page.js
app/admin/reports/page.js
app/admin/settings/page.js
```

---

### STEP 2 — `lib/adminUtils.js`

Implement these exports exactly:

```js
export function uid()          // crypto.randomUUID() with fallback
export function today()        // returns YYYY-MM-DD string for today
export function addDays(days)  // returns YYYY-MM-DD string for today + n days
export function money(value)   // "R 15,200" — ZAR, no decimals, comma separators
export function dateLabel(value) // toLocaleDateString('en-ZA'), handles Date/Timestamp/string
export function num(value)     // Number(value), returns 0 if not finite
export function safeText(value) // String(value ?? '').trim()
export function nextNumber(prefix, count) // "PREFIX-0001" format
export function clientKey({ email, phone, name }) // composite dedup key: "email:x" | "phone:x" | "name:x"
export function saveLocal(key, data)  // JSON.stringify to localStorage
export function loadLocal(key)        // JSON.parse from localStorage, returns null on error

export const ADMIN_LOCAL_KEYS = {
  quotations: 'phee-admin-quotations',
  invoices: 'phee-admin-invoices',
  clients: 'phee-admin-clients',
  quoteServices: 'phee-admin-quoteServices',
  documentTemplates: 'phee-admin-documentTemplates'
}
```

`clientKey` priority: email (lowercase, trimmed) → phone (digits only, strip non-numeric) → name (lowercase, hyphens for spaces).

---

### STEP 3 — `lib/adminDataShapes.js`

Implement these exports:

**Constants:**
```js
export const BOOKING_STATUSES = ['pending', 'accepted', 'completed', 'cancelled', 'declined']
export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid']
export const EVENT_TYPE_OPTIONS = ['event / club', 'festival', 'wedding', 'private event', 'brand activation', 'other']
export const STARTER_QUOTE_SERVICES = [
  { id: 'starter-dj-performance', name: 'DJ Performance', category: 'DJ Sets', unit: 'hours', defaultQty: 1, unitPrice: 2500 },
  { id: 'starter-sound-system', name: 'Sound System', category: 'Sound', unit: 'sets', defaultQty: 1, unitPrice: 4500 },
  { id: 'starter-lighting-package', name: 'Lighting Package', category: 'Lighting', unit: 'sets', defaultQty: 1, unitPrice: 3200 }
]
export const DEFAULT_DOCUMENT_TEMPLATE = {
  id: 'default-template',
  name: 'Default',
  businessName: 'YOUR BUSINESS NAME',
  roleTitle: 'DJ / Music Producer',
  logoUrl: '/favicon.png',
  accentColor: '#9b1c24',
  documentBackground: '#f2eee5',
  headerBackground: '#080808',
  headerTextColor: '#ffffff',
  bodyTextColor: '#34302a',
  labelColor: '#8a6a2f',
  panelBackground: '#f7f2ea',
  panelBorderColor: '#ded4c3',
  tableHeaderBackground: '#17100d',
  tableHeaderTextColor: '#ffffff',
  totalsBackground: '#17100d',
  totalsTextColor: '#ffffff',
  businessEmail: '',
  businessPhone: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  branchCode: '',
  invoiceTerms: 'Payment is due by the due date shown on this invoice. Booking is confirmed once the required deposit has cleared.',
  quotationTerms: 'This quotation is valid until the date shown above. Availability is subject to confirmation and deposit payment.',
  isDefault: true
}
```

**Functions:**
- `normalizeEventTypeOption(value)` — maps free text to canonical event type using substring matching
- `normalizeLineItem(data)` — normalises a line item; field aliases: `qty`/`quantity`/`defaultQty`, `price`/`rate`/`unitPrice`; computes `total = quantity * unitPrice` if not set
- `normalizeQuoteService(id, data)` — normalises a service record
- `normalizeDocumentTemplate(id, data)` — merges with DEFAULT_DOCUMENT_TEMPLATE, every field has fallback
- `normalizeClientRecord(id, data)` — client with `clientKey` computed
- `normalizeQuotation(id, data)` — full quotation with computed `subtotal`, `total`, `depositDue = round(total * depositPercent/100)`, defaults: `depositPercent=50`, `issueDate=today()`, `validUntil=addDays(14)`
- `normalizeInvoiceDoc(id, data)` — full invoice with computed totals; `balanceDue = max(total - amountPaid, 0)`; maps legacy status `'issued'` → `'sent'`

---

### STEP 4 — `lib/analytics/revenue.js`

```js
export const RATE_PER_HOUR = 2000

export function toDate(value)
// Handles: Date, Firebase Timestamp (.toDate()), number (ms), ISO string, "DD MMM YYYY" string

export function parseDurationToHours(duration)
// Parses: "4hr", "3 hours 30 minutes", "2.5h", raw number strings

export function currency(value)  // alias for money()

export function outstandingForBooking(booking)
// accepted/completed/confirmed → max(quoted - paid, 0)
// cancelled → max((quoted * cancellationFeePercent/100) - paid, 0)
// pending/enquiry/declined → 0

export function normalizeBooking(id, data)
// Full normalisation. Key computed fields:
// - eventDate: toDate(data.eventDate || data.event_date || data.date)
// - createdAt: toDate(data.createdAt || data.timestamp || data.created_at)
// - quotedAmount: data.quotedAmount ?? data.totalAmount ?? data.amount ?? computed from duration * RATE_PER_HOUR
// - status: validated against ['pending','accepted','completed','cancelled','declined','enquiry','confirmed'], fallback logic
// - paymentStatus: validated, fallback computed from amountPaid vs quotedAmount
// - clientName: data.clientName || data.name || 'Unknown client'
// - eventLocation: data.eventLocation || data.location || 'Unspecified'
// - source: data.source || data.channel || 'Website'
// - notes: data.notes || data.details || ''

export function summarizeBookings(bookings)  // totals for overview metrics
export function groupByValue(bookings, getter, amountGetter)  // generic grouper, returns [{label, value, count}] sorted desc
export function revenueByMonth(bookings)  // groups earned bookings by YYYY-MM key, sums amountPaid
export function bookingsByStatus(bookings)
export function paymentsByStatus(bookings)
export function cancellationRate(bookings)
export function enquiryToConfirmedRate(bookings)
export function leadTimeDays(booking)  // days between createdAt and eventDate
export function averageLeadTime(bookings)
export function monthlyGrowthRate(months)  // % change last two months
export function yearOverYearGrowth(bookings)
```

Also implement `invoiceSummary(invoices)`:
- `totalInvoiced`: sum of `invoice.total` for active invoices (not draft/void/cancelled)
- `totalPaid`: sum of `invoice.amountPaid` (or full total if status=paid) for active invoices
- `outstanding`: sum of `invoice.balanceDue` for all invoices except draft and void
- `revenueThisMonth`, `revenueThisYear`: filter by issueDate or createdAt

---

### STEP 5 — `lib/analytics/tax.js`

```js
export function getSouthAfricanTaxYear(date)
// SA tax year: March 1 to last day of February
// Returns { label: '2024/25', start: Date, end: Date }
// If month >= 2 (March), current year is start year; otherwise year-1 is start year

export function taxYearSummary(bookings, date)
// Returns 12 monthly rows covering the SA tax year
// Each row: { key: 'YYYY-MM', month: 'Mar 2024', gross, paid, outstanding, cancelledQuoted, count }
// Plus totals object
// Only includes bookings where eventDate or createdAt falls within the tax year
```

---

### STEP 6 — Firestore listeners (`lib/firestore/`)

**`bookings.js`:**
```js
export function listenToBookings(onData, onError)
// query(collection(db, 'bookings'), orderBy('timestamp', 'desc'))
// Maps docs through normalizeBooking(doc.id, doc.data())

export async function getBooking(bookingId)
export function updateBooking(bookingId, patch)  // always adds updatedAt: serverTimestamp()
export function deleteBooking(bookingId)
export function createManualBooking(form)
// Writes to 'bookings' with: name, email, phone, event, eventType, event_date (formatted string),
// eventDate (Date object), start_time, end_time, duration, location, details/notes, status,
// quotedAmount, depositAmount, amountPaid, balanceAmount, cancellationFeePercent, paymentStatus,
// source, timestamp: serverTimestamp(), createdAt: serverTimestamp(), createdBy: 'admin-manual'
```

**`invoices.js`:**
```js
export function listenToInvoices(onData, onError)
// Falls back to localStorage('phee-admin-invoices') on permission error
export async function saveInvoice(record)
// Falls back to localStorage on permission error, returns { savedLocally: true }
export async function deleteInvoice(invoiceId)
export function nextInvoiceNumber(invoices, issueDate)
// Format: INV-{year}-{padded 4 digits}, scans existing for max sequence this year
```

**`quotations.js`:** Same pattern, collection `'quotations'`, number format `QUO-{year}-{sequence}`, localStorage fallback key `'phee-admin-quotations'`.

**`clients.js`:** `listenToClients(onData, onError)`, `saveClient(record)`, `deleteClient(id)`. Uses generic handler or direct Firestore calls.

**`quoteServices.js`:** `listenToQuoteServices`, `saveQuoteService`, `deleteQuoteService`. Falls back to `STARTER_QUOTE_SERVICES` if collection empty.

**`documentTemplates.js`:** `listenToDocumentTemplates`, `saveDocumentTemplate`, `deleteDocumentTemplate`. Falls back to `[DEFAULT_DOCUMENT_TEMPLATE]` if collection empty.

---

### STEP 7 — `lib/adminBookingLinks.js`

```js
export async function ensureBookingForQuotation({ draft, quoteNumber, totals, status })
// If draft.bookingId exists: updateBooking(bookingId, { quotedAmount, totalAmount, depositAmount, quoteNumber })
// If no bookingId: createManualBooking(...from draft fields..., status=bookingStatusFromQuote(status), source='admin-quotation')
//   then updateBooking(newId, { quoteNumber })
// Returns bookingId

export async function ensureBookingForInvoice({ draft, invoiceNumber, totals, status })
// Same pattern; if no bookingId: createManualBooking(..., source='admin-invoice')
//   then updateBooking(newId, { quotedAmount, totalAmount, depositAmount, amountPaid, balanceAmount, paymentStatus, invoiceNumber })
// Returns bookingId

// Status mapping helpers (internal):
// bookingStatusFromQuote: accepted→accepted, declined/expired→declined, else pending
// bookingStatusFromInvoice: paid→accepted, draft→pending, else accepted
// paymentStatusFromInvoice: paid or amountPaid>=total→'paid', amountPaid>0→'deposit', else 'unpaid'
```

---

### STEP 8 — `lib/adminCrm.js`

```js
export function aggregateClients({ clients, bookings, quotations, invoices })
// Deduplicates across all four sources using contactKey (email→phone→name priority)
// For each source, ensure() finds existing record by key, email match, phone match, or name match
// Accumulates: bookings[], quotations[], invoices[], invoicedTotal, paidTotal, outstandingBalance
// Returns sorted by invoicedTotal desc, then name asc
// Each record includes computed summary string and lastInteraction string

export function clientCsvRows(rows)  // for CSV export
export function outstandingBookingRows(bookings)  // filters bookings where outstandingForBooking > 0
export function revenueDetailRows({ bookings, invoices })
// One row per real job, no duplicates
// Step 1: One row per active (non-draft/non-void) invoice
// Step 2: Bookings with no linked invoice AND status is accepted/confirmed/completed, OR cancelled with fee > 0
// Dedup: checks booking.id in coveredBookingIds, booking.invoiceNumber set, or name+date fingerprint match
// Sort: eventDate descending
```

---

### STEP 9 — `lib/adminCsv.js`

```js
export function downloadCsv(filename, rows)
// Creates blob, downloads via hidden anchor. Escapes all values (wrap in quotes, double internal quotes)

export function bookingCsvRows(bookings)
// Columns: bookingId, invoiceNumber, clientName, clientEmail, clientPhone, eventType,
// eventDate, location, status, paymentStatus, quotedAmount, amountPaid, outstanding, source, notes

export function invoiceCsvRows(invoices)
// Columns: invoiceId, bookingId, quotationId, invoiceNumber, quoteNumber, clientName, clientEmail,
// eventType, eventDate, location, issueDate, dueDate, subtotal, discount, depositDue, total, balanceDue, status

export function quotationCsvRows(quotations)
// Columns: quoteId, quoteNumber, clientName, clientEmail, eventType, eventDate,
// location, issueDate, validUntil, status, subtotal, depositDue, total, notes
```

---

### STEP 10 — `src/components/admin/AdminProvider.jsx`

This is the top-level auth and data wrapper. All admin pages render through it.

```jsx
export default function AdminProvider({ section }) {
  // 1. Firebase Auth: onAuthStateChanged listener
  // 2. If not logged in: show LoginPanel (email/password form using signInWithEmailAndPassword)
  // 3. If logged in: check NEXT_PUBLIC_ADMIN_EMAILS env var (comma-separated, case-insensitive)
  //    - If email not in list and list is not empty: show "Admin account required" error
  // 4. Set up real-time listeners: listenToBookings, listenToInvoices, listenToQuotations,
  //    listenToClients, listenToQuoteServices, listenToDocumentTemplates
  // 5. Pass all data + loading/error states to AdminDashboard as props
  // 6. Cleanup: return unsubscribe functions from all listeners on unmount

  // State: user, authReady, bookings[], invoices[], quotations[], clients[], quoteServices[],
  //        documentTemplates[], loading, error, invoiceError, quotationError, authError
}
```

**LoginPanel** shows:
- Business name/logo at top
- Email + password inputs
- Sign in button
- Error message if auth fails

---

### STEP 11 — App router pages

Each admin route file should simply render `<AdminProvider section="pagename" />` wrapped in any necessary layout.

`app/admin/layout.js` — wraps all admin routes. No sidebar needed (navbar is inside the dashboard component).

All 8 route files (`page.js` in each subfolder) are thin wrappers:
```jsx
import AdminProvider from '@/src/components/admin/AdminProvider';
export default function Page() { return <AdminProvider section="bookings" />; }
```

Section values: `'overview'`, `'bookings'`, `'revenue'`, `'quotations'`, `'invoices'`, `'clients'`, `'reports'`, `'settings'`

---

### STEP 12 — Top navigation bar

Build `AdminNav` component (rendered inside AdminProvider/AdminDashboard, not the layout):

```
[LOGO/NAME]  Overview  Bookings  Revenue  Quotations  Invoices  Clients  Reports  Settings  [Sign out]
```

- Horizontal bar, sticky top, dark background (`#0d0d0d`), accent border-bottom (`#9b1c24` 2px)
- Active section highlighted with accent colour
- Links use Next.js `<Link>` components pointing to the correct routes
- Sign out calls `signOut(auth)`
- Mobile: collapses to hamburger or horizontal scroll

Style this with the DJ aesthetic: tight uppercase labels, monospace font for the business name on the left.

---

Once all the above is complete, verify:
1. All files exist and export the named functions
2. Firebase config is imported correctly (assumes `lib/firebase.js` or `src/firebase.js` already exists with `db` and `auth` exports)
3. No TypeScript errors (if using JS, no syntax errors)
4. AdminProvider renders a login form when not authenticated

Do not build any page content yet — that comes in the next 8 prompts.

---

---

# PROMPT 2 — OVERVIEW PAGE

> Prerequisites: Prompt 1 complete. All data layer functions exist.

---

## PROMPT

Build the Overview page (`section="overview"`) for the admin dashboard. This is the main landing page after login. It shows all key business metrics, clickable headline numbers, and 8 interactive charts. The aesthetic is dark/high-contrast DJ industry tool (dark backgrounds, red accent `#9b1c24`, amber secondary `#c49a3c`, off-white text `#f0ece4`).

---

### DATA AVAILABLE (passed as props from AdminProvider)

```js
bookings[]       // normalizeBooking() shape
invoices[]       // normalizeInvoiceDoc() shape
loading          // boolean
error            // string
```

---

### SECTION 1 — HEADLINE METRIC CARDS (4 cards, all clickable)

Each card shows a label, large formatted value, and a small note. Clicking any card opens the **InsightDrawer** (see below) filtered to matching records.

| Card | Value | Filter logic |
|---|---|---|
| Total invoiced | `invoiceSummary(invoices).totalInvoiced` | All active invoices |
| Total paid | `invoiceSummary(invoices).totalPaid` | Paid invoices |
| Outstanding | `invoiceSummary(invoices).outstanding` | Invoices with balanceDue > 0 |
| Upcoming bookings | Count of bookings where `eventDate >= today` AND `status !== 'cancelled'` | Upcoming bookings list |

Style: Large cards in a 4-column grid (2 on mobile). Value in large monospace font. Accent colour underline on hover. Cursor pointer.

---

### SECTION 2 — SECONDARY METRICS (compact, non-clickable row)

Show 5 compact stats in a horizontal strip:
- This month (revenue): `invoiceSummary(invoices).revenueThisMonth`
- This year (revenue): `invoiceSummary(invoices).revenueThisYear`
- Completed bookings: count of bookings where status = 'completed'
- Cancelled bookings: count of bookings where status = 'cancelled'
- Tax year total: `taxYearSummary(bookings).totals.gross`

---

### SECTION 3 — MONTHLY REVENUE CHART

Build `MonthlyRevenueChart` component. This is the most important chart.

**Data:** `revenueByMonth(bookings)` returns `[{ label: 'YYYY-MM', value: number, count: number }]`

**Features:**
- Year tabs at top: show available years (extracted from data) + annual totals in parentheses. Default to current year if available.
- 12 bars for Jan–Dec. Interpolate zero values for months with no data.
- Bar height proportional to value vs max monthly value for that year.
- Y-axis: 5 horizontal grid lines at 0%, 25%, 50%, 75%, 100% of max.
- X-axis: abbreviated month labels (Jan, Feb... Dec).
- Each bar is clickable → opens InsightDrawer filtered to that month's bookings.
- Empty months: show a faint placeholder bar.
- Show value label above each non-zero bar.

**Month data shape for rendering:**
```js
// For each year, generate 12 entries:
MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
entries = MONTHS.map((month, i) => {
  const key = `${year}-${String(i+1).padStart(2,'0')}`;
  const found = data.find(d => d.label === key);
  return { label: key, month, value: found?.value || 0, count: found?.count || 0 };
})
```

---

### SECTION 4 — BOOKING STATUS DONUT CHART

**Data:** `bookingsByStatus(bookings)` → `[{ label: 'pending', value: 5 }, ...]`

Build `DonutChart` component:
- SVG-based circle chart using `stroke-dasharray` and `stroke-dashoffset`
- 5 segments with these colours: pending=amber `#c49a3c`, accepted=green `#2d6a4f`, completed=teal `#1b7a8c`, cancelled=red `#9b1c24`, declined=grey `#555`
- Legend below: coloured dot + label + count
- Clicking a legend item → InsightDrawer filtered to that status

---

### SECTION 5 — REVENUE BY EVENT TYPE BAR CHART

**Data:** `groupByValue(bookings, b => b.eventType, b => b.amountPaid || b.quotedAmount)` → sorted descending

Build `BarChart` component (reusable for all horizontal bar charts):
- Horizontal bars
- Bar width = `(value / max) * 100%`
- Shows top 10 entries
- Label on left, bar, value on right
- Clicking a bar → InsightDrawer filtered to that event type
- Accent colour fill (`#9b1c24`) with slight opacity variation

---

### SECTION 6 — PAYMENT STATUS DONUT

**Data:** `paymentsByStatus(bookings)` → `[{ label: 'unpaid'|'deposit'|'paid', value: count }]`

Same `DonutChart` component, colours: unpaid=red, deposit=amber, paid=green.

---

### SECTION 7 — REVENUE HEATMAP

Build `Heatmap` component:
- Grid of month buttons (all months across all years in data)
- Each button shows month label + formatted value
- Background opacity: `0.35 + (value / maxValue) * 0.65`
- Base colour: accent red `#9b1c24`
- Clicking → InsightDrawer filtered to that month
- Empty months show at minimum opacity

---

### SECTION 8 — REVENUE BY LOCATION BAR CHART

**Data:** `groupByValue(bookings, b => b.eventLocation, b => b.amountPaid || b.quotedAmount)` top 10

Same `BarChart` component.

---

### SECTION 9 — TOP CLIENTS TABLE

**Data:** `groupByValue(bookings, b => b.clientName, b => b.quotedAmount)` top 8

Show as a simple table:
- Columns: Client name, Bookings (count), Revenue (value)
- Clicking a row → InsightDrawer with that client's bookings

---

### SECTION 10 — GROWTH & OPERATIONS INSIGHTS

Show a grid of 6 stat tiles:
1. Conversion rate: `enquiryToConfirmedRate(bookings)` as percentage
2. Cancellation rate: `cancellationRate(bookings)` as percentage
3. Avg lead time: `averageLeadTime(bookings)` in days
4. MoM growth: `monthlyGrowthRate(revenueByMonth(bookings))` as percentage
5. YoY growth: `yearOverYearGrowth(bookings)` as percentage
6. Top source: from `groupByValue(bookings, b => b.source)` — highest count source label + count

---

### THE INSIGHT DRAWER

This component appears as a slide-in panel from the right (or bottom on mobile) when any chart or metric is clicked.

**Props:** `{ open, onClose, title, bookings, invoices }`

**Content:**
- Header: title + close button
- Summary: count of items shown, total value if relevant
- **Bookings table:** client name, event type, date, status, payment status, quoted amount, outstanding
- **Invoices table** (if invoices passed): invoice #, client, event type, date, status, balance due
- Each row has email/call buttons if contact info available
- Smooth slide-in animation, dark overlay backdrop

---

### LAYOUT

Stack vertically:
1. Headline cards row (4 columns)
2. Secondary metrics strip
3. Monthly Revenue Chart (full width)
4. 2-column row: Booking Status Donut | Payment Status Donut
5. Revenue by Event Type Bar (full width)
6. 2-column row: Revenue Heatmap | Revenue by Location Bar
7. Top Clients Table (full width)
8. Growth & Operations grid

All sections have consistent padding, section titles in uppercase monospace.

---

---

# PROMPT 3 — BOOKINGS PAGE

> Prerequisites: Prompts 1–2 complete.

---

## PROMPT

Build the Bookings page (`section="bookings"`) for the admin dashboard. This is the primary operational page — it lists all bookings with filters, inline status/payment dropdowns, a manual booking creation form, and a slide-in detail panel per booking.

---

### DATA AVAILABLE

```js
bookings[]     // normalizeBooking() shape
invoices[]     // normalizeInvoiceDoc() shape
loading, error
```

---

### SECTION 1 — METRICS STRIP

5 compact metric cards at the top (calculated from the full unfiltered bookings array):

```js
upcoming:          bookings.filter(b => b.eventDate >= now && b.status !== 'cancelled').length
confirmed:         bookings.filter(b => ['confirmed','accepted','completed'].includes(b.status)).length
pending:           bookings.filter(b => ['pending','enquiry'].includes(b.status)).length
depositsCollected: bookings.filter(b => ['deposit','paid'].includes(b.paymentStatus) || b.depositAmount > 0 || b.amountPaid > 0).length
fullyPaid:         bookings.filter(b => b.paymentStatus === 'paid' || (b.quotedAmount > 0 && b.amountPaid >= b.quotedAmount)).length
```

---

### SECTION 2 — MANUAL BOOKING FORM

Collapsible form (toggle with "New booking" button). When submitted, calls `createManualBooking(form)`.

**Form fields:**
- Client name (required), Client email, Client phone
- Event type (select: EVENT_TYPE_OPTIONS), Event date (date input), Start time, End time/Duration
- Event location
- Booking status (select: BOOKING_STATUSES, default 'pending')
- Payment status (select: PAYMENT_STATUSES, default 'unpaid')
- Quoted amount (number), Deposit amount, Amount paid
- Notes (textarea)

Show success message after save. Clear form on success.

---

### SECTION 3 — FILTERS

```
[Search input] [Status ▾] [Payment ▾] [Event type ▾] [From date] [To date] [Sort ▾]
```

- **Search:** filters against clientName, clientEmail, clientPhone, eventLocation, invoiceNumber (case-insensitive)
- **Status:** 'All statuses' + each of BOOKING_STATUSES + 'enquiry' + 'confirmed'
- **Payment:** 'All payments' + PAYMENT_STATUSES
- **Event type:** 'All types' + EVENT_TYPE_OPTIONS
- **Date range:** filters by eventDate
- **Sort options (8):** date newest, date oldest, price high→low, price low→high, client A→Z, client Z→A, location A→Z, location Z→A

Filters are applied via `useMemo` on the bookings array.

---

### SECTION 4 — BOOKINGS TABLE

Columns:

| Column | Content |
|---|---|
| Date | `booking.eventDateLabel` |
| Client | `booking.clientName` — **clickable** → opens booking detail aside |
| Event | Inline dropdown of EVENT_TYPE_OPTIONS, saves on change |
| Location | `booking.eventLocation` |
| Status | Inline `<select>` of BOOKING_STATUSES — saves on change (see Status Update Logic below) |
| Payment | Inline `<select>` of PAYMENT_STATUSES — saves on change (see Payment Logic below) |
| Quoted | `money(booking.quotedAmount)` |
| Outstanding | `money(outstandingForBooking(booking))` — highlighted red if > 0 |
| Actions | Quote button, Invoice button, Delete button |

**Row styling:** Cancelled rows get reduced opacity. Upcoming + accepted rows get a subtle green-left-border accent.

---

### STATUS UPDATE LOGIC

When status is changed via inline dropdown:

1. If new status is `'cancelled'`: show a small prompt/modal asking for cancellation fee % — options: 0%, 50%, 100%. On confirmation:
   ```js
   updateBooking(booking.id, { status: 'cancelled', cancellationFeePercent: selectedPercent })
   syncInvoicesFromBookingStatus(invoices, booking, 'cancelled', selectedPercent)
   ```
2. For all other status changes:
   ```js
   updateBooking(booking.id, { status: newStatus })
   syncInvoicesFromBookingStatus(invoices, booking, newStatus, booking.cancellationFeePercent)
   ```

**`syncInvoicesFromBookingStatus`** (implement locally in this component):
- Find linked invoices: `invoices.filter(inv => inv.bookingId === booking.id || inv.invoiceNumber === booking.invoiceNumber)`
- For each linked invoice, compute patch:
  - `accepted/confirmed/completed` → keep payment state; if invoice was `draft` or `cancelled`, set status to `'sent'`
  - `cancelled` → `status='cancelled'`, `balanceDue = max((invoice.total * cancellationFeePercent/100) - invoice.amountPaid, 0)`
  - `pending/enquiry/declined` → `status='draft'`, `balanceDue=0`
- Call `saveInvoice({ ...invoice, ...patch })`

---

### PAYMENT UPDATE LOGIC

When payment status changed via inline dropdown, compute patch:

```js
function paymentPatchForBooking(newStatus, booking) {
  if (newStatus === 'paid') return {
    amountPaid: booking.quotedAmount,
    balanceAmount: 0,
    paymentStatus: 'paid',
    // if booking was pending/enquiry/confirmed, upgrade to accepted:
    status: ['enquiry','confirmed','pending'].includes(booking.status) ? 'accepted' : booking.status
  }
  if (newStatus === 'deposit') {
    const depositAmount = booking.depositAmount || Math.round(booking.quotedAmount * 0.5);
    const amountPaid = Math.max(booking.amountPaid, depositAmount);
    return { depositAmount, amountPaid, balanceAmount: booking.quotedAmount - amountPaid, paymentStatus: 'deposit' }
  }
  if (newStatus === 'unpaid') return { amountPaid: 0, balanceAmount: booking.quotedAmount, paymentStatus: 'unpaid' }
}
```

Then:
1. `updateBooking(booking.id, patch)`
2. `syncInvoicesFromBookingPayment(invoices, booking, newStatus, patch)`:
   - Find linked invoices (same logic as above)
   - `paid` → invoice: `status='paid'`, `amountPaid=invoice.total`, `balanceDue=0`
   - `deposit` → invoice: `status='partial'`, `amountPaid=min(patch.amountPaid, invoice.total)`, `balanceDue=max(total-paid,0)`
   - `unpaid` → invoice: `status=invoice.status==='draft'?'draft':'sent'`, `amountPaid=0`, `balanceDue=invoice.total`
   - Call `saveInvoice({ ...invoice, ...invoicePatch })`

---

### BOOKING DETAIL ASIDE

Triggered by clicking a client name. Slide-in panel from the right.

**Content:**
- Full booking info: client name, email, phone, event type, date, time, location, duration, source, notes, quoted amount, paid, outstanding
- Dropdowns: Status (with cancellation fee prompt), Payment status, Event type — all with live save
- Action buttons:
  - "Mark deposit paid" → sets paymentStatus='deposit'
  - "Mark fully paid" → sets paymentStatus='paid'
  - "Generate quote" → navigates to `/admin/quotations?booking={id}`
  - "Generate invoice" → navigates to `/admin/invoices?booking={id}`
  - "Delete booking" → confirm dialog, then `deleteBooking(id)`
- **Related invoices section:** list of invoices where `inv.bookingId === booking.id`, showing invoice #, status, total, balanceDue

---

### ACTION BUTTONS (in table row)

- **Quote button:** navigates to `/admin/quotations?booking={booking.id}`
- **Invoice button:** navigates to `/admin/invoices?booking={booking.id}`
- **Delete button:** shows confirmation, then calls `deleteBooking(booking.id)`. Does not delete linked invoices — just the booking.

---

### EVENT TYPE INLINE UPDATE

Dropdown in the Event column:
```js
updateBooking(booking.id, { eventType: newValue, event: newValue })
```

---

---

# PROMPT 4 — REVENUE PAGE

> Prerequisites: Prompts 1–2 complete.

---

## PROMPT

Build the Revenue page (`section="revenue"`) for the admin dashboard. This page shows all revenue analytics charts with drill-down capability. Reuse the chart components built in Prompt 2 (`MonthlyRevenueChart`, `BarChart`, `DonutChart`, `Heatmap`, `InsightDrawer`).

---

### DATA AVAILABLE

```js
bookings[]   // normalizeBooking() shape
invoices[]   // normalizeInvoiceDoc() shape
```

---

### LAYOUT (stack vertically, all sections full-width or 2-column grid)

**Section 1 — Summary Strip**

4 read-only metric tiles:
- Total revenue (invoiceSummary.totalPaid)
- Total invoiced (invoiceSummary.totalInvoiced)
- Outstanding (invoiceSummary.outstanding)
- Average booking value: `summarizeBookings(bookings).averageBookingValue`

**Section 2 — Monthly Revenue Chart**

Full-width. Same component from Prompt 2.
- Year tabs, 12 bars, click bar → InsightDrawer filtered to that month's bookings.
- Below the chart: show the year's total in large text.

**Section 3 — Revenue by Event Type (Bar Chart)**

`groupByValue(bookings, b => b.eventType, b => b.amountPaid || b.quotedAmount)`

Click bar → InsightDrawer filtered to bookings of that event type.

**Section 4 — Revenue by Client (Bar Chart)**

`groupByValue(bookings, b => b.clientName, b => b.quotedAmount)` top 10

Click → InsightDrawer with that client's bookings.

**Section 5 — Revenue by Location (Bar Chart)**

`groupByValue(bookings, b => b.eventLocation, b => b.amountPaid || b.quotedAmount)` top 10

Click → InsightDrawer filtered to bookings at that location.

**Section 6 — Revenue Heatmap**

Same `Heatmap` component, all months across all years.

**Section 7 — Operational Insights Grid**

Same 6-tile grid as Overview (conversion rate, cancellation rate, avg lead time, MoM growth, YoY growth, top source).

**Section 8 — Revenue by Source (Bar Chart)**

`groupByValue(bookings, b => b.source, b => b.amountPaid || b.quotedAmount)`

---

### ALL CHARTS

- Clicking any segment/bar/cell always opens the InsightDrawer with filtered bookings
- The InsightDrawer on this page should also show linked invoices for each booking
- Use `money()` for all currency display

---

---

# PROMPT 5 — QUOTATIONS PAGE

> Prerequisites: Prompts 1 complete. Bookings page (Prompt 3) ideally done so quote→booking linking can be tested.

---

## PROMPT

Build the Quotations page (`section="quotations"`) for the admin dashboard. This includes a full quote editor with line items, client/booking linking, preset services, totals calculation, PDF print, and a filterable quote list.

---

### DATA AVAILABLE

```js
bookings[]         // normalizeBooking() shape
quotations[]       // normalizeQuotation() shape
invoices[]         // normalizeInvoiceDoc() shape
clients[]          // normalizeClientRecord() shape
quoteServices[]    // normalizeQuoteService() shape (with STARTER_QUOTE_SERVICES fallback)
documentTemplates[] // normalizeDocumentTemplate() shape (with DEFAULT_DOCUMENT_TEMPLATE fallback)
```

---

### BEHAVIOUR ON PAGE LOAD

Check for `?booking={id}` in the URL query string. If present:
1. Find that booking in `bookings[]`
2. Check if a quote already exists: `quotations.find(q => q.bookingId === booking.id)`
3. If existing quote found: open it for editing
4. If no existing quote: create a new draft pre-filled from booking data
5. Open the editor immediately (don't show the list first)

---

### QUOTE EDITOR

A full-page (or modal/panel) editor. Show when creating/editing a quote.

**Client & event section:**
- Client name (text input with autocomplete from `clients[]` and `bookings[]`)
- Client email, Client phone, Company
- Booking picker: dropdown of existing bookings (shows "clientName – eventType – date"). On selection, pre-fill all event fields and set `draft.bookingId`.
- Event type (select: EVENT_TYPE_OPTIONS)
- Event date (date input)
- Event location (text input)
- Duration in hours (number input)

**Document section:**
- Quote number (auto-generated via `nextQuotationNumber(quotations, issueDate)`, editable)
- Issue date (date input, default today)
- Valid until (date input, default today + 14 days)
- Status (select: draft, sent, accepted, declined, expired)
- Deposit % (number, default 50)
- Terms (textarea, pre-fills from template)
- Notes (textarea)

**Line items section:**
- **Preset service buttons:** One button per service in `quoteServices[]`. Clicking adds that service as a line item with its default qty and unitPrice.
- **"Add blank line"** button adds an empty line item.
- Per line item fields: Name, Description, Category (select), Unit (select: hours/quantity/days/sets/items), Quantity (number), Unit Price (number) → Total is computed and shown read-only.
- Remove button per line item (×).

**Totals section (read-only computed):**
```
Subtotal:     sum of all item totals
Discount:     R [editable input]
Total:        max(subtotal - discount, 0)
Deposit due:  round(total * depositPercent / 100)
```

**Action buttons:**
- "Save draft" → saves with status='draft'
- "Save & mark sent" → saves with status='sent'
- "Print / PDF" → generates and prints HTML document
- "Close" → discards unsaved changes, returns to list

---

### TOTALS CALCULATION (real-time as user edits)

```js
const items = draft.items.map(normalizeLineItem);
const subtotal = items.reduce((sum, item) => sum + item.total, 0);
const total = Math.max(subtotal - draft.discount, 0);
const depositDue = Math.round(total * (draft.depositPercent / 100));
```

---

### SAVE LOGIC

On save:
1. Validate: client name required, at least one line item
2. Generate quote number if blank: `nextQuotationNumber(quotations, draft.issueDate)`
3. Build final quote object with all computed totals
4. Call `saveQuotation(quote)` (Firestore, with localStorage fallback)
5. Call `ensureBookingForQuotation({ draft: quote, quoteNumber, totals, status })` — creates or updates linked booking
6. Call `saveClient({ name, email, phone, company, totalQuoted: totals.total })` — creates or updates client record
7. If quote status changed to 'accepted': update linked booking status to 'accepted' via `updateBooking`
8. If quote status changed to 'declined' or 'expired': update linked booking status to 'declined'
9. Show success message, close editor if "Save & mark sent"

---

### PRINT / PDF

Build `buildQuotePrintHtml(quote, template)`:
- Returns a full HTML string styled with template colours
- Sections: Header (logo, business name, "QUOTATION", quote number), Client panel, Event panel, Line items table, Totals box, Terms
- Print via hidden iframe: create iframe, set `contentDocument.write(html)`, call `contentWindow.print()`
- A4 portrait, CSS `@page { size: A4; margin: 0; }`, print-color-adjust: exact

Template colours to use: `headerBackground`, `headerTextColor`, `documentBackground`, `bodyTextColor`, `accentColor`, `panelBackground`, `panelBorderColor`, `tableHeaderBackground`, `tableHeaderTextColor`, `totalsBackground`, `totalsTextColor`, `labelColor`

---

### QUOTE LIST

Show when editor is closed. Filterable list of all quotes.

**Summary metrics (top):**
- Total quotes: count
- Accepted: count where status='accepted'
- Pending: count where status in ['draft','sent']
- Total value: sum of totals

**Filters:** Search (client name/email/quote#), Status dropdown, Sort (date newest/oldest, value high/low)

**Table columns:** Quote #, Client, Event type, Date, Valid until, Status (inline dropdown, saves on change), Total, Deposit due, Actions

**Actions per row:**
- Edit → opens editor
- Print → calls print function
- Convert to invoice → navigates to `/admin/invoices?booking={bookingId}` (or opens invoice editor pre-filled)
- Delete → confirm, then `deleteQuotation(id)`

**Status change side effect:** On change to 'accepted' → `updateBooking(quote.bookingId, { status: 'accepted' })`. On 'declined'/'expired' → `updateBooking(quote.bookingId, { status: 'declined' })`.

---

---

# PROMPT 6 — INVOICES PAGE

> Prerequisites: Prompt 1 and ideally Prompts 3, 5 complete.

---

## PROMPT

Build the Invoices page (`section="invoices"`) for the admin dashboard. It includes a full invoice editor with line items, quote linking, payment tracking, PDF print, a templates manager panel, and a filterable invoice list.

---

### DATA AVAILABLE

```js
bookings[]
invoices[]
quotations[]
clients[]
quoteServices[]
documentTemplates[]
```

---

### BEHAVIOUR ON PAGE LOAD

Check for `?booking={id}` in URL. If present:
1. Find the booking
2. Check for an existing invoice: `invoices.find(inv => inv.bookingId === booking.id || inv.invoiceNumber === booking.invoiceNumber)`
3. Also check for a linked quote: `quotations.find(q => q.bookingId === booking.id)`
4. If existing invoice: open for editing
5. If no invoice but quote exists: create new draft pre-filled from quote (copy items, client, amounts)
6. If no invoice and no quote: create new draft pre-filled from booking
7. Open editor immediately

---

### INVOICE EDITOR

**Client & event section:**
- Client name, email, phone, company (with autocomplete from clients)
- Quote picker: dropdown of existing quotations (shows "QUO-2024-0001 – clientName – date"). On selection: copy all line items, client info, amounts, event details, set `draft.quotationId` and `draft.quoteNumber`.
- Booking picker: dropdown of bookings. On selection: set `draft.bookingId`, pre-fill event fields.
- Event type, event date, event location, duration hours

**Document section:**
- Invoice number (auto-generated `nextInvoiceNumber(invoices, issueDate)`, editable)
- Status (select: draft, sent, paid, partial, overdue, cancelled, void)
- Issue date (default today), Due date (default today + 7 days)
- Discount (R amount, number input)
- Deposit % (default 50)
- Amount paid (number input)
- Terms (textarea), Notes (textarea)

**Line items section:** (identical to Quotations)
- Preset service buttons, blank line button
- Per item: Name, Description, Category, Unit, Quantity, Unit price, Total (computed)
- Remove button per item

**Totals section (real-time computed, read-only):**
```
Subtotal:     sum of item totals
Discount:     R {discount input}
Total:        max(subtotal - discount, 0)
Deposit due:  round(total * depositPercent / 100)
Amount paid:  {amountPaid input}
Balance due:  max(total - amountPaid, 0)
```

**Action buttons:**
- "Save draft"
- "Save & mark sent"
- "Mark paid" → sets status='paid', amountPaid=total, balanceDue=0
- "Print / PDF" → `buildInvoicePrintHtml(invoice, template)` → iframe print
- "Close"

---

### TOTALS CALCULATION

```js
const items = draft.items.map(normalizeLineItem);
const subtotal = items.reduce((sum, item) => sum + item.total, 0);
const total = Math.max(subtotal - draft.discount, 0);
const depositDue = Math.round(total * (draft.depositPercent / 100));
const balanceDue = Math.max(total - draft.amountPaid, 0);
```

---

### SAVE LOGIC

On save:
1. Validate: client name required
2. Generate invoice number if blank
3. Determine `paymentStatus`: paid/amountPaid>=total→'paid', amountPaid>0→'deposit', else 'unpaid'
4. Call `saveInvoice(invoiceDoc)` — Firestore with localStorage fallback
5. Call `ensureBookingForInvoice({ draft, invoiceNumber, totals, status })` — creates or updates booking. Store returned bookingId on invoice.
6. Call `saveClient(...)` — creates or updates client record with `totalQuoted` and `totalPaid`
7. If status='paid': also update linked booking paymentStatus to 'paid' and status to 'accepted'
8. Show success, close editor if "Save & mark sent"

---

### PRINT / PDF — `buildInvoicePrintHtml(invoice, template)`

Full A4 HTML document. Sections in order:
1. **Header:** Logo mark (coloured square with initial if no logo), business name + role, "INVOICE", invoice number, issue date, due date
2. **Two-column panel row:** Left = Client panel (name, email, phone, company), Right = Event panel (type, date, location)
3. **Services table:** Columns: Service, Description, Unit, Qty, Unit Price, Total. Header row uses `tableHeaderBackground`. Alternating row subtle tints.
4. **Totals box** (right-aligned): Subtotal, Discount (if > 0), Total, Deposit due, Amount paid, Balance due. Uses `totalsBackground` colour.
5. **Bank details section:** Bank name, Account holder, Account number, Branch code
6. **Terms section:** Invoice terms text
7. **Footer:** Business email, phone, accent line

Use template's colour fields for all backgrounds, text, borders. `print-color-adjust: exact`. `@page { size: A4 portrait; margin: 0; }`.

---

### INVOICE LIST

**Tabs:** "Invoices" (default) | "Templates"

**Invoices tab:**

Summary metrics: Total invoiced, Total paid, Outstanding, Draft count.

Filters: Search (client/invoice#/event), Status dropdown, Sort.

Table columns: Invoice #, Client, Event type, Event date, Issue date, Status (inline dropdown, saves on change), Total, Balance due, Actions.

**Actions:** Edit, Print, Delete (confirm first).

Status change side effect: If changed to 'paid' → also update linked booking: `updateBooking(inv.bookingId, { paymentStatus: 'paid', amountPaid: inv.total, status: 'accepted' })`.

**Templates tab:**

Two-panel layout: left = template list (click to select, shows name, "Default" badge if `isDefault=true`). Right = edit form for selected template.

Edit form fields:
- Text fields: name, businessName, roleTitle, logoUrl, businessEmail, businessPhone, bankName, accountHolder, accountNumber, branchCode
- Colour pickers (input type=color): accentColor, documentBackground, headerBackground, headerTextColor, bodyTextColor, labelColor, panelBackground, panelBorderColor, tableHeaderBackground, tableHeaderTextColor, totalsBackground, totalsTextColor
- Textareas: invoiceTerms, quotationTerms
- "Set as default" button, "Duplicate template" button, "Save" button, "Delete" button (not for default)

**Live preview** of template colours as a mini document preview (just the colour blocks and typography, not a full invoice).

---

### LOCAL STORAGE FALLBACK

If `saveInvoice` returns `{ savedLocally: true }`, show a banner: "Invoice saved locally — Firestore permission required to sync across devices."

---

---

# PROMPT 7 — CLIENTS PAGE

> Prerequisites: Prompts 1 and 3 complete. Works best after Prompts 5 and 6.

---

## PROMPT

Build the Clients CRM page (`section="clients"`) for the admin dashboard. This page auto-aggregates client data from bookings, quotations, and invoices — no manual client entry needed (though saved clients are also shown). Every client record links to their full history.

---

### DATA AVAILABLE

```js
bookings[]
quotations[]
invoices[]
clients[]    // saved Firestore records
```

---

### DATA AGGREGATION — `aggregateClients({ clients, bookings, quotations, invoices })`

This function is already implemented in `lib/adminCrm.js`. Call it to get the aggregated client list. It:
- Deduplicates by email → phone → name across all four sources
- Accumulates all linked bookings, quotations, and invoices per client
- Computes `invoicedTotal`, `paidTotal`, `outstandingBalance`
- Generates `summary` string: "3 bookings · 2 quotes · 1 invoice · R 15,000 invoiced · R 5,000 outstanding"
- Generates `lastInteraction` string: "Invoice · INV-2024-0001 on 2024-01-15"
- Sorts by `invoicedTotal` descending, then name ascending

---

### SUMMARY STRIP (top metrics, 4 tiles)

Calculated from the aggregated client list:
- Total clients (count)
- Total invoiced: `sum of client.invoicedTotal`
- Total paid: `sum of client.paidTotal`
- Outstanding: `sum of client.outstandingBalance`

---

### FILTERS

- Search: matches name, email, phone, company (case-insensitive)
- Sort: invoiced value (high→low, default), name A→Z, outstanding (high→low)

---

### CLIENTS TABLE

Columns:

| Column | Content |
|---|---|
| Client | Name (bold) + company/email/phone on second line |
| Activity | `client.summary` string |
| Last interaction | `client.lastInteraction` string |
| Outstanding | `money(client.outstandingBalance)` — red if > 0 |
| Actions | View detail button |

Clicking the client name OR the view button → opens the client detail aside.

---

### CLIENT DETAIL ASIDE

Slide-in panel from the right.

**Header:** Client name, company

**Contact details section:**
- All emails (may have multiple), all phones, all companies
- Click email → `mailto:` link. Click phone → `tel:` link.

**Summary stats row:**
- Booking count, Invoiced total, Paid total, Outstanding balance

**Booking history table:**
- Columns: Event type, Date, Status, Quoted amount
- Sorted by eventDate desc

**Quotations table:**
- Columns: Quote #, Event type, Date, Status, Total

**Invoices table:**
- Columns: Invoice #, Event type, Date, Status, Balance due
- Clicking invoice # → opens that invoice in the invoice editor (navigate to `/admin/invoices?booking={bookingId}` or open modal)

**Action buttons:**
- "New quote for this client" → navigate to `/admin/quotations` with client pre-filled
- "New invoice for this client" → navigate to `/admin/invoices` with client pre-filled

---

### EMPTY STATES

If no clients yet: show message "Clients appear automatically when you create bookings, quotes, or invoices."

If no results after filtering: "No clients match your search."

---

### CSV EXPORT

"Export clients CSV" button. Calls:
```js
downloadCsv('clients.csv', clientCsvRows(aggregatedClients))
```

Columns: name, company, email, phone, summary, lastInteraction, bookings count, invoicedTotal, paidTotal, outstandingBalance.

---

---

# PROMPT 8 — REPORTS PAGE

> Prerequisites: Prompts 1–3 complete (needs bookings and invoices data).

---

## PROMPT

Build the Reports page (`section="reports"`) for the admin dashboard. This page contains three distinct report tables — Outstanding Balances, Revenue Detail, and Tax Summary — plus a metrics overview and CSV export for each table.

---

### DATA AVAILABLE

```js
bookings[]
invoices[]
```

---

### FILTERS (apply to all three tables)

```
[Event type ▾]  [Status ▾]  [From date]  [To date]
```

- Event type: 'All types' + EVENT_TYPE_OPTIONS
- Status: 'All statuses' + BOOKING_STATUSES
- Date range: filters by `booking.eventDate`

When filters are active, filter the `bookings` array before passing to all calculations. The `invoices` array is used unfiltered for revenue detail (since it's the authoritative financial source).

---

### METRICS STRIP (5 tiles, recomputed from filtered bookings)

```js
confirmedValue:   bookings.filter(b => ['accepted','confirmed','completed'].includes(b.status))
                          .reduce((sum, b) => sum + b.quotedAmount, 0)
avgBooking:       confirmedValue / confirmedCount (or 0)
outstanding:      bookings.reduce((sum, b) => sum + outstandingForBooking(b), 0)
depositsDue:      bookings.reduce((sum, b) => sum + Math.max((b.depositAmount || 0) - (b.amountPaid || 0), 0), 0)
conversionRate:   enquiryToConfirmedRate(bookings) as percentage
pendingPipeline:  bookings.filter(b => ['pending','enquiry'].includes(b.status))
                          .reduce((sum, b) => sum + b.quotedAmount, 0)
```

---

### TABLE 1 — OUTSTANDING BALANCES

**Data:** `outstandingBookingRows(bookings)` from `lib/adminCrm.js`
- Only includes bookings where `outstandingForBooking(booking) > 0`

**Columns:** Client, Event type, Event date, Status, Fee rule (shows cancellation % if cancelled, "Full balance" otherwise), Quoted, Paid, Outstanding

**"Outstanding" column** highlighted in red.

**Totals row** at bottom: sum of outstanding column.

**Export button:** `downloadCsv('outstanding-balances.csv', outstandingBookingRows(bookings))`

---

### TABLE 2 — REVENUE DETAIL

**Data:** `revenueDetailRows({ bookings, invoices })` from `lib/adminCrm.js`

This function:
1. One row per active invoice (status not void/draft)
2. One row per booking with no linked invoice AND (status is accepted/confirmed/completed, OR is cancelled with a fee > 0)
3. Deduplication: skips bookings whose ID is in `coveredBookingIds`, or whose `invoiceNumber` field is set, or whose client+date fingerprint matches an invoice
4. Sorted by event date descending

**Columns:** Invoice #, Client, Event type, Location, Event date, Booking status, Amount charged, Amount paid, Outstanding

**"Invoice #" column**: if the row has an `invoiceId`, clicking it opens the invoice in a **preview modal** — a rendered version of `buildInvoicePrintHtml` shown inline (not printed). The modal should have a Print button inside it.

**"Outstanding" column** highlighted red if > 0.

**Totals row** at bottom: sum of amount charged, amount paid, outstanding.

**Export button:** `downloadCsv('revenue-detail.csv', revenueDetailRows({ bookings, invoices }))`

---

### TABLE 3 — TAX SUMMARY

**Data:** `taxYearSummary(bookings)` from `lib/analytics/tax.js`

South African tax year: 1 March → last day of February the following year.

**Table header row:** Shows the tax year label (e.g., "2024/25 Tax Year") + column headers.

**Columns:** Month, Bookings (count), Gross quoted, Paid, Outstanding, Cancelled quoted

**Rows:** 12 months covering the SA tax year. Months with count=0 still appear (greyed out).

**Totals row** at bottom using `taxYearSummary.totals`.

**No CSV export for tax table** (it's a reference table).

---

### INVOICE PREVIEW MODAL

Triggered by clicking a linked invoice # in the Revenue Detail table.

- Full-screen overlay, centred modal
- Renders `buildInvoicePrintHtml(invoice, defaultTemplate)` inside an `<iframe srcDoc={html}>` (safer than innerHTML)
- Print button inside modal header → calls `iframe.contentWindow.print()`
- Close button

---

---

# PROMPT 9 — SETTINGS PAGE

> Prerequisites: Prompt 1 complete. Templates are already managed inside the Invoices page (Prompt 6), so Settings focuses on services and admin configuration.

---

## PROMPT

Build the Settings page (`section="settings"`) for the admin dashboard. This page has two sections: **Services** (manage preset service line items used in quotes and invoices) and **Admin configuration** (business info, template defaults, data utilities).

---

### DATA AVAILABLE

```js
quoteServices[]       // normalizeQuoteService() shape
documentTemplates[]   // normalizeDocumentTemplate() shape
bookings[]            // needed for data export utilities
invoices[]
quotations[]
clients[]             // aggregateClients() result
```

---

### TAB NAVIGATION (within the settings page)

Two tabs: "Services" | "Configuration"

---

### TAB 1 — SERVICES

Manage the preset service line items that appear as quick-add buttons in the quote and invoice editors.

**Services list:**

Show all services from `quoteServices[]`. If empty, show `STARTER_QUOTE_SERVICES` as the suggested defaults with an "Add these starter services" button that creates all three in Firestore.

Per service row:
- Name, Category, Unit, Default qty, Unit price
- Edit button → opens inline edit form
- Toggle active/inactive (greyed out if inactive, still shown)
- Delete button (confirm first) → `deleteQuoteService(id)`

**Inline edit / add form:**

Fields:
- Name (required)
- Category (select: '', 'DJ Sets', 'Sound', 'Lighting', 'Other')
- Unit (select: 'hours', 'quantity', 'days', 'sets', 'items')
- Default quantity (number)
- Unit price (number)
- Description (text)
- Active (checkbox)

Save → `saveQuoteService(normalizeQuoteService(id, formData))`. New service gets `uid()` as ID.

**"Add new service" button** → opens blank form.

---

### TAB 2 — CONFIGURATION

Three subsections:

**2a — Default document template (quick edit)**

Show the currently-default template from `documentTemplates[]` (where `isDefault=true`, or `DEFAULT_DOCUMENT_TEMPLATE` fallback).

Editable fields (quick subset, not the full template editor — that's in Invoices → Templates):
- Business name
- Role / title
- Business email
- Business phone
- Bank name, Account holder, Account number, Branch code
- Invoice terms (textarea)
- Quotation terms (textarea)

Save → `saveDocumentTemplate(normalizeDocumentTemplate(template.id, formData))`

Show link: "Edit full template colours & design → Invoices → Templates tab"

**2b — Data exports**

Four export buttons:
- "Export all bookings (CSV)" → `downloadCsv('bookings.csv', bookingCsvRows(bookings))`
- "Export all invoices (CSV)" → `downloadCsv('invoices.csv', invoiceCsvRows(invoices))`
- "Export all quotations (CSV)" → `downloadCsv('quotations.csv', quotationCsvRows(quotations))`
- "Export all clients (CSV)" → `downloadCsv('clients.csv', clientCsvRows(aggregateClients({ clients, bookings, quotations, invoices })))`

Each button shows the count of records in parentheses: "Export all bookings (47 records)".

**2c — Admin info panel (read-only)**

Show:
- Logged-in user email
- Firebase project ID (from env or `db.app.options.projectId`)
- Environment: `process.env.NODE_ENV`
- Firestore collections and their record counts: bookings (n), invoices (n), quotations (n), clients (n), services (n), templates (n)
- Local storage status: how many invoices/quotations stored locally (from `loadLocal(ADMIN_LOCAL_KEYS.invoices)?.length`)

"Clear local cache" button → clears all `ADMIN_LOCAL_KEYS` entries from localStorage. Confirm before clearing.

---

### STYLING NOTES

- All settings forms use the same dark aesthetic as the rest of the dashboard
- Form fields: dark input backgrounds (`#1a1a1a`), off-white text, red accent on focus border
- Section headings in uppercase monospace
- Buttons: primary (red `#9b1c24`), secondary (dark with border), danger (darker red, requires confirm)
- No page reload on any action — all updates are live via Firestore real-time listeners

---

---

## USING THESE PROMPTS

1. Start a fresh Claude instance for each prompt (or continue the same one if context allows)
2. Always provide the previous prompt's output/files as context before sending the next prompt
3. After each prompt, test the page manually — the data layer in Prompt 1 is the most critical to get right before building pages
4. The aesthetic (dark, red accent, monospace headings) must be applied consistently — each prompt mentions it, don't let it drift
5. Chart components built in Prompt 2 (`MonthlyRevenueChart`, `BarChart`, `DonutChart`, `Heatmap`, `InsightDrawer`) are reused in Prompts 4 and 7 — build them as standalone exported components, not inline

---

*Generated from live audit of DJ PHEE admin dashboard, May 2026.*
