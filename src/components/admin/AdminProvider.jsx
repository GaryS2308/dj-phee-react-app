'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { listenToBookings } from '../../../lib/firestore/bookings';
import { listenToInvoices } from '../../../lib/firestore/invoices';
import { listenToClients } from '../../../lib/firestore/clients';
import { listenToDocumentTemplates } from '../../../lib/firestore/documentTemplates';
import { listenToQuotations } from '../../../lib/firestore/quotations';
import { listenToQuoteServices } from '../../../lib/firestore/quoteServices';
import AdminDashboard from './AdminDashboard';

export default function AdminProvider({ section }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [clients, setClients] = useState([]);
  const [quoteServices, setQuoteServices] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [quotationError, setQuotationError] = useState('');
  const [authError, setAuthError] = useState('');
  const shouldLoadInvoices = true;
  const shouldLoadQuoteData = true;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const isAllowedAdmin = !user || !adminEmails.length || adminEmails.includes(user.email?.toLowerCase());

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !isAllowedAdmin) return undefined;
    setLoading(true);
    const unsubscribeBookings = listenToBookings(
      (records) => {
        setBookings(records);
        setLoading(false);
      },
      (listenError) => {
        setError(listenError.message || 'Unable to load bookings.');
        setLoading(false);
      }
    );
    const unsubscribeInvoices = shouldLoadInvoices
      ? listenToInvoices(
        (records) => {
          setInvoices(records);
          setInvoiceError('');
        },
        (listenError) => setInvoiceError(listenError.message || 'Unable to load invoices.')
      )
      : undefined;
    const unsubscribeQuotations = shouldLoadQuoteData
      ? listenToQuotations(
        (records) => {
          setQuotations(records);
          setQuotationError('');
        },
        (listenError) => setQuotationError(listenError.message || 'Unable to load quotations.')
      )
      : undefined;
    const unsubscribeClients = shouldLoadQuoteData
      ? listenToClients((records) => setClients(records), () => undefined)
      : undefined;
    const unsubscribeQuoteServices = shouldLoadQuoteData
      ? listenToQuoteServices((records) => setQuoteServices(records), () => undefined)
      : undefined;
    const unsubscribeDocumentTemplates = shouldLoadQuoteData
      ? listenToDocumentTemplates((records) => setDocumentTemplates(records), () => undefined)
      : undefined;

    return () => {
      unsubscribeBookings();
      if (unsubscribeInvoices) unsubscribeInvoices();
      if (unsubscribeQuotations) unsubscribeQuotations();
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeQuoteServices) unsubscribeQuoteServices();
      if (unsubscribeDocumentTemplates) unsubscribeDocumentTemplates();
    };
  }, [user, isAllowedAdmin, shouldLoadInvoices, shouldLoadQuoteData]);

  if (!authReady) {
    return (
      <main className="admin-app admin-app--boot">
        <div className="admin-empty">Checking admin session...</div>
      </main>
    );
  }

  return (
    <AdminDashboard
      section={section}
      bookings={bookings}
      invoices={invoices}
      quotations={quotations}
      clients={clients}
      quoteServices={quoteServices}
      documentTemplates={documentTemplates}
      user={user}
      isAllowedAdmin={isAllowedAdmin}
      loading={loading}
      error={error}
      invoiceError={invoiceError}
      quotationError={quotationError}
      authError={authError}
      setAuthError={setAuthError}
    />
  );
}
