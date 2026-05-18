'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCalendarAlt, FaChartLine, FaFileCsv, FaFileInvoice, FaMoneyBillWave, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { createManualBooking } from '../../../lib/firestore/bookings';
import { deleteBooking, updateBooking } from '../../../lib/firestore/bookings';
import { saveInvoice } from '../../../lib/firestore/invoices';
import { BOOKING_STATUSES, EVENT_TYPE_OPTIONS, PAYMENT_STATUSES, normalizeEventTypeOption } from '../../../lib/adminDataShapes';
import { bookingCsvRows, downloadCsv, invoiceCsvRows } from '../../../lib/adminCsv';
import AdminSettingsFoundation from './AdminSettingsFoundation';
import AdminQuotations from './AdminQuotations';
import AdminInvoices, { InvoicePreview, printInvoice } from './AdminInvoices';
import AdminClientsCRM from './AdminClientsCRM';
import AdminReports from './AdminReports';
import {
  averageLeadTime,
  bookingsByStatus,
  cancellationRate,
  currency,
  enquiryToConfirmedRate,
  groupByValue,
  leadTimeDays,
  monthlyGrowthRate,
  paymentsByStatus,
  invoiceSummary,
  outstandingForBooking,
  revenueByMonth,
  summarizeBookings,
  yearOverYearGrowth
} from '../../../lib/analytics/revenue';
import { taxYearSummary } from '../../../lib/analytics/tax';

const NAV = [
  ['overview', '/admin', 'Overview', FaChartLine],
  ['bookings', '/admin/bookings', 'Bookings', FaCalendarAlt],
  ['revenue', '/admin/revenue', 'Revenue', FaMoneyBillWave],
  ['quotations', '/admin/quotations', 'Quotations', FaFileInvoice],
  ['invoices', '/admin/invoices', 'Invoices', FaFileInvoice],
  ['clients', '/admin/clients', 'Clients', FaUsers],
  ['reports', '/admin/reports', 'Reports', FaFileCsv],
  ['settings', '/admin/settings', 'Settings', FaChartLine]
];

const STATUS_OPTIONS = BOOKING_STATUSES;
const PAYMENT_OPTIONS = PAYMENT_STATUSES;
const statusSelectValue = (status) => STATUS_OPTIONS.includes(status) ? status : 'pending';
const CANCELLATION_FEE_OPTIONS = [0, 50, 100];
const WEBSITE_LOGO_URL = '/favicon.png';
const DEFAULT_INVOICE_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    accentColor: '#9b1c24',
    logoUrl: WEBSITE_LOGO_URL,
    businessName: 'PHEE',
    role: 'DJ',
    email: 'garyjohnstrybis@gmail.com',
    phone: '0780750397',
    bankName: 'Nedbank',
    accountNumber: '',
    accountHolder: 'PHEE',
    terms: 'Payment is due by the due date shown on this invoice.'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    accentColor: '#111827',
    logoUrl: WEBSITE_LOGO_URL,
    businessName: 'PHEE',
    role: 'DJ',
    email: 'garyjohnstrybis@gmail.com',
    phone: '0780750397',
    bankName: 'Nedbank',
    accountNumber: '',
    accountHolder: 'PHEE',
    terms: 'Payment is due by the due date shown on this invoice.'
  }
];
const FALLBACK_TEMPLATE = {
  id: 'classic',
  name: 'Classic',
  accentColor: '#9b1c24',
  logoUrl: WEBSITE_LOGO_URL,
  businessName: 'PHEE',
  role: 'DJ',
  email: 'garyjohnstrybis@gmail.com',
  phone: '0780750397',
  bankName: 'Nedbank',
  accountNumber: '',
  accountHolder: 'PHEE',
  terms: 'Payment is due by the due date shown on this invoice.'
};

function useInvoiceTemplates() {
  const [templates, setTemplates] = useState(DEFAULT_INVOICE_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic');

  useEffect(() => {
    try {
      const savedTemplates = JSON.parse(window.localStorage.getItem('phee-invoice-templates') || 'null');
      const savedSelected = window.localStorage.getItem('phee-selected-invoice-template');
      if (Array.isArray(savedTemplates) && savedTemplates.length) setTemplates(savedTemplates);
      if (savedSelected) setSelectedTemplateId(savedSelected);
    } catch (error) {
      setTemplates(DEFAULT_INVOICE_TEMPLATES);
    }
  }, []);

  const saveTemplates = (nextTemplates, nextSelected = selectedTemplateId) => {
    setTemplates(nextTemplates);
    setSelectedTemplateId(nextSelected);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('phee-invoice-templates', JSON.stringify(nextTemplates));
      window.localStorage.setItem('phee-selected-invoice-template', nextSelected);
    }
  };

  return {
    templates,
    selectedTemplateId,
    selectedTemplate: templates.find((template) => template.id === selectedTemplateId) || templates[0] || FALLBACK_TEMPLATE,
    setSelectedTemplateId: (id) => saveTemplates(templates, id),
    saveTemplates
  };
}

function LoginPanel({ error, setError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login__panel" onSubmit={login}>
        <p className="admin-kicker">Private admin</p>
        <h1>PHEE Business Dashboard</h1>
        <p>Sign in with the Firebase admin account to view bookings, revenue, invoices, and reports.</p>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  );
}

