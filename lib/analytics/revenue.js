import { money } from '../adminUtils';
import { normalizeEventTypeOption } from '../adminDataShapes';

export const RATE_PER_HOUR = 2000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;

    const parts = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (parts) {
      const month = MONTHS.findIndex((m) => m.toLowerCase() === parts[2].slice(0, 3).toLowerCase());
      if (month >= 0) return new Date(Number(parts[3]), month, Number(parts[1]));
    }
  }
  return null;
}

export function parseDurationToHours(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  let total = 0;
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour|h)/i);
  const minuteMatch = duration.match(/(\d+)\s*(?:min|m)/i);
  if (hourMatch) total += Number(hourMatch[1]);
  if (minuteMatch) total += Number(minuteMatch[1]) / 60;
  if (!total && !Number.isNaN(Number(duration))) total = Number(duration);
  return total;
}

export function currency(value) {
  return money(value);
}

export function outstandingForBooking(booking = {}) {
  const quoted = Number(booking.quotedAmount || 0);
  const paid = Number(booking.amountPaid || 0);
  const status = String(booking.status || '').toLowerCase();
  if (['accepted', 'completed', 'confirmed'].includes(status)) return Math.max(quoted - paid, 0);
  if (status === 'cancelled') {
    const percent = Number(booking.cancellationFeePercent || booking.raw?.cancellationFeePercent || 0);
    return Math.max((quoted * (percent / 100)) - paid, 0);
  }
  return 0;
}

export function normalizeBooking(id, data = {}) {
  const eventDate = toDate(data.eventDate || data.event_date || data.date);
  const createdAt = toDate(data.createdAt || data.timestamp || data.created_at);
  const quotedAmount = Number(data.quotedAmount ?? data.totalAmount ?? data.amount ?? data.quote ?? 0)
    || parseDurationToHours(data.duration) * RATE_PER_HOUR;
  const rawPayment = String(data.paymentStatus || data.payment_status || '').toLowerCase();
  const depositAmount = Number(data.depositAmount ?? data.deposit ?? 0);
  const recordedPaid = Number(data.amountPaid ?? data.paidAmount ?? 0);
  const amountPaid = recordedPaid || (rawPayment === 'paid' ? quotedAmount : ['deposit', 'deposit-paid', 'deposit_paid', 'partial'].includes(rawPayment) ? depositAmount : 0);
  const balanceAmount = Number(data.balanceAmount ?? Math.max(quotedAmount - amountPaid, 0));
  const rawStatus = String(data.status || '').toLowerCase();
  const status = ['pending', 'accepted', 'completed', 'cancelled', 'declined', 'enquiry', 'confirmed'].includes(rawStatus)
    ? rawStatus
    : amountPaid >= quotedAmount && quotedAmount > 0
      ? 'completed'
      : 'pending';
  const paymentStatus = ['deposit-paid', 'deposit_paid', 'partial'].includes(rawPayment)
    ? 'deposit'
    : ['unpaid', 'deposit', 'paid'].includes(rawPayment)
      ? rawPayment
    : amountPaid >= quotedAmount && quotedAmount > 0
      ? 'paid'
      : amountPaid > 0 || depositAmount > 0
        ? 'deposit'
        : 'unpaid';

  return {
    id,
    raw: data,
    clientName: data.clientName || data.name || 'Unknown client',
    clientEmail: data.clientEmail || data.email || '',
    clientPhone: data.clientPhone || data.phone || '',
    eventType: normalizeEventTypeOption(data.eventType || data.event),
    eventDate,
    eventDateLabel: eventDate ? eventDate.toLocaleDateString('en-ZA') : data.event_date || 'No date',
    startTime: data.start_time || data.startTime || '',
    endTime: data.end_time || data.endTime || '',
    duration: data.duration || '',
    eventLocation: data.eventLocation || data.location || 'Unspecified',
    status,
    quotedAmount,
    depositAmount,
    balanceAmount,
    amountPaid,
    cancellationFeePercent: Number(data.cancellationFeePercent || 0),
    paymentStatus,
    createdAt,
    source: data.source || data.channel || 'Website',
    notes: data.notes || data.details || '',
    quoteNumber: data.quoteNumber || '',
    quoteId: data.quoteId || '',
    invoiceNumber: data.invoiceNumber || '',
    invoiceId: data.invoiceId || ''
  };
}

function isEarned(booking) {
  return booking.status !== 'cancelled';
}

export function summarizeBookings(bookings) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const earned = bookings.filter(isEarned);
  const paid = earned.reduce((sum, b) => sum + b.amountPaid, 0);
  const quoted = earned.reduce((sum, b) => sum + b.quotedAmount, 0);
  const outstanding = bookings.reduce((sum, b) => sum + outstandingForBooking(b), 0);
  const thisMonth = earned
    .filter((b) => b.eventDate && b.eventDate.getMonth() === month && b.eventDate.getFullYear() === year)
    .reduce((sum, b) => sum + b.amountPaid, 0);
  const thisYear = earned
    .filter((b) => b.eventDate && b.eventDate.getFullYear() === year)
    .reduce((sum, b) => sum + b.amountPaid, 0);

  return {
    totalRevenue: paid,
    quotedRevenue: quoted,
    revenueThisMonth: thisMonth,
    revenueThisYear: thisYear,
    outstandingRevenue: outstanding,
    paidInvoices: bookings.filter((b) => b.paymentStatus === 'paid').length,
    unpaidInvoices: bookings.filter((b) => b.paymentStatus === 'unpaid').length,
    confirmedBookings: bookings.filter((b) => ['accepted', 'completed', 'confirmed'].includes(b.status)).length,
    upcomingBookings: bookings.filter((b) => b.eventDate && b.eventDate >= now && b.status !== 'cancelled').length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
    averageBookingValue: earned.length ? quoted / earned.length : 0
  };
}

