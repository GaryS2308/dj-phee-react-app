'use client';

import { createManualBooking, updateBooking } from './firestore/bookings';
import { num } from './adminUtils';

function bookingStatusFromQuote(status) {
  if (status === 'accepted') return 'accepted';
  if (status === 'declined' || status === 'expired') return 'declined';
  return 'pending';
}

function bookingStatusFromInvoice(status) {
  if (status === 'paid') return 'accepted';
  return status === 'draft' ? 'pending' : 'accepted';
}

function paymentStatusFromInvoice(status, amountPaid, total) {
  if (status === 'paid' || (total > 0 && amountPaid >= total)) return 'paid';
  if (amountPaid > 0) return 'deposit';
  return 'unpaid';
}

function eventDateForInput(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  const date = value instanceof Date ? value : typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function durationLabel(hours) {
  const value = num(hours);
  return value ? `${value} hour${value === 1 ? '' : 's'}` : '';
}

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

function bookingDateKey(value) {
  return eventDateForInput(value);
}

function sameClient(draft, booking) {
  const draftEmail = clean(draft.clientEmail);
  const bookingEmail = clean(booking.clientEmail);
  if (draftEmail && bookingEmail && draftEmail === bookingEmail) return true;

  const draftPhone = clean(draft.clientPhone).replace(/\D/g, '');
  const bookingPhone = clean(booking.clientPhone).replace(/\D/g, '');
  if (draftPhone && bookingPhone && draftPhone === bookingPhone) return true;

  return clean(draft.clientName) && clean(draft.clientName) === clean(booking.clientName);
}

function findMatchingBooking(draft, bookings = []) {
  const draftDate = bookingDateKey(draft.eventDate);
  if (!draftDate) return null;

  const candidates = bookings.filter((booking) =>
    sameClient(draft, booking) && bookingDateKey(booking.eventDate) === draftDate
  );
  if (!candidates.length) return null;

  const draftEventType = clean(draft.eventType);
  const draftLocation = clean(draft.eventLocation);
  return candidates.find((booking) =>
    (draftEventType && clean(booking.eventType) === draftEventType)
    || (draftLocation && clean(booking.eventLocation) === draftLocation)
  ) || candidates[0];
}

export async function ensureBookingForQuotation({ draft, quoteNumber, totals, status, bookings = [] }) {
  if (draft.bookingId) {
    await updateBooking(draft.bookingId, {
      quotedAmount: totals.total,
      totalAmount: totals.total,
      depositAmount: totals.depositDue,
      quoteNumber
    });
    return draft.bookingId;
  }

  const matchedBooking = findMatchingBooking(draft, bookings);
  if (matchedBooking) {
    await updateBooking(matchedBooking.id, {
      quotedAmount: totals.total,
      totalAmount: totals.total,
      depositAmount: totals.depositDue,
      quoteNumber
    });
    return matchedBooking.id;
  }

  const booking = await createManualBooking({
    clientName: draft.clientName,
    clientEmail: draft.clientEmail,
    clientPhone: draft.clientPhone,
    company: draft.company,
    eventType: draft.eventType || 'DJ Booking',
    eventDate: eventDateForInput(draft.eventDate),
    startTime: '',
    endTime: '',
    duration: durationLabel(draft.durationHours),
    eventLocation: draft.eventLocation,
    notes: draft.notes,
    status: bookingStatusFromQuote(status),
    quotedAmount: totals.total,
    depositAmount: totals.depositDue,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    source: 'admin-quotation'
  });

  await updateBooking(booking.id, { quoteNumber });
  return booking.id;
}

export async function ensureBookingForInvoice({ draft, invoiceNumber, totals, status, bookings = [] }) {
  const amountPaid = num(draft.amountPaid);
  const paymentStatus = paymentStatusFromInvoice(status, amountPaid, totals.total);
  const bookingPatch = {
    quotedAmount: totals.total,
    totalAmount: totals.total,
    depositAmount: totals.depositDue,
    amountPaid,
    balanceAmount: totals.balanceDue,
    paymentStatus,
    invoiceNumber
  };

  if (draft.bookingId) {
    await updateBooking(draft.bookingId, bookingPatch);
    return draft.bookingId;
  }

  const matchedBooking = findMatchingBooking(draft, bookings);
  if (matchedBooking) {
    await updateBooking(matchedBooking.id, bookingPatch);
    return matchedBooking.id;
  }

  const booking = await createManualBooking({
    clientName: draft.clientName,
    clientEmail: draft.clientEmail,
    clientPhone: draft.clientPhone,
    company: draft.company,
    eventType: draft.eventType || 'DJ Booking',
    eventDate: eventDateForInput(draft.eventDate),
    startTime: '',
    endTime: '',
    duration: durationLabel(draft.durationHours),
    eventLocation: draft.eventLocation,
    notes: draft.notes,
    status: bookingStatusFromInvoice(status),
    quotedAmount: totals.total,
    depositAmount: totals.depositDue,
    amountPaid,
    paymentStatus,
    source: 'admin-invoice'
  });

  await updateBooking(booking.id, bookingPatch);
  return booking.id;
}
