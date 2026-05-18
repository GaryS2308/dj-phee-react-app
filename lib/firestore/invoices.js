'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ADMIN_LOCAL_KEYS, loadLocal, saveLocal, uid } from '../adminUtils';
import { normalizeInvoiceDoc } from '../adminDataShapes';

const LOCAL_INVOICE_KEY = ADMIN_LOCAL_KEYS.invoices;
const LEGACY_LOCAL_INVOICE_KEY = 'phee-admin-local-invoice-drafts';

function plainInvoiceDraft(draft) {
  return {
    ...draft,
    issueDate: draft.issueDate instanceof Date ? draft.issueDate.toISOString() : draft.issueDate,
    dueDate: draft.dueDate instanceof Date ? draft.dueDate.toISOString() : draft.dueDate,
    createdAt: new Date().toISOString()
  };
}

function saveLocalInvoiceDraft(draft) {
  if (typeof window === 'undefined') return;
  const existing = loadLocal(LOCAL_INVOICE_KEY) || loadLocal(LEGACY_LOCAL_INVOICE_KEY) || [];
  const next = [plainInvoiceDraft(draft), ...existing.filter((item) => item.invoiceNumber !== draft.invoiceNumber)];
  saveLocal(LOCAL_INVOICE_KEY, next.slice(0, 100));
}

export function listenToInvoices(onData, onError) {
  const invoicesRef = collection(db, 'invoices');
  const invoicesQuery = query(invoicesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    invoicesQuery,
    (snapshot) => {
      const records = snapshot.docs.map((invoiceDoc) => normalizeInvoiceDoc(invoiceDoc.id, invoiceDoc.data()));
      saveLocal(LOCAL_INVOICE_KEY, records);
      onData(records);
    },
    (error) => {
      const fallback = loadLocal(LOCAL_INVOICE_KEY) || loadLocal(LEGACY_LOCAL_INVOICE_KEY);
      if (Array.isArray(fallback)) onData(fallback.map((invoice) => normalizeInvoiceDoc(invoice.id, invoice)));
      onError?.(error);
    }
  );
}

export async function saveInvoice(record) {
  const normalized = normalizeInvoiceDoc(record.id, record);
  const existing = loadLocal(LOCAL_INVOICE_KEY) || [];
  const localRecord = {
    ...normalized,
    id: normalized.id || uid(),
    updatedAt: new Date().toISOString(),
    createdAt: normalized.createdAt || new Date().toISOString()
  };

  try {
    if (record.id) {
      await setDoc(doc(db, 'invoices', normalized.id), {
        ...normalized,
        updatedAt: serverTimestamp(),
        createdAt: normalized.createdAt || serverTimestamp()
      }, { merge: true });
      saveLocal(LOCAL_INVOICE_KEY, [localRecord, ...existing.filter((item) => item.id !== localRecord.id)]);
      return { ...normalized, savedToFirestore: true };
    }
    const invoiceRef = await addDoc(collection(db, 'invoices'), {
      ...normalized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const saved = { ...normalized, id: invoiceRef.id, savedToFirestore: true };
    saveLocal(LOCAL_INVOICE_KEY, [saved, ...existing.filter((item) => item.id !== saved.id)]);
    return saved;
  } catch (error) {
    if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') throw error;
    saveLocal(LOCAL_INVOICE_KEY, [localRecord, ...existing.filter((item) => item.id !== localRecord.id)]);
    return { ...localRecord, savedLocally: true };
  }
}

export async function deleteInvoice(invoiceId) {
  const existing = loadLocal(LOCAL_INVOICE_KEY);
  if (Array.isArray(existing)) saveLocal(LOCAL_INVOICE_KEY, existing.filter((item) => item.id !== invoiceId));
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
    return { deletedFromFirestore: true };
  } catch (error) {
    if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') throw error;
    return { deletedLocally: true };
  }
}

export function nextInvoiceNumber(invoices = [], issueDate = new Date()) {
  const date = issueDate instanceof Date ? issueDate : new Date(issueDate);
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  const prefix = `INV-${year}-`;
  const max = invoices.reduce((currentMax, invoice) => {
    const number = String(invoice.invoiceNumber || '');
    if (!number.startsWith(prefix)) return currentMax;
    const sequence = Number(number.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(currentMax, sequence) : currentMax;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export async function createInvoiceFromBooking(booking) {
  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(issueDate.getDate() + 7);
  const invoiceNumber = `PHEE-${issueDate.getFullYear()}-${String(Date.now()).slice(-6)}`;
  const subtotal = Number(booking.quotedAmount || 0);
  const taxAmount = 0;
  const total = subtotal + taxAmount;
  const invoiceData = {
    bookingId: booking.id,
    invoiceNumber,
    clientName: booking.clientName,
    issueDate,
    dueDate,
    subtotal,
    taxAmount,
    total,
    status: booking.paymentStatus === 'paid' ? 'paid' : 'issued',
    pdfUrl: '',
    createdAt: serverTimestamp()
  };
  const draftData = {
    bookingId: booking.id,
    invoiceNumber,
    clientName: booking.clientName,
    issueDate,
    dueDate,
    subtotal,
    taxAmount,
    total,
    status: booking.paymentStatus === 'paid' ? 'paid' : 'issued'
  };

  try {
    const invoiceRef = await addDoc(collection(db, 'invoices'), invoiceData);

    await updateDoc(doc(db, 'bookings', booking.id), {
      invoiceNumber,
      invoiceId: invoiceRef.id,
      updatedAt: serverTimestamp()
    });

    return { id: invoiceRef.id, invoiceNumber, draft: draftData, savedToInvoices: true };
  } catch (error) {
    if (error?.code !== 'permission-denied') {
      throw error;
    }

    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        invoiceNumber,
        invoiceDraft: {
          ...draftData,
          permissionFallback: true
        },
        updatedAt: serverTimestamp()
      });

      return { id: null, invoiceNumber, draft: draftData, savedToInvoices: false, savedToBooking: true, savedLocally: false };
    } catch (fallbackError) {
      if (fallbackError?.code !== 'permission-denied') {
        throw fallbackError;
      }

      saveLocalInvoiceDraft(draftData);
      return { id: null, invoiceNumber, draft: draftData, savedToInvoices: false, savedToBooking: false, savedLocally: true };
    }
  }
}