export function groupByValue(bookings, getter, amountGetter = (b) => b.amountPaid || b.quotedAmount) {
  const map = new Map();
  bookings.forEach((booking) => {
    const key = getter(booking) || 'Unspecified';
    const current = map.get(key) || { label: key, value: 0, count: 0 };
    current.value += amountGetter(booking);
    current.count += 1;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => b.value - a.value);
}

export function revenueByMonth(bookings) {
  const map = new Map();
  bookings.filter(isEarned).forEach((booking) => {
    const date = booking.eventDate || booking.createdAt;
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = map.get(key) || { label: key, value: 0, count: 0 };
    current.value += booking.amountPaid;
    current.count += 1;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function invoiceSummary(invoices = []) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Only active invoices count toward total invoiced and total paid.
  // Cancelled invoices are excluded from invoiced/paid but their balanceDue
  // (the cancellation fee still owed) is included in outstanding.
  const activeInvoices = invoices.filter((inv) => !['cancelled', 'void', 'draft'].includes(inv.status));
  const totalInvoiced = activeInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalPaid = activeInvoices.reduce((sum, invoice) => sum + Number(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0) || 0), 0);
  // Outstanding = unpaid balance on active invoices + any cancellation fees still owed on cancelled invoices.
  // Draft and void invoices carry no obligation yet, so they are excluded.
  // balanceDue on a cancelled invoice is set to the cancellation fee minus what's already paid (or 0).
  const outstanding = invoices.reduce((sum, invoice) => {
    if (['void', 'draft'].includes(invoice.status)) return sum;
    const balanceDue = Number(invoice.balanceDue ?? Math.max((invoice.total || 0) - (invoice.amountPaid || 0), 0));
    return sum + balanceDue;
  }, 0);
  const revenueThisMonth = invoices
    .filter((invoice) => {
      const date = toDate(invoice.issueDate || invoice.createdAt);
      return date && date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((sum, invoice) => sum + Number(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0) || 0), 0);
  const revenueThisYear = invoices
    .filter((invoice) => {
      const date = toDate(invoice.issueDate || invoice.createdAt);
      return date && date.getFullYear() === year;
    })
    .reduce((sum, invoice) => sum + Number(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0) || 0), 0);

  return { totalInvoiced, totalPaid, outstanding, revenueThisMonth, revenueThisYear };
}

export function invoiceRevenueByMonth(invoices = []) {
  const map = new Map();
  invoices.forEach((invoice) => {
    const date = toDate(invoice.issueDate || invoice.eventDate || invoice.createdAt);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = map.get(key) || { label: key, value: 0, count: 0 };
    current.value += Number(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0) || 0);
    current.count += 1;
    map.set(key, current);
  });
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function invoiceRevenueByEventType(invoices = []) {
  return groupByValue(invoices, (invoice) => invoice.eventType, (invoice) => Number(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0) || 0));
}

export function bookingsByStatus(bookings) {
  return groupByValue(bookings, (b) => b.status, () => 1);
}

export function paymentsByStatus(bookings) {
  return groupByValue(bookings, (b) => b.paymentStatus, () => 1);
}

export function cancellationRate(bookings) {
  return bookings.length ? bookings.filter((b) => b.status === 'cancelled').length / bookings.length : 0;
}

export function enquiryToConfirmedRate(bookings) {
  const enquiries = bookings.filter((b) => ['pending', 'enquiry'].includes(b.status)).length;
  const confirmed = bookings.filter((b) => ['accepted', 'completed', 'confirmed'].includes(b.status)).length;
  return enquiries + confirmed ? confirmed / (enquiries + confirmed) : 0;
}

export function leadTimeDays(booking) {
  if (!booking.createdAt || !booking.eventDate) return null;
  return Math.max(0, Math.round((booking.eventDate.getTime() - booking.createdAt.getTime()) / 86400000));
}

export function averageLeadTime(bookings) {
  const values = bookings.map(leadTimeDays).filter((value) => value !== null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function monthlyGrowthRate(months) {
  if (months.length < 2) return 0;
  const previous = months[months.length - 2].value;
  const current = months[months.length - 1].value;
  return previous ? (current - previous) / previous : 0;
}

export function yearOverYearGrowth(bookings) {
  const year = new Date().getFullYear();
  const current = bookings.filter((b) => b.eventDate?.getFullYear() === year).reduce((sum, b) => sum + (b.amountPaid || b.quotedAmount), 0);
  const previous = bookings.filter((b) => b.eventDate?.getFullYear() === year - 1).reduce((sum, b) => sum + (b.amountPaid || b.quotedAmount), 0);
  return previous ? (current - previous) / previous : 0;
}