function MetricCard({ label, value, note, onClick }) {
  const Tag = onClick ? 'button' : 'article';
  return (
    <Tag type={onClick ? 'button' : undefined} className={`admin-metric${onClick ? ' admin-metric--button' : ''}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </Tag>
  );
}

function BarChart({ title, data, format = (value) => value, onSelect, helper }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <h2>{title}</h2>
        {helper && <p>{helper}</p>}
      </div>
      <div className="admin-bars">
        {data.length ? data.slice(0, 10).map((item) => (
          <button type="button" className="admin-bar" key={item.label} onClick={() => onSelect?.(item)}>
            <span>{item.label}</span>
            <div><i style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }} /></div>
            <b>{format(item.value)}</b>
          </button>
        )) : <EmptyState label="No chart data yet" />}
      </div>
    </section>
  );
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthlyRevenueYears(data) {
  return [...new Set(data.map((item) => Number(String(item.label).slice(0, 4))).filter(Boolean))].sort((a, b) => b - a);
}

function monthlyRevenueForYear(data, year) {
  const map = new Map(data.map((item) => [item.label, item]));
  return MONTH_LABELS.map((month, index) => {
    const key = `${year}-${String(index + 1).padStart(2, '0')}`;
    const item = map.get(key);
    return {
      label: key,
      month,
      value: item?.value || 0,
      count: item?.count || 0
    };
  });
}

function MonthlyRevenueChart({ title, data, onSelect, helper }) {
  const currentYear = new Date().getFullYear();
  const years = monthlyRevenueYears(data);
  const [selectedYear, setSelectedYear] = useState(years.includes(currentYear) ? currentYear : years[0] || currentYear);
  const activeYear = years.includes(selectedYear) || !years.length ? selectedYear : years[0];
  const months = monthlyRevenueForYear(data, activeYear);
  const max = Math.max(...months.map((item) => item.value), 1);
  const axisValues = [max, max * 0.75, max * 0.5, max * 0.25, 0].map((value) => Math.round(value));
  const yearTotals = years.map((year) => ({
    year,
    value: monthlyRevenueForYear(data, year).reduce((sum, item) => sum + item.value, 0)
  }));

  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <h2>{title}</h2>
        {helper && <p>{helper}</p>}
      </div>
      {data.length ? (
        <>
          {years.length > 1 && (
            <div className="admin-year-tabs" aria-label="Revenue years">
              {years.map((year) => (
                <button type="button" key={year} className={year === activeYear ? 'is-active' : ''} onClick={() => setSelectedYear(year)}>
                  {year}
                  <small>{currency(yearTotals.find((item) => item.year === year)?.value || 0)}</small>
                </button>
              ))}
            </div>
          )}
          <div className="admin-month-chart">
            <div className="admin-month-axis" aria-hidden="true">
              {axisValues.map((value, index) => <span key={`${value}-${index}`}>{currency(value)}</span>)}
            </div>
            <div className="admin-month-bars" role="img" aria-label={`${title} for ${activeYear}`}>
              {months.map((item) => (
                <button type="button" className={`admin-month-bar${item.value ? '' : ' is-empty'}`} key={item.label} onClick={() => onSelect?.(item)}>
                  <span>{item.value ? currency(item.value) : ''}</span>
                  <div><i style={{ height: `${Math.max((item.value / max) * 100, item.value ? 6 : 0)}%` }} /></div>
                  <b>{item.month}</b>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : <EmptyState label="No revenue timeline yet" />}
    </section>
  );
}

function DonutChart({ title, data, onSelect, helper }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;
  const segments = data.map((item, index) => {
    const length = total ? (item.value / total) * 100 : 0;
    const segment = { ...item, length, offset, color: ['#81c784', '#64b5f6', '#ffb74d', '#e57373', '#ba68c8'][index % 5] };
    offset -= length;
    return segment;
  });

  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <h2>{title}</h2>
        {helper && <p>{helper}</p>}
      </div>
      {total ? (
        <div className="admin-donut-wrap">
          <svg className="admin-donut" viewBox="0 0 42 42" role="img" aria-label={title}>
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#27313d" strokeWidth="6" />
            {segments.map((item) => (
              <circle
                key={item.label}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={item.color}
                strokeWidth="6"
                strokeDasharray={`${item.length} ${100 - item.length}`}
                strokeDashoffset={item.offset}
              />
            ))}
          </svg>
          <div className="admin-legend">
            {segments.map((item) => <button type="button" key={item.label} onClick={() => onSelect?.(item)}><i style={{ background: item.color }} />{item.label}: {item.value}</button>)}
          </div>
        </div>
      ) : <EmptyState label="No status data yet" />}
    </section>
  );
}

function Heatmap({ data, onSelect }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <section className="admin-panel">
      <h2>Revenue by Month Heatmap</h2>
      <div className="admin-heatmap">
        {data.length ? data.map((item) => (
          <button type="button" key={item.label} style={{ opacity: 0.35 + (item.value / max) * 0.65 }} onClick={() => onSelect?.(item)}>
            <span>{item.label}</span>
            <strong>{currency(item.value)}</strong>
          </button>
        )) : <EmptyState label="No monthly records yet" />}
      </div>
    </section>
  );
}

function EmptyState({ label = 'No records found' }) {
  return <p className="admin-empty">{label}</p>;
}

function Skeleton() {
  return (
    <div className="admin-skeleton-grid">
      {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
    </div>
  );
}

function useFilteredBookings(bookings) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    eventType: '',
    startDate: '',
    endDate: '',
    sortBy: 'date-desc'
  });

  const filtered = useMemo(() => {
    const result = bookings.filter((booking) => {
      const haystack = [
        booking.clientName,
        booking.clientEmail,
        booking.clientPhone,
        booking.eventLocation,
        booking.invoiceNumber,
        booking.eventType
      ].join(' ').toLowerCase();
      const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || booking.status === filters.status;
      const matchesPayment = !filters.paymentStatus || booking.paymentStatus === filters.paymentStatus;
      const matchesEvent = !filters.eventType || booking.eventType === filters.eventType;
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;
      const matchesStart = !start || (booking.eventDate && booking.eventDate >= start);
      const matchesEnd = !end || (booking.eventDate && booking.eventDate <= end);
      return matchesSearch && matchesStatus && matchesPayment && matchesEvent && matchesStart && matchesEnd;
    });
    const getDate = (booking) => booking.eventDate?.getTime?.() || 0;
    const sorters = {
      'date-desc': (a, b) => getDate(b) - getDate(a),
      'date-asc': (a, b) => getDate(a) - getDate(b),
      'price-desc': (a, b) => b.quotedAmount - a.quotedAmount,
      'price-asc': (a, b) => a.quotedAmount - b.quotedAmount,
      'client-asc': (a, b) => a.clientName.localeCompare(b.clientName),
      'client-desc': (a, b) => b.clientName.localeCompare(a.clientName),
      'location-asc': (a, b) => a.eventLocation.localeCompare(b.eventLocation),
      'location-desc': (a, b) => b.eventLocation.localeCompare(a.eventLocation)
    };
    return [...result].sort(sorters[filters.sortBy] || sorters['date-desc']);
  }, [bookings, filters]);

  return { filters, setFilters, filtered };
}

function Filters({ filters, setFilters, eventTypes }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return (
    <div className="admin-filters">
      <input placeholder="Search client, email, phone, venue, invoice" value={filters.search} onChange={(event) => update('search', event.target.value)} />
      <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select value={filters.paymentStatus} onChange={(event) => update('paymentStatus', event.target.value)}>
        <option value="">All payments</option>
        {PAYMENT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <select value={filters.eventType} onChange={(event) => update('eventType', event.target.value)}>
        <option value="">All event types</option>
        {eventTypes.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <input type="date" value={filters.startDate} onChange={(event) => update('startDate', event.target.value)} />
      <input type="date" value={filters.endDate} onChange={(event) => update('endDate', event.target.value)} />
      <select value={filters.sortBy} onChange={(event) => update('sortBy', event.target.value)}>
        <option value="date-desc">Sort date newest</option>
        <option value="date-asc">Sort date oldest</option>
        <option value="price-desc">Sort price high to low</option>
        <option value="price-asc">Sort price low to high</option>
        <option value="client-asc">Sort client A-Z</option>
        <option value="client-desc">Sort client Z-A</option>
        <option value="location-asc">Sort location A-Z</option>
        <option value="location-desc">Sort location Z-A</option>
      </select>
    </div>
  );
}

function ManualBookingForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    eventLocation: '',
    source: 'In person',
    status: 'pending',
    paymentStatus: 'unpaid',
    quotedAmount: '',
    depositAmount: '',
    amountPaid: '',
    notes: ''
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'loading', message: 'Saving booking...' });
    try {
      await createManualBooking(form);
      setStatus({ state: 'success', message: 'Manual booking added to Firestore.' });
      setForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        eventType: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        duration: '',
        eventLocation: '',
        source: 'In person',
        status: 'pending',
        paymentStatus: 'unpaid',
        quotedAmount: '',
        depositAmount: '',
        amountPaid: '',
        notes: ''
      });
      onCreated?.();
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.code === 'permission-denied'
          ? 'Firestore rules are blocking manual booking creation for signed-in admins.'
          : error?.message || 'Manual booking could not be saved.'
      });
    }
  };

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>Add Manual Booking</h2>
          <p>Use this for bookings from social media, referrals, phone calls, or in-person conversations.</p>
        </div>
        <button type="button" onClick={() => setOpen((current) => !current)}>{open ? 'Close form' : 'New booking'}</button>
      </div>
      {open && (
        <form className="admin-manual-form" onSubmit={submit}>
          <label>Client name<input value={form.clientName} onChange={(event) => update('clientName', event.target.value)} required /></label>
          <label>Email<input type="email" value={form.clientEmail} onChange={(event) => update('clientEmail', event.target.value)} /></label>
          <label>Phone<input value={form.clientPhone} onChange={(event) => update('clientPhone', event.target.value)} /></label>
          <label>Event type
            <select value={form.eventType} onChange={(event) => update('eventType', event.target.value)} required>
              <option value="">Choose event type</option>
              {EVENT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>Event date<input type="date" value={form.eventDate} onChange={(event) => update('eventDate', event.target.value)} required /></label>
          <label>Start time<input type="time" value={form.startTime} onChange={(event) => update('startTime', event.target.value)} /></label>
          <label>End time<input type="time" value={form.endTime} onChange={(event) => update('endTime', event.target.value)} /></label>
          <label>Duration<input value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="4hr" /></label>
          <label>Location<input value={form.eventLocation} onChange={(event) => update('eventLocation', event.target.value)} /></label>
          <label>Source
            <select value={form.source} onChange={(event) => update('source', event.target.value)}>
              <option>In person</option>
              <option>Instagram</option>
              <option>WhatsApp</option>
              <option>Referral</option>
              <option>Google</option>
              <option>Repeat client</option>
              <option>Website</option>
            </select>
          </label>
          <label>Booking status
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>Payment status
            <select value={form.paymentStatus} onChange={(event) => update('paymentStatus', event.target.value)}>
              {PAYMENT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>Quoted amount<input type="number" min="0" value={form.quotedAmount} onChange={(event) => update('quotedAmount', event.target.value)} /></label>
          <label>Deposit amount<input type="number" min="0" value={form.depositAmount} onChange={(event) => update('depositAmount', event.target.value)} /></label>
          <label>Amount paid<input type="number" min="0" value={form.amountPaid} onChange={(event) => update('amountPaid', event.target.value)} /></label>
          <label className="admin-manual-form__wide">Notes<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
          <div className="admin-manual-form__actions">
            <button type="submit" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Saving...' : 'Save booking'}</button>
            {status.message && <p className={`admin-alert admin-alert--${status.state === 'error' ? 'error' : 'success'}`}>{status.message}</p>}
          </div>
        </form>
      )}
    </section>
  );
}

function bookingMetrics(bookings) {
  const now = new Date();
  return {
    upcoming: bookings.filter((booking) => booking.eventDate && booking.eventDate >= now && booking.status !== 'cancelled').length,
    confirmed: bookings.filter((booking) => ['confirmed', 'accepted', 'completed'].includes(booking.status)).length,
    pending: bookings.filter((booking) => ['pending', 'enquiry'].includes(booking.status)).length,
    depositsCollected: bookings.filter((booking) => ['deposit', 'paid'].includes(booking.paymentStatus) || booking.depositAmount > 0 || booking.amountPaid > 0).length,
    fullyPaid: bookings.filter((booking) => booking.paymentStatus === 'paid' || (booking.quotedAmount > 0 && booking.amountPaid >= booking.quotedAmount)).length
  };
}

function paymentPatchForBooking(status, booking) {
  const depositAmount = booking.depositAmount || Math.round(booking.quotedAmount * 0.5);
  if (status === 'paid') {
    return {
      amountPaid: booking.quotedAmount,
      balanceAmount: 0,
      paymentStatus: 'paid',
      status: booking.status === 'enquiry' || booking.status === 'confirmed' || booking.status === 'pending' ? 'accepted' : booking.status
    };
  }
  if (status === 'deposit') {
    return {
      depositAmount,
      amountPaid: Math.max(booking.amountPaid, depositAmount),
      balanceAmount: Math.max(booking.quotedAmount - Math.max(booking.amountPaid, depositAmount), 0),
      paymentStatus: status
    };
  }
  if (status === 'unpaid') return { amountPaid: 0, balanceAmount: booking.quotedAmount, paymentStatus: status };
  return { paymentStatus: status };
}

function invoicePatchForBookingPayment(status, invoice, bookingPatch) {
  if (status === 'paid') return { status: 'paid', paymentStatus: 'paid', amountPaid: invoice.total, balanceDue: 0 };
  if (status === 'deposit') {
    const amountPaid = Math.min(Number(bookingPatch.amountPaid || invoice.amountPaid || 0), invoice.total);
    return { status: 'partial', paymentStatus: 'deposit', amountPaid, balanceDue: Math.max(invoice.total - amountPaid, 0) };
  }
  if (status === 'unpaid') return { status: invoice.status === 'draft' ? 'draft' : 'sent', paymentStatus: 'unpaid', amountPaid: 0, balanceDue: invoice.total };
  return { paymentStatus: status };
}

function linkedInvoicesForBooking(invoices, booking) {
  return invoices.filter((invoice) => (
    invoice.bookingId === booking.id ||
    (booking.invoiceNumber && invoice.invoiceNumber === booking.invoiceNumber)
  ));
}

// Maps booking status → invoice status and recalculates balanceDue.
// Rules:
//   accepted / confirmed / completed  → invoice stays active; preserve existing payment state
//   cancelled                         → invoice marked cancelled; balanceDue = cancellation fee minus paid
//   pending / enquiry / declined      → invoice reverts to draft; no money is considered outstanding
function invoicePatchForBookingStatus(bookingStatus, invoice, cancellationFeePercent = 0) {
  if (['accepted', 'confirmed', 'completed'].includes(bookingStatus)) {
    // Keep whatever payment state the invoice already has; just ensure it's not draft/cancelled
    const nextStatus = ['draft', 'cancelled'].includes(invoice.status) ? 'sent' : invoice.status;
    return { status: nextStatus };
  }
  if (bookingStatus === 'cancelled') {
    const fee = Math.round(Number(invoice.total || 0) * (cancellationFeePercent / 100));
    const paid = Number(invoice.amountPaid || 0);
    const balanceDue = Math.max(fee - paid, 0);
    return { status: 'cancelled', balanceDue };
  }
  // pending / enquiry / declined — nothing is owed yet
  return { status: 'draft', balanceDue: 0 };
}

async function syncInvoicesFromBookingPayment(invoices, booking, paymentStatus, bookingPatch) {
  const linked = linkedInvoicesForBooking(invoices, booking);
  await Promise.all(linked.map((invoice) => saveInvoice({
    ...invoice,
    ...invoicePatchForBookingPayment(paymentStatus, invoice, bookingPatch)
  })));
}

async function syncInvoicesFromBookingStatus(invoices, booking, nextStatus, cancellationFeePercent) {
  const linked = linkedInvoicesForBooking(invoices, booking);
  await Promise.all(linked.map((invoice) => saveInvoice({
    ...invoice,
    ...invoicePatchForBookingStatus(nextStatus, invoice, cancellationFeePercent)
  })));
}

function BookingsTable({ bookings, invoices, onSelect, onGenerateQuote, onGenerateInvoice }) {
  const [actionStatus, setActionStatus] = useState('');
  const changeEventType = async (event, booking) => {
    event.stopPropagation();
    try {
      await updateBooking(booking.id, { eventType: event.target.value, event: event.target.value });
      setActionStatus(`Updated ${booking.clientName} event type to ${event.target.value}.`);
    } catch (error) {
      setActionStatus(error?.code === 'permission-denied' ? 'Firestore rules blocked the event type update.' : 'Event type could not be updated.');
    }
  };
  const changeStatus = async (event, booking) => {
    event.stopPropagation();
    const nextStatus = event.target.value;
    const patch = { status: nextStatus };
    let cancellationFeePercent = booking.cancellationFeePercent || 0;
    if (nextStatus === 'cancelled') {
      const answer = window.prompt('Cancellation fee percentage? Enter 0, 50, or 100.', String(cancellationFeePercent));
      cancellationFeePercent = CANCELLATION_FEE_OPTIONS.includes(Number(answer)) ? Number(answer) : 0;
      patch.cancellationFeePercent = cancellationFeePercent;
    }
    try {
      await updateBooking(booking.id, patch);
      await syncInvoicesFromBookingStatus(invoices, booking, nextStatus, cancellationFeePercent);
      setActionStatus(`Updated ${booking.clientName} to ${nextStatus}.`);
    } catch (error) {
      setActionStatus(error?.code === 'permission-denied' ? 'Firestore rules blocked the status update.' : 'Status could not be updated.');
    }
  };
  const changePaymentStatus = async (event, booking) => {
    event.stopPropagation();
    const paymentStatus = event.target.value;
    const patch = paymentPatchForBooking(paymentStatus, booking);
    try {
      await updateBooking(booking.id, patch);
      await syncInvoicesFromBookingPayment(invoices, booking, paymentStatus, patch);
      setActionStatus(`Updated ${booking.clientName} payment to ${paymentStatus}.`);
    } catch (error) {
      setActionStatus(error?.code === 'permission-denied' ? 'Firestore rules blocked the payment update.' : 'Payment could not be updated.');
    }
  };
  const markDepositPaid = async (event, booking) => {
    event.stopPropagation();
    const depositAmount = booking.depositAmount || Math.round(booking.quotedAmount * 0.5);
    const patch = { depositAmount, amountPaid: Math.max(booking.amountPaid, depositAmount), balanceAmount: Math.max(booking.quotedAmount - Math.max(booking.amountPaid, depositAmount), 0), paymentStatus: 'deposit' };
    try {
      await updateBooking(booking.id, patch);
      await syncInvoicesFromBookingPayment(invoices, booking, 'deposit', patch);
      setActionStatus(`Marked deposit paid for ${booking.clientName}.`);
    } catch (error) {
      setActionStatus('Deposit update could not be saved.');
    }
  };
  const markFullyPaid = async (event, booking) => {
    event.stopPropagation();
    const patch = { amountPaid: booking.quotedAmount, balanceAmount: 0, paymentStatus: 'paid', status: booking.status === 'enquiry' || booking.status === 'confirmed' || booking.status === 'pending' ? 'accepted' : booking.status };
    try {
      await updateBooking(booking.id, patch);
      await syncInvoicesFromBookingPayment(invoices, booking, 'paid', patch);
      setActionStatus(`Marked ${booking.clientName} fully paid.`);
    } catch (error) {
      setActionStatus('Full payment update could not be saved.');
    }
  };
  const removeBooking = async (event, booking) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Delete booking for ${booking.clientName}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteBooking(booking.id);
      setActionStatus(`Deleted booking for ${booking.clientName}.`);
    } catch (error) {
      setActionStatus(error?.code === 'permission-denied' ? 'Firestore rules blocked deleting this booking.' : 'Booking could not be deleted.');
    }
  };

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__intro">
        <h2>Bookings</h2>
        <p>Change status inline, sort the list above, or open a booking for full details.</p>
      </div>
      {actionStatus && <p className="admin-alert">{actionStatus}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table admin-bookings-table">
          <thead><tr><th>Date</th><th>Client</th><th>Event</th><th>Location</th><th>Status</th><th>Payment</th><th>Quoted</th><th>Outstanding</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} onClick={() => onSelect(booking.id)}>
                <td>{booking.eventDateLabel}</td>
                <td><button type="button">{booking.clientName}</button></td>
                <td>
                  <select className="admin-status-select" value={normalizeEventTypeOption(booking.eventType)} onClick={(event) => event.stopPropagation()} onChange={(event) => changeEventType(event, booking)}>
                    {EVENT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td>{booking.eventLocation}</td>
                <td>
                  <select className={`admin-status-select admin-pill--${statusSelectValue(booking.status)}`} value={statusSelectValue(booking.status)} onClick={(event) => event.stopPropagation()} onChange={(event) => changeStatus(event, booking)}>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td>
                  <select className={`admin-status-select admin-pill--${booking.paymentStatus}`} value={PAYMENT_OPTIONS.includes(booking.paymentStatus) ? booking.paymentStatus : 'deposit'} onClick={(event) => event.stopPropagation()} onChange={(event) => changePaymentStatus(event, booking)}>
                    {PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td>{currency(booking.quotedAmount)}</td>
                <td>{currency(outstandingForBooking(booking))}</td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" onClick={(event) => { event.stopPropagation(); onGenerateQuote?.(booking.id); }}>Quote</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); onGenerateInvoice?.(booking.id); }}>Invoice</button>
                    <button type="button" className="admin-danger-btn" onClick={(event) => removeBooking(event, booking)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && <EmptyState />}
      </div>
    </section>
  );
}

function BookingsView({ bookings, invoices, filtered, filters, setFilters, eventTypes, onSelect, onGenerateQuote, onGenerateInvoice }) {
  const metrics = bookingMetrics(bookings);
  return (
    <div className="admin-stack">
      <ManualBookingForm />
      <div className="admin-metrics admin-metrics--compact">
        <MetricCard label="Upcoming" value={metrics.upcoming} />
        <MetricCard label="Accepted / completed" value={metrics.confirmed} />
        <MetricCard label="Pending" value={metrics.pending} />
        <MetricCard label="Deposits collected" value={metrics.depositsCollected} />
        <MetricCard label="Fully paid" value={metrics.fullyPaid} />
      </div>
      <Filters filters={filters} setFilters={setFilters} eventTypes={eventTypes} />
      <BookingsTable bookings={filtered} invoices={invoices} onSelect={onSelect} onGenerateQuote={onGenerateQuote} onGenerateInvoice={onGenerateInvoice} />
    </div>
  );
}

function valueNumber(value) {
  return Number(value || 0);
}

function invoicePaidAmount(invoice) {
  return valueNumber(invoice.amountPaid || (invoice.status === 'paid' ? invoice.total : 0));
}

function invoiceBalanceDue(invoice) {
  return valueNumber(invoice.balanceDue ?? Math.max(valueNumber(invoice.total) - invoicePaidAmount(invoice), 0));
}

function formatAdminDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'N/A';
  return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isUpcomingBooking(booking) {
  if (!booking.eventDate || ['cancelled', 'completed', 'declined'].includes(booking.status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return booking.eventDate >= today;
}

function bookingsForGroup(bookings, type, label) {
  if (type === 'upcoming') return bookings.filter(isUpcomingBooking).sort((a, b) => (a.eventDate?.getTime?.() || 0) - (b.eventDate?.getTime?.() || 0));
  if (type === 'statusGroup') return bookings.filter((booking) => label.includes(booking.status));
  if (type === 'outstandingBookings') return bookings.filter((booking) => outstandingForBooking(booking) > 0);
  if (type === 'year') return bookings.filter((booking) => (booking.eventDate || booking.createdAt)?.getFullYear?.() === label);
  if (type === 'taxYear') return bookings.filter((booking) => {
    const date = booking.eventDate || booking.createdAt;
    return date && date >= label.start && date <= label.end;
  });
  if (type === 'month') {
    return bookings.filter((booking) => {
      const date = booking.eventDate || booking.createdAt;
      return date && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === label;
    });
  }
  if (type === 'eventType') return bookings.filter((booking) => booking.eventType === label);
  if (type === 'status') return bookings.filter((booking) => booking.status === label);
  if (type === 'paymentStatus') return bookings.filter((booking) => booking.paymentStatus === label);
  if (type === 'location') return bookings.filter((booking) => booking.eventLocation === label);
  if (type === 'client') return bookings.filter((booking) => booking.clientName === label);
  if (type === 'source') return bookings.filter((booking) => booking.source === label);
  return [];
}

function invoiceRowsForMetric(invoices, metric) {
  if (metric === 'totalInvoiced') return invoices.filter((invoice) => valueNumber(invoice.total) > 0);
  if (metric === 'totalPaid') return invoices.filter((invoice) => invoicePaidAmount(invoice) > 0);
  // Include cancelled invoices when there's still a cancellation fee balance due; exclude void and draft.
  if (metric === 'outstanding') return invoices.filter((invoice) => invoiceBalanceDue(invoice) > 0 && invoice.status !== 'void' && invoice.status !== 'draft');
  return [];
}

function bookingIdsForInvoices(invoices) {
  return new Set(invoices.map((invoice) => invoice.bookingId).filter(Boolean));
}

function InsightDrawer({ insight, onClose, onBookingSelect }) {
  if (!insight) return null;
  const insightBookings = insight.bookings || [];
  const insightInvoices = insight.invoices || [];
  const totalQuoted = insightBookings.reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const bookingPaid = insightBookings.reduce((sum, booking) => sum + booking.amountPaid, 0);
  const invoiceTotal = insightInvoices.reduce((sum, invoice) => sum + valueNumber(invoice.total), 0);
  const invoicePaid = insightInvoices.reduce((sum, invoice) => sum + invoicePaidAmount(invoice), 0);
  const invoiceOutstanding = insightInvoices.reduce((sum, invoice) => sum + invoiceBalanceDue(invoice), 0);
  const totalPaid = insightInvoices.length ? invoicePaid : bookingPaid;
  const totalOutstanding = insightInvoices.length ? invoiceOutstanding : Math.max(totalQuoted - bookingPaid, 0);
  const contacts = [...new Map(insightBookings.map((booking) => [booking.clientEmail || booking.clientName, booking])).values()];
  const showInvoices = insightInvoices.length || insight.mode === 'invoices';

  return (
    <aside className="admin-detail" aria-label="Analytics detail">
      <div className="admin-detail__head">
        <div>
          <p className="admin-kicker">{insight.type}</p>
          <h2>{insight.label}</h2>
          {insight.helper && <p>{insight.helper}</p>}
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <div className="admin-drilldown-summary">
        <MetricCard label="Bookings" value={insightBookings.length} />
        {showInvoices && <MetricCard label="Invoices" value={insightInvoices.length} />}
        <MetricCard label={showInvoices ? 'Invoiced' : 'Quoted'} value={currency(showInvoices ? invoiceTotal : totalQuoted)} />
        <MetricCard label="Paid" value={currency(totalPaid)} />
        <MetricCard label="Outstanding" value={currency(totalOutstanding)} />
      </div>
      {insight.type === 'client' && contacts[0] && (
        <section className="admin-contact-card">
          <h3>Contact details</h3>
          <p>{contacts[0].clientEmail || 'No email saved'}</p>
          <p>{contacts[0].clientPhone || 'No phone saved'}</p>
        </section>
      )}
      {showInvoices ? (
        <>
          <h3>Related invoices</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Client</th><th>Invoice</th><th>Event date</th><th>Status</th><th>Invoiced</th><th>Paid</th><th>Balance</th><th>Follow up</th></tr></thead>
              <tbody>
                {insightInvoices.map((invoice) => (
                  <tr key={invoice.id} onClick={() => invoice.bookingId && onBookingSelect(invoice.bookingId)}>
                    <td><button type="button">{invoice.clientName || 'Client'}</button><small>{invoice.clientEmail || invoice.clientPhone}</small></td>
                    <td>{invoice.invoiceNumber || 'Draft'}</td>
                    <td>{formatAdminDate(invoice.eventDate || invoice.issueDate)}</td>
                    <td>{invoice.status}</td>
                    <td>{currency(invoice.total)}</td>
                    <td>{currency(invoicePaidAmount(invoice))}</td>
                    <td>{currency(invoiceBalanceDue(invoice))}</td>
                    <td>
                      <div className="admin-contact-actions">
                        {invoice.clientEmail && <a href={`mailto:${invoice.clientEmail}?subject=${encodeURIComponent(`PHEE invoice ${invoice.invoiceNumber || ''}`)}`} onClick={(event) => event.stopPropagation()}>Email</a>}
                        {invoice.clientPhone && <a href={`tel:${invoice.clientPhone}`} onClick={(event) => event.stopPropagation()}>Call</a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!insightInvoices.length && <EmptyState label="No matching invoices" />}
          </div>
        </>
      ) : null}
      <h3>{showInvoices ? 'Linked bookings' : 'Related bookings'}</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Client</th><th>Date</th><th>Event</th><th>Status</th><th>Paid</th><th>Outstanding</th><th>Follow up</th></tr></thead>
          <tbody>
            {insightBookings.map((booking) => (
              <tr key={booking.id} onClick={() => onBookingSelect(booking.id)}>
                <td><button type="button">{booking.clientName}</button><small>{booking.clientEmail}</small></td>
                <td>{booking.eventDateLabel}</td>
                <td>{booking.eventType}</td>
                <td>{booking.status}</td>
                <td>{currency(booking.amountPaid)}</td>
                <td>{currency(outstandingForBooking(booking))}</td>
                <td>
                  <div className="admin-contact-actions">
                    {booking.clientEmail && <a href={`mailto:${booking.clientEmail}?subject=${encodeURIComponent(`PHEE ${booking.eventType || 'booking'} follow-up`)}`} onClick={(event) => event.stopPropagation()}>Email</a>}
                    {booking.clientPhone && <a href={`tel:${booking.clientPhone}`} onClick={(event) => event.stopPropagation()}>Call</a>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!insightBookings.length && <EmptyState label={showInvoices ? 'No linked bookings' : 'No matching bookings'} />}
      </div>
    </aside>
  );
}


// Read-only invoice preview modal — renders the real invoice exactly as it appears in the Invoices section.
// Used when clicking an invoice number in the Reports table.
function InvoicePreviewModal({ invoice, templates, selectedTemplateId, onTemplateChange, onClose }) {
  if (!invoice) return null;
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0] || FALLBACK_TEMPLATE;
  const emailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${activeTemplate.businessName}`);
  const emailBody = encodeURIComponent(`Hi ${invoice.clientName || ''},\n\nPlease find invoice ${invoice.invoiceNumber} for ${currency(invoice.total)}.\n\nBalance due: ${currency(invoice.balanceDue)}.\n\nRegards,\n${activeTemplate.businessName}`);
  const mailHref = invoice.clientEmail ? `mailto:${invoice.clientEmail}?subject=${emailSubject}&body=${emailBody}` : '';
  return (
    <div className="admin-invoice-modal" role="dialog" aria-modal="true" aria-label="Invoice preview">
      <div className="admin-invoice-toolbar">
        <div>
          <p className="admin-kicker">Invoice preview</p>
          <h2>{invoice.invoiceNumber}</h2>
        </div>
        <div className="admin-invoice-toolbar__actions">
          <select value={selectedTemplateId} onChange={(event) => onTemplateChange(event.target.value)}>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="button" onClick={() => printInvoice(invoice, activeTemplate)}>Save to computer</button>
          {mailHref ? <a href={mailHref}>Send to client</a> : <button type="button" disabled>Send to client</button>}
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="admin-invoice-modal__preview">
        <InvoicePreview invoice={invoice} template={activeTemplate} />
      </div>
    </div>
  );
}

function BookingDetail({ booking, invoices, invoiceTemplates, selectedTemplateId, onTemplateChange, onClose, onGenerateQuote, onGenerateInvoice }) {
  const [notes, setNotes] = useState(booking?.notes || '');
  const relatedInvoices = invoices.filter((invoice) => invoice.bookingId === booking?.id);
  if (!booking) return null;

  const savePatch = (patch) => updateBooking(booking.id, patch);
  const savePaymentStatus = async (status) => {
    const patch = paymentPatchForBooking(status, booking);
    await updateBooking(booking.id, patch);
    await syncInvoicesFromBookingPayment(invoices, booking, status, patch);
  };

  return (
    <aside className="admin-detail" aria-label="Booking detail">
      <div className="admin-detail__head">
        <div>
          <p className="admin-kicker">Booking detail</p>
          <h2>{booking.clientName}</h2>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <dl className="admin-detail__grid">
        <div><dt>Email</dt><dd>{booking.clientEmail || 'N/A'}</dd></div>
        <div><dt>Phone</dt><dd>{booking.clientPhone || 'N/A'}</dd></div>
        <div><dt>Event</dt><dd>{booking.eventType}</dd></div>
        <div><dt>Date</dt><dd>{booking.eventDateLabel}</dd></div>
        <div><dt>Time</dt><dd>{[booking.startTime, booking.endTime].filter(Boolean).join(' - ') || 'N/A'}</dd></div>
        <div><dt>Location</dt><dd>{booking.eventLocation}</dd></div>
        <div><dt>Quoted</dt><dd>{currency(booking.quotedAmount)}</dd></div>
        <div><dt>Paid</dt><dd>{currency(booking.amountPaid)}</dd></div>
      </dl>
      <div className="admin-detail-controls">
        <label>Event type
          <select value={normalizeEventTypeOption(booking.eventType)} onChange={(event) => savePatch({ eventType: event.target.value, event: event.target.value })}>
            {EVENT_TYPE_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>Booking status
          <select value={statusSelectValue(booking.status)} onChange={(event) => savePatch({ status: event.target.value, ...(event.target.value === 'cancelled' ? { cancellationFeePercent: booking.cancellationFeePercent || 0 } : {}) })}>
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>Payment status
          <select value={PAYMENT_OPTIONS.includes(booking.paymentStatus) ? booking.paymentStatus : 'deposit'} onChange={(event) => savePaymentStatus(event.target.value)}>
            {PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        {statusSelectValue(booking.status) === 'cancelled' && (
          <label>Cancellation fee
            <select value={booking.cancellationFeePercent || 0} onChange={(event) => savePatch({ cancellationFeePercent: Number(event.target.value) })}>
              {CANCELLATION_FEE_OPTIONS.map((percent) => <option key={percent} value={percent}>{percent}%</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="admin-actions">
        <button type="button" onClick={() => savePatch({ depositAmount: booking.depositAmount || Math.round(booking.quotedAmount * 0.5), amountPaid: booking.depositAmount || Math.round(booking.quotedAmount * 0.5), paymentStatus: 'deposit' })}>Mark deposit paid</button>
        <button type="button" onClick={() => savePatch({ amountPaid: booking.quotedAmount, balanceAmount: 0, paymentStatus: 'paid', status: booking.status === 'enquiry' || booking.status === 'confirmed' || booking.status === 'pending' ? 'accepted' : booking.status })}>Mark fully paid</button>
        <button type="button" onClick={() => onGenerateInvoice?.(booking.id)}>Generate invoice</button>
        <button type="button" onClick={() => onGenerateQuote?.(booking.id)}>Generate Quote</button>
      </div>
      <label className="admin-notes">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
      <button className="admin-save" type="button" onClick={() => savePatch({ notes })}>Save notes</button>
      <h3>Related invoices</h3>
      {relatedInvoices.length ? relatedInvoices.map((invoice) => (
        <p key={invoice.id} className="admin-related">{invoice.invoiceNumber} · {currency(invoice.total)} · {invoice.status}</p>
      )) : <EmptyState label="No related invoices yet" />}
    </aside>
  );
}

function Overview({ bookings, invoices, onExplore }) {
  const summary = summarizeBookings(bookings);
  const invoiceTotals = invoiceSummary(invoices);
  const months = revenueByMonth(bookings);
  const tax = taxYearSummary(bookings);
  const eventTypes = groupByValue(bookings.filter((b) => b.status !== 'cancelled'), (b) => normalizeEventTypeOption(b.eventType));
  const locations = groupByValue(bookings.filter((b) => b.status !== 'cancelled'), (b) => b.eventLocation);
  const clients = groupByValue(bookings.filter((b) => b.status !== 'cancelled'), (b) => b.clientName);
  const exploreInvoices = (metric, label, helper) => {
    const metricInvoices = invoiceRowsForMetric(invoices, metric);
    const linkedBookingIds = bookingIdsForInvoices(metricInvoices);
    onExplore({
      type: 'invoice metric',
      label,
      helper,
      mode: 'invoices',
      invoices: metricInvoices,
      bookings: bookings.filter((booking) => linkedBookingIds.has(booking.id))
    });
  };
  const exploreBookings = (type, label, helper) => {
    const displayLabel = Array.isArray(label) ? label.join(' / ') : (label?.label || label);
    onExplore({
      type,
      label: displayLabel,
      helper,
      bookings: bookingsForGroup(bookings, type, Array.isArray(label) ? label : label)
    });
  };

  return (
    <>
      <section className="admin-focus">
        <div>
          <p className="admin-kicker">What to look at first</p>
          <h2>Money in, money owed, and upcoming work.</h2>
          <p>Start here when you want a quick read on the business. Click any chart row, status, client, or month to open the bookings behind that number.</p>
        </div>
        <div className="admin-focus__metrics">
          <MetricCard label="Total invoiced" value={currency(invoiceTotals.totalInvoiced)} note="See every issued invoice" onClick={() => exploreInvoices('totalInvoiced', 'Total invoiced', 'Every invoice contributing to the invoiced total.')} />
          <MetricCard label="Total paid" value={currency(invoiceTotals.totalPaid)} note="Collected invoice revenue" onClick={() => exploreInvoices('totalPaid', 'Total paid', 'Invoices with money received, including deposits.')} />
          <MetricCard
            label="Outstanding"
            value={currency(invoiceTotals.outstanding)}
            note="Who to follow up now"
            onClick={() => exploreInvoices('outstanding', 'Outstanding balances', 'Invoices with an unpaid balance — accepted/completed bookings still due, plus cancelled bookings with a cancellation fee.')}
          />
          <MetricCard label="Upcoming bookings" value={summary.upcomingBookings} note="Future workload" onClick={() => exploreBookings('upcoming', 'Upcoming bookings', 'Future non-cancelled bookings sorted by event date.')} />
        </div>
      </section>
      <div className="admin-metrics admin-metrics--compact">
        <MetricCard label="This month" value={currency(invoiceTotals.revenueThisMonth || summary.revenueThisMonth)} onClick={() => onExplore('month', `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)} />
        <MetricCard label="This year" value={currency(invoiceTotals.revenueThisYear || summary.revenueThisYear)} onClick={() => exploreBookings('year', new Date().getFullYear(), 'Bookings dated in the current calendar year.')} />
        <MetricCard label="Completed" value={summary.completedBookings} onClick={() => onExplore('status', 'completed')} />
        <MetricCard label="Cancelled" value={summary.cancelledBookings} onClick={() => onExplore('status', 'cancelled')} />
        <MetricCard label={`Tax year ${tax.taxYear.label}`} value={currency(invoiceTotals.totalPaid || tax.totals.paid)} note="Paid revenue" onClick={() => exploreBookings('taxYear', tax.taxYear, `Bookings inside the ${tax.taxYear.label} South African tax year.`)} />
      </div>
      <div className="admin-grid">
        <MonthlyRevenueChart title="Monthly Revenue" data={months} helper="Shows a full Jan-Dec revenue view for the selected year. Click a month to inspect the records behind it." onSelect={(item) => onExplore('month', item.label)} />
        <DonutChart title="Booking Status" data={bookingsByStatus(bookings)} helper="Shows pipeline health across pending, accepted, completed, cancelled, and declined work." onSelect={(item) => onExplore('status', item.label)} />
        <BarChart title="Revenue by Event Type" data={eventTypes} format={currency} helper="Shows which booking types are worth focusing marketing on." onSelect={(item) => onExplore('eventType', item.label)} />
        <DonutChart title="Payment Status" data={paymentsByStatus(bookings)} helper="Shows collection risk and deposit progress." onSelect={(item) => onExplore('paymentStatus', item.label)} />
        <Heatmap data={months} onSelect={(item) => onExplore('month', item.label)} />
        <BarChart title="Location / Area Revenue" data={locations} format={currency} helper="Shows where the business is strongest geographically." onSelect={(item) => onExplore('location', item.label)} />
        <TopClients clients={clients} onSelect={(client) => onExplore('client', client.label)} />
        <OperationalInsights bookings={bookings} months={months} />
      </div>
    </>
  );
}

function TopClients({ clients, onSelect }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <h2>Top Clients</h2>
        <p>Click a client to see contact details and booking history.</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Client</th><th>Bookings</th><th>Revenue</th></tr></thead>
          <tbody>{clients.slice(0, 8).map((client) => <tr key={client.label} onClick={() => onSelect?.(client)}><td><button type="button">{client.label}</button></td><td>{client.count}</td><td>{currency(client.value)}</td></tr>)}</tbody>
        </table>
        {!clients.length && <EmptyState />}
      </div>
    </section>
  );
}

function OperationalInsights({ bookings, months }) {
  const cancelledRevenue = bookings.filter((b) => b.status === 'cancelled').reduce((sum, b) => sum + b.quotedAmount, 0);
  const channels = groupByValue(bookings, (b) => b.source);
  return (
    <section className="admin-panel">
      <h2>Growth & Operations</h2>
      <div className="admin-insights">
        <p><strong>{Math.round(enquiryToConfirmedRate(bookings) * 100)}%</strong><span>Pending to accepted conversion</span></p>
        <p><strong>{Math.round(cancellationRate(bookings) * 100)}%</strong><span>Cancellation rate</span></p>
        <p><strong>{Math.round(averageLeadTime(bookings))} days</strong><span>Average booking lead time</span></p>
        <p><strong>{currency(cancelledRevenue)}</strong><span>Cancelled quoted revenue</span></p>
        <p><strong>{Math.round(monthlyGrowthRate(months) * 100)}%</strong><span>Latest monthly growth</span></p>
        <p><strong>{Math.round(yearOverYearGrowth(bookings) * 100)}%</strong><span>Year over year growth</span></p>
      </div>
      <h3>Source / Channel Performance</h3>
      <div className="admin-mini-list">{channels.slice(0, 6).map((channel) => <span key={channel.label}>{channel.label}: {currency(channel.value)}</span>)}</div>
    </section>
  );
}

function RevenueView({ bookings, invoices, onExplore }) {
  const months = revenueByMonth(bookings);
  return (
    <div className="admin-grid">
      <MonthlyRevenueChart title="Monthly Revenue" data={months} helper="Click a month to see the bookings that made up that revenue." onSelect={(item) => onExplore('month', item.label)} />
      <BarChart title="Revenue by Event Type" data={groupByValue(bookings, (b) => normalizeEventTypeOption(b.eventType))} format={currency} onSelect={(item) => onExplore('eventType', item.label)} />
      <BarChart title="Revenue by Client" data={groupByValue(bookings, (b) => b.clientName)} format={currency} onSelect={(item) => onExplore('client', item.label)} />
      <BarChart title="Revenue by Location / Area" data={groupByValue(bookings, (b) => b.eventLocation)} format={currency} onSelect={(item) => onExplore('location', item.label)} />
      <Heatmap data={months} onSelect={(item) => onExplore('month', item.label)} />
      <OperationalInsights bookings={bookings} months={months} />
    </div>
  );
}

function InvoiceTemplatesPanel({ templates, selectedTemplateId, saveTemplates, setSelectedTemplateId }) {
  const [editingId, setEditingId] = useState(selectedTemplateId);
  const activeTemplate = templates.find((template) => template.id === editingId) || templates[0] || FALLBACK_TEMPLATE;
  const updateTemplate = (key, value) => {
    const nextTemplates = templates.map((template) => (
      template.id === activeTemplate.id ? { ...template, [key]: value } : template
    ));
    saveTemplates(nextTemplates, selectedTemplateId);
  };
  const duplicateTemplate = () => {
    const nextId = `template-${Date.now()}`;
    const nextTemplate = { ...activeTemplate, id: nextId, name: `${activeTemplate.name} copy` };
    saveTemplates([...templates, nextTemplate], nextId);
    setEditingId(nextId);
  };

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>Invoice Templates</h2>
          <p>Set the default invoice style, business details, logo, banking details, and terms used by the preview popup.</p>
        </div>
        <button type="button" onClick={duplicateTemplate}>Duplicate template</button>
      </div>
      <div className="admin-template-layout">
        <aside className="admin-template-list">
          {templates.map((template) => (
            <button
              type="button"
              key={template.id}
              className={template.id === editingId ? 'is-active' : ''}
              onClick={() => setEditingId(template.id)}
            >
              <span>{template.name}</span>
              <small>{template.id === selectedTemplateId ? 'Default' : 'Template'}</small>
            </button>
          ))}
        </aside>
        <div className="admin-template-form">
          <label>Template name<input value={activeTemplate.name} onChange={(event) => updateTemplate('name', event.target.value)} /></label>
          <label>Accent color<input type="color" value={activeTemplate.accentColor} onChange={(event) => updateTemplate('accentColor', event.target.value)} /></label>
          <label>Logo URL<input value={activeTemplate.logoUrl} onChange={(event) => updateTemplate('logoUrl', event.target.value)} placeholder={WEBSITE_LOGO_URL} /></label>
          <label>Business name<input value={activeTemplate.businessName} onChange={(event) => updateTemplate('businessName', event.target.value)} /></label>
          <label>Role<input value={activeTemplate.role} onChange={(event) => updateTemplate('role', event.target.value)} /></label>
          <label>Email<input value={activeTemplate.email} onChange={(event) => updateTemplate('email', event.target.value)} /></label>
          <label>Phone<input value={activeTemplate.phone} onChange={(event) => updateTemplate('phone', event.target.value)} /></label>
          <label>Bank name<input value={activeTemplate.bankName} onChange={(event) => updateTemplate('bankName', event.target.value)} /></label>
          <label>Account number<input value={activeTemplate.accountNumber} onChange={(event) => updateTemplate('accountNumber', event.target.value)} /></label>
          <label>Account holder<input value={activeTemplate.accountHolder} onChange={(event) => updateTemplate('accountHolder', event.target.value)} /></label>
          <label className="admin-template-form__wide">Terms<textarea value={activeTemplate.terms} onChange={(event) => updateTemplate('terms', event.target.value)} /></label>
          <div className="admin-template-form__actions">
            <button type="button" onClick={() => setSelectedTemplateId(activeTemplate.id)}>Use as default</button>
            <p>Logo defaults to the site favicon. Use any hosted image URL if you want a different invoice logo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvoicesView({ bookings, invoices, invoiceError, invoiceTemplates, selectedTemplateId, saveTemplates, setSelectedTemplateId }) {
  const [tab, setTab] = useState('invoices');
  const invoiceRows = invoices.length ? invoices : bookings.filter((b) => b.invoiceNumber || b.quotedAmount).map((booking) => ({
    id: booking.id,
    bookingId: booking.id,
    invoiceNumber: booking.invoiceNumber || 'Not issued',
    clientName: booking.clientName,
    subtotal: booking.quotedAmount,
    taxAmount: 0,
    total: booking.quotedAmount,
    status: booking.paymentStatus
  }));

  return (
    <div className="admin-stack">
      <div className="admin-tabs">
        <button type="button" className={tab === 'invoices' ? 'is-active' : ''} onClick={() => setTab('invoices')}>Invoice list</button>
        <button type="button" className={tab === 'templates' ? 'is-active' : ''} onClick={() => setTab('templates')}>Templates</button>
      </div>
      {tab === 'templates' ? (
        <InvoiceTemplatesPanel templates={invoiceTemplates} selectedTemplateId={selectedTemplateId} saveTemplates={saveTemplates} setSelectedTemplateId={setSelectedTemplateId} />
      ) : (
        <section className="admin-panel admin-panel--wide">
          <div className="admin-panel__title">
            <h2>Invoices</h2>
            <button type="button" onClick={() => downloadCsv('phee-invoices.csv', invoiceCsvRows(invoices))}>Export invoice CSV</button>
          </div>
          {invoiceError && <p className="admin-alert admin-alert--error">Invoice records could not be loaded: {invoiceError}. Booking-based invoice estimates are still shown below.</p>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Invoice</th><th>Client</th><th>Booking</th><th>Status</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr></thead>
              <tbody>{invoiceRows.map((invoice) => <tr key={invoice.id}><td>{invoice.invoiceNumber}</td><td>{invoice.clientName}</td><td>{invoice.bookingId}</td><td>{invoice.status}</td><td>{currency(invoice.subtotal)}</td><td>{currency(invoice.taxAmount)}</td><td>{currency(invoice.total)}</td></tr>)}</tbody>
            </table>
            {!invoiceRows.length && <EmptyState label="No invoices yet" />}
          </div>
        </section>
      )}
    </div>
  );
}

function ReportsView({ bookings, invoices, invoiceError, onBookingSelect }) {
  const tax = taxYearSummary(bookings);
  const outstanding = bookings.filter((b) => outstandingForBooking(b) > 0);
  return (
    <div className="admin-stack">
      <section className="admin-panel admin-panel--wide">
        <div className="admin-panel__title">
          <h2>Tax Summary Table · {tax.taxYear.label}</h2>
          <div className="admin-panel__actions">
            <button type="button" onClick={() => downloadCsv('phee-bookings.csv', bookingCsvRows(bookings))}>Export bookings CSV</button>
            <button type="button" onClick={() => downloadCsv('phee-invoices.csv', invoiceCsvRows(invoices))}>Export invoice CSV</button>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Month</th><th>Bookings</th><th>Gross</th><th>Paid</th><th>Outstanding</th><th>Cancelled quoted</th></tr></thead>
            <tbody>{tax.rows.map((row) => <tr key={row.key}><td>{row.month}</td><td>{row.count}</td><td>{currency(row.gross)}</td><td>{currency(row.paid)}</td><td>{currency(row.outstanding)}</td><td>{currency(row.cancelledQuoted)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel admin-panel--wide">
        <h2>Outstanding Balances</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Client</th><th>Event</th><th>Date</th><th>Quoted</th><th>Paid</th><th>Fee rule</th><th>Outstanding</th></tr></thead>
            <tbody>{outstanding.map((booking) => <tr key={booking.id} onClick={() => onBookingSelect?.(booking.id)}><td><button type="button">{booking.clientName}</button></td><td>{booking.eventType}</td><td>{booking.eventDateLabel}</td><td>{currency(booking.quotedAmount)}</td><td>{currency(booking.amountPaid)}</td><td>{booking.status === 'cancelled' ? `${booking.cancellationFeePercent || 0}%` : 'Full fee'}</td><td>{currency(outstandingForBooking(booking))}</td></tr>)}</tbody>
          </table>
          {!outstanding.length && <EmptyState label="No outstanding balances" />}
        </div>
      </section>
      {invoiceError && <p className="admin-alert admin-alert--error">Invoice export needs Firestore permission for the `invoices` collection: {invoiceError}</p>}
      <section className="admin-panel">
        <h2>Records to keep</h2>
        <p>SARS guidance expects business records, books of account, invoices, supporting documents, and related records to be kept orderly, safe, and available for inspection. Many records generally need to be retained for five years, with longer periods possible during audits or unresolved returns.</p>
        <p className="admin-disclaimer">This dashboard helps organize records but does not replace advice from a registered tax practitioner.</p>
      </section>
    </div>
  );
}

function ClientsView({ bookings, onExplore }) {
  const clients = groupByValue(bookings, (b) => b.clientName);
  return (
    <div className="admin-stack">
      <section className="admin-focus">
        <div>
          <p className="admin-kicker">Client intelligence</p>
          <h2>Find repeat clients and high-value relationships.</h2>
          <p>Click a client to see contact details, past bookings, paid revenue, and outstanding balances.</p>
        </div>
      </section>
      <TopClients clients={clients} onSelect={(client) => onExplore('client', client.label)} />
    </div>
  );
}

function SettingsView() {
  return <AdminSettingsFoundation />;
}

export default function AdminDashboard({
  section = 'overview',
  bookings,
  invoices,
  quotations = [],
  clients = [],
  quoteServices = [],
  documentTemplates = [],
  user,
  isAllowedAdmin,
  loading,
  error,
  invoiceError,
  quotationError,
  authError,
  setAuthError
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceTemplateState = useInvoiceTemplates();
  const selectedBookingId = searchParams.get('booking');
  const quoteBookingId = searchParams.get('booking');
  const { filters, setFilters, filtered } = useFilteredBookings(bookings);
  const [insight, setInsight] = useState(null);
  const [previewInvoiceId, setPreviewInvoiceId] = useState(null);
  const selectedBooking = section === 'bookings' ? bookings.find((booking) => booking.id === selectedBookingId) : null;
  const previewInvoice = previewInvoiceId ? invoices.find((inv) => inv.id === previewInvoiceId) : null;
  const eventTypes = EVENT_TYPE_OPTIONS;
  const openInsight = (type, label) => {
    if (typeof type === 'object' && type) {
      setInsight(type);
      return;
    }
    setInsight({
      type,
      label,
      bookings: bookingsForGroup(bookings, type, label)
    });
  };
  const openBooking = (id) => {
    setInsight(null);
    router.push(`/admin/bookings?booking=${id}`);
  };
  const generateQuoteFromBooking = (id) => {
    setInsight(null);
    router.push(`/admin/quotations?booking=${id}`);
  };
  const generateInvoiceFromBooking = (id) => {
    setInsight(null);
    router.push(`/admin/invoices?booking=${id}`);
  };

  if (!user) return <LoginPanel error={authError} setError={setAuthError} />;
  if (!isAllowedAdmin) {
    return (
      <main className="admin-login">
        <section className="admin-login__panel">
          <p className="admin-kicker">Access denied</p>
          <h1>Admin account required</h1>
          <p>This signed-in Firebase user is not listed as an admin for this dashboard.</p>
          <button type="button" onClick={() => signOut(auth)}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <header className="admin-topbar">
        <Link className="admin-brand" href="/admin">PHEE Admin</Link>
        <nav>{NAV.map(([key, href, label, Icon]) => <Link key={key} className={section === key ? 'is-active' : ''} href={href}><Icon />{label}</Link>)}</nav>
        <button type="button" onClick={() => signOut(auth)}><FaSignOutAlt />Sign out</button>
      </header>
      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Business operating system</p>
            <h1>{NAV.find(([key]) => key === section)?.[2] || 'Overview'}</h1>
          </div>
          <button type="button" onClick={() => downloadCsv('phee-bookings.csv', bookingCsvRows(filtered))}>Export CSV</button>
        </header>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        {loading ? <Skeleton /> : (
          <>
            {section === 'overview' && <Overview bookings={bookings} invoices={invoices} onExplore={openInsight} />}
            {section === 'bookings' && (
              <BookingsView
                bookings={bookings}
                invoices={invoices}
                filtered={filtered}
                filters={filters}
                setFilters={setFilters}
                eventTypes={eventTypes}
                onSelect={openBooking}
                onGenerateQuote={generateQuoteFromBooking}
                onGenerateInvoice={generateInvoiceFromBooking}
              />
            )}
            {section === 'revenue' && <RevenueView bookings={bookings} invoices={invoices} onExplore={openInsight} />}
            {section === 'quotations' && (
              <AdminQuotations
                quotations={quotations}
                clients={clients}
                bookings={bookings}
                quoteServices={quoteServices}
                documentTemplates={documentTemplates}
                quotationError={quotationError}
                bookingDraftId={quoteBookingId}
              />
            )}
            {section === 'invoices' && (
              <AdminInvoices
                bookings={bookings}
                invoices={invoices}
                quotations={quotations}
                clients={clients}
                quoteServices={quoteServices}
                documentTemplates={documentTemplates}
                invoiceError={invoiceError}
                bookingDraftId={quoteBookingId}
              />
            )}
            {section === 'clients' && <AdminClientsCRM clients={clients} bookings={bookings} quotations={quotations} invoices={invoices} />}
            {section === 'reports' && <AdminReports bookings={bookings} quotations={quotations} invoices={invoices} eventTypes={eventTypes} onBookingSelect={openBooking} onInvoicePreview={setPreviewInvoiceId} />}
            {section === 'settings' && <SettingsView />}
          </>
        )}
      </section>
      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          invoices={invoices}
          invoiceTemplates={invoiceTemplateState.templates}
          selectedTemplateId={invoiceTemplateState.selectedTemplateId}
          onTemplateChange={invoiceTemplateState.setSelectedTemplateId}
          onGenerateQuote={generateQuoteFromBooking}
          onGenerateInvoice={generateInvoiceFromBooking}
          onClose={() => router.push('/admin/bookings')}
        />
      )}
      {insight && <InsightDrawer insight={insight} onClose={() => setInsight(null)} onBookingSelect={openBooking} />}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          templates={invoiceTemplateState.templates}
          selectedTemplateId={invoiceTemplateState.selectedTemplateId}
          onTemplateChange={invoiceTemplateState.setSelectedTemplateId}
          onClose={() => setPreviewInvoiceId(null)}
        />
      )}
    </main>
  );
}
