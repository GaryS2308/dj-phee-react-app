'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeBooking } from '../analytics/revenue';

export function listenToBookings(onData, onError) {
  const bookingsRef = collection(db, 'bookings');
  const orderedQuery = query(bookingsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    orderedQuery,
    (snapshot) => {
      onData(snapshot.docs.map((bookingDoc) => normalizeBooking(bookingDoc.id, bookingDoc.data())));
    },
    onError
  );
}

export async function getBooking(bookingId) {
  const snapshot = await getDoc(doc(db, 'bookings', bookingId));
  if (!snapshot.exists()) return null;
  return normalizeBooking(snapshot.id, snapshot.data());
}

export function updateBooking(bookingId, patch) {
  return updateDoc(doc(db, 'bookings', bookingId), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

export function deleteBooking(bookingId) {
  return deleteDoc(doc(db, 'bookings', bookingId));
}

export function createManualBooking(form) {
  const amountPaid = Number(form.amountPaid || 0);
  const quotedAmount = Number(form.quotedAmount || 0);
  const eventDate = form.eventDate ? new Date(`${form.eventDate}T00:00:00`) : null;
  return addDoc(collection(db, 'bookings'), {
    name: form.clientName,
    email: form.clientEmail,
    phone: form.clientPhone,
    company: form.company || '',
    event: form.eventType,
    eventType: form.eventType,
    event_date: eventDate ? eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    eventDate,
    start_time: form.startTime,
    end_time: form.endTime,
    duration: form.duration,
    location: form.eventLocation,
    details: form.notes,
    status: form.status,
    quotedAmount,
    depositAmount: Number(form.depositAmount || 0),
    amountPaid,
    balanceAmount: Math.max(quotedAmount - amountPaid, 0),
    cancellationFeePercent: Number(form.cancellationFeePercent || 0),
    paymentStatus: form.paymentStatus,
    source: form.source,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    createdBy: 'admin-manual'
  });
}
