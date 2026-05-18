import { currency, outstandingForBooking } from './analytics/revenue';
import { dateLabel } from './adminUtils';

function escapeCsv(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename, rows) {
  if (typeof window === 'undefined' || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function bookingCsvRows(bookings) {
  return bookings.map((booking) => ({
    bookingId: booking.id,
    invoiceNumber: booking.invoiceNumber,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    eventType: booking.eventType,
    eventDate: booking.eventDateLabel,
    location: booking.eventLocation,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    quotedAmount: currency(booking.quotedAmount),
    amountPaid: currency(booking.amountPaid),
    outstanding: currency(outstandingForBooking(booking)),
    source: booking.source,
    notes: booking.notes
  }));
}

export function invoiceCsvRows(invoices) {
  return invoices.map((invoice) => ({
    invoiceId: invoice.id,
    bookingId: invoice.bookingId,
    quotationId: invoice.quotationId,
    invoiceNumber: invoice.invoiceNumber,
    quoteNumber: invoice.quoteNumber,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    eventType: invoice.eventType,
    eventDate: dateLabel(invoice.eventDate),
    location: invoice.eventLocation,
    issueDate: dateLabel(invoice.issueDate),
    dueDate: dateLabel(invoice.dueDate),
    subtotal: currency(invoice.subtotal),
    discount: currency(invoice.discount),
    depositDue: currency(invoice.depositDue),
    total: currency(invoice.total),
    balanceDue: currency(invoice.balanceDue),
    status: invoice.status,
    pdfUrl: invoice.pdfUrl
  }));
}

export function quotationCsvRows(quotations) {
  return quotations.map((quote) => ({
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    clientName: quote.clientName || quote.client?.name,
    clientEmail: quote.clientEmail || quote.client?.email,
    eventType: quote.eventType,
    eventDate: dateLabel(quote.eventDate),
    location: quote.eventLocation,
    issueDate: dateLabel(quote.issueDate),
    validUntil: dateLabel(quote.validUntil),
    status: quote.status,
    subtotal: currency(quote.subtotal),
    depositDue: currency(quote.depositDue),
    total: currency(quote.total),
    notes: quote.notes
  }));
}
