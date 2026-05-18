import { dateLabel, money, num, safeText } from './adminUtils';
import { outstandingForBooking } from './analytics/revenue';

function normalizeEmail(value) {
  return safeText(value).toLowerCase();
}

function normalizePhone(value) {
  return safeText(value).replace(/\D/g, '');
}

function normalizeName(value) {
  return safeText(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function contactKey(input = {}) {
  const email = normalizeEmail(input.email || input.clientEmail);
  const phone = normalizePhone(input.phone || input.clientPhone);
  const name = normalizeName(input.name || input.clientName);
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  if (name) return `name:${name}`;
  return safeText(input.clientKey || input.id) || 'unknown-client';
}

function uniqueValues(values) {
  return [...new Set(values.map(safeText).filter(Boolean))];
}

function recordDate(record = {}) {
  const raw = record.updatedAt || record.createdAt || record.issueDate || record.eventDate || record.date;
  if (!raw) return 0;
  const date = typeof raw?.toDate === 'function' ? raw.toDate() : new Date(raw);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function buildSummary(client) {
  const parts = [];
  const totalBookings = client.bookings.length;
  const totalQuotes = client.quotations.length;
  const totalInvoices = client.invoices.length;
  if (totalBookings) parts.push(`${totalBookings} booking${totalBookings === 1 ? '' : 's'}`);
  if (totalQuotes) parts.push(`${totalQuotes} quote${totalQuotes === 1 ? '' : 's'}`);
  if (totalInvoices) parts.push(`${totalInvoices} invoice${totalInvoices === 1 ? '' : 's'}`);
  if (client.invoicedTotal) parts.push(`${money(client.invoicedTotal)} invoiced`);
  if (client.outstandingBalance) parts.push(`${money(client.outstandingBalance)} outstanding`);
  return parts.length ? parts.join(' · ') : 'Saved contact, no booking activity yet';
}

function buildLastInteraction(client) {
  const interactions = [
    ...client.bookings.map((booking) => ({
      label: `Booking${booking.eventType ? ` · ${booking.eventType}` : ''}`,
      date: booking.eventDate || booking.createdAt || booking.updatedAt
    })),
    ...client.quotations.map((quote) => ({
      label: `Quote${quote.quoteNumber ? ` · ${quote.quoteNumber}` : ''}`,
      date: quote.issueDate || quote.eventDate || quote.createdAt || quote.updatedAt
    })),
    ...client.invoices.map((invoice) => ({
      label: `Invoice${invoice.invoiceNumber ? ` · ${invoice.invoiceNumber}` : ''}`,
      date: invoice.issueDate || invoice.eventDate || invoice.createdAt || invoice.updatedAt
    }))
  ].sort((a, b) => recordDate(b) - recordDate(a));

  const latest = interactions[0];
  if (!latest) return 'No activity yet';
  return `${latest.label}${latest.date ? ` on ${dateLabel(latest.date)}` : ''}`;
}

export function aggregateClients({ clients = [], bookings = [], quotations = [], invoices = [] }) {
  const map = new Map();
  const findExisting = (input, key) => {
    if (map.has(key)) return map.get(key);
    const email = normalizeEmail(input.email || input.clientEmail);
    const phone = normalizePhone(input.phone || input.clientPhone);
    const name = normalizeName(input.name || input.clientName);
    return [...map.values()].find((client) => (
      (email && client.emailsNormalized.includes(email)) ||
      (phone && client.phonesNormalized.includes(phone)) ||
      (name && normalizeName(client.name) === name)
    ));
  };
  const ensure = (input = {}) => {
    const key = contactKey(input);
    const existing = findExisting(input, key);
    const current = existing || {
      id: key,
      clientKey: key,
      name: safeText(input.name || input.clientName || 'Unknown client'),
      company: safeText(input.company || input.clientCompany),
      email: safeText(input.email || input.clientEmail),
      phone: safeText(input.phone || input.clientPhone),
      emails: [],
      phones: [],
      companies: [],
      emailsNormalized: [],
      phonesNormalized: [],
      bookings: [],
      quotations: [],
      invoices: [],
      invoicedTotal: 0,
      paidTotal: 0,
      outstandingBalance: 0
    };
    current.name = current.name === 'Unknown client' ? safeText(input.name || input.clientName) || current.name : current.name;
    current.company = current.company || safeText(input.company || input.clientCompany);
    current.email = current.email || safeText(input.email || input.clientEmail);
    current.phone = current.phone || safeText(input.phone || input.clientPhone);
    current.emails = uniqueValues([...current.emails, input.email, input.clientEmail]);
    current.phones = uniqueValues([...current.phones, input.phone, input.clientPhone]);
    current.companies = uniqueValues([...current.companies, input.company, input.clientCompany]);
    current.emailsNormalized = uniqueValues(current.emails.map(normalizeEmail));
    current.phonesNormalized = uniqueValues(current.phones.map(normalizePhone));
    map.set(key, current);
    if (input.clientKey) map.set(input.clientKey, current);
    if (input.id) map.set(input.id, current);
    return current;
  };

  clients.forEach((client) => ensure(client));
  bookings.forEach((booking) => {
    const client = ensure(booking);
    client.bookings.push(booking);
    client.outstandingBalance += outstandingForBooking(booking);
  });
  quotations.forEach((quote) => ensure({
    name: quote.clientName || quote.client?.name,
    email: quote.clientEmail || quote.client?.email,
    phone: quote.clientPhone || quote.client?.phone,
    company: quote.company || quote.client?.company
  }).quotations.push(quote));
  invoices.forEach((invoice) => {
    const client = ensure(invoice);
    client.invoices.push(invoice);
    client.invoicedTotal += num(invoice.total);
    client.paidTotal += num(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0));
  });

  return [...new Set(map.values())]
    .map((client) => ({
      ...client,
      summary: buildSummary(client),
      lastInteraction: buildLastInteraction(client)
    }))
    .sort((a, b) => b.invoicedTotal - a.invoicedTotal || a.name.localeCompare(b.name));
}

export function clientCsvRows(rows) {
  return rows.map((client) => ({
    name: client.name,
    company: client.company,
    email: client.emails?.length ? client.emails.join(', ') : client.email,
    phone: client.phones?.length ? client.phones.join(', ') : client.phone,
    summary: client.summary,
    lastInteraction: client.lastInteraction,
    bookings: client.bookings.length,
    invoicedTotal: money(client.invoicedTotal),
    paidTotal: money(client.paidTotal),
    outstandingBalance: money(client.outstandingBalance)
  }));
}

export function outstandingBookingRows(bookings = []) {
  return bookings
    .filter((booking) => outstandingForBooking(booking) > 0)
    .map((booking) => ({
      client: booking.clientName,
      event: booking.eventType,
      date: booking.eventDateLabel,
      status: booking.status,
      fee: money(booking.quotedAmount),
      cancellationFee: booking.status === 'cancelled' ? `${num(booking.cancellationFeePercent)}%` : '',
      depositDue: money(booking.depositAmount || Math.round(num(booking.quotedAmount) * 0.5)),
      outstanding: money(outstandingForBooking(booking))
    }));
}

// One row per real job — no duplicates, no quotes (quotes are proposals not income).
// Priority: if a booking has a linked invoice, the invoice is the authoritative record.
// Bookings with no invoice are included if the work is confirmed/completed/accepted or there's a cancellation fee.
// Pending, enquiry, and declined bookings are excluded — not earned revenue.
export function revenueDetailRows({ bookings = [], invoices = [] }) {
  const rows = [];

  const activeInvoices = invoices.filter((inv) => !['void', 'draft'].includes(inv.status));

  // Build a set of booking IDs already covered by an active invoice (by bookingId)
  const coveredBookingIds = new Set(
    activeInvoices.filter((inv) => inv.bookingId).map((inv) => inv.bookingId)
  );

  // Also build a fingerprint set (normalised client name + date string) for invoices that
  // lack a bookingId — prevents the same job appearing as both an invoice row AND a booking row.
  const invoiceDateLabel = (inv) => dateLabel(inv.eventDate || inv.issueDate);
  const normName = (s) => String(s || '').toLowerCase().trim();
  const coveredFingerprints = new Set(
    activeInvoices.map((inv) => `${normName(inv.clientName)}|${invoiceDateLabel(inv)}`)
  );

  // Step 1 — one row per active invoice (the authoritative financial record)
  for (const invoice of activeInvoices) {
    const amountPaid = num(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0));
    const balanceDue = num(invoice.balanceDue ?? Math.max(num(invoice.total) - amountPaid, 0));
    rows.push({
      invoiceId: invoice.id,
      date: invoiceDateLabel(invoice),
      client: invoice.clientName,
      'event type': invoice.eventType || '',
      location: invoice.eventLocation || '',
      'booking status': invoice.status,
      'invoice #': invoice.invoiceNumber || '',
      'amount charged': money(invoice.total),
      'amount paid': money(amountPaid),
      outstanding: money(balanceDue)
    });
  }

  // Step 2 — bookings with NO invoice at all (genuinely uninvoiced work)
  // A booking is considered invoiced if:
  //   • its ID is in coveredBookingIds, OR
  //   • it has an invoiceNumber set, OR
  //   • an active invoice shares the same client name + event date (catches missing bookingId links)
  for (const booking of bookings) {
    if (coveredBookingIds.has(booking.id)) continue;
    if (booking.invoiceNumber) continue;
    const fingerprint = `${normName(booking.clientName)}|${booking.eventDateLabel}`;
    if (coveredFingerprints.has(fingerprint)) continue;
    const { status } = booking;
    const isEarned = ['accepted', 'confirmed', 'completed'].includes(status);
    const cancellationFee = status === 'cancelled' ? outstandingForBooking(booking) : 0;
    if (!isEarned && !cancellationFee) continue;
    const amountPaid = num(booking.amountPaid);
    const outstanding = outstandingForBooking(booking);
    rows.push({
      date: booking.eventDateLabel,
      client: booking.clientName,
      'event type': booking.eventType || '',
      location: booking.eventLocation || '',
      'booking status': status,
      'invoice #': booking.invoiceNumber || 'no invoice',
      'amount charged': money(isEarned ? booking.quotedAmount : booking.quotedAmount * num(booking.cancellationFeePercent) / 100),
      'amount paid': money(amountPaid),
      outstanding: money(outstanding)
    });
  }

  // Sort by event date descending (most recent first)
  return rows.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return (Number.isNaN(db.getTime()) ? 0 : db.getTime()) - (Number.isNaN(da.getTime()) ? 0 : da.getTime());
  });
}
