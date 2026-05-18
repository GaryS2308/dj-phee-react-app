'use client';

import { useMemo, useState } from 'react';
import { outstandingBookingRows, revenueDetailRows } from '../../../lib/adminCrm';
import { BOOKING_STATUSES } from '../../../lib/adminDataShapes';
import { downloadCsv } from '../../../lib/adminCsv';
import { money, num } from '../../../lib/adminUtils';
import { enquiryToConfirmedRate, outstandingForBooking } from '../../../lib/analytics/revenue';

export default function AdminReports({ bookings, quotations, invoices, eventTypes, onBookingSelect, onInvoicePreview }) {
  const [filters, setFilters] = useState({ eventType: '', status: '', startDate: '', endDate: '' });
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;
    return (!filters.eventType || booking.eventType === filters.eventType)
      && (!filters.status || booking.status === filters.status)
      && (!start || (booking.eventDate && booking.eventDate >= start))
      && (!end || (booking.eventDate && booking.eventDate <= end));
  }), [bookings, filters]);
  const confirmed = filteredBookings.filter((booking) => ['confirmed', 'completed', 'accepted'].includes(booking.status));
  const totalBookingValue = confirmed.reduce((sum, booking) => sum + num(booking.quotedAmount), 0);
  const outstanding = filteredBookings.reduce((sum, booking) => sum + outstandingForBooking(booking), 0);
  const depositsDue = filteredBookings.reduce((sum, booking) => sum + Math.max(num(booking.depositAmount || Math.round(num(booking.quotedAmount) * 0.5)) - num(booking.amountPaid), 0), 0);
  const pendingPipeline = filteredBookings.filter((booking) => ['pending', 'enquiry'].includes(booking.status)).reduce((sum, booking) => sum + num(booking.quotedAmount), 0);
  const outstandingRows = outstandingBookingRows(filteredBookings);
  const revenueRows = revenueDetailRows({ bookings: filteredBookings, invoices });

  // CSV strips the internal invoiceId and converts "R 10,200" strings to plain numbers
  // so spreadsheets don't misread the comma as a field delimiter.
  const currencyFields = new Set(['amount charged', 'amount paid', 'outstanding']);
  const parseMoney = (s) => Number(String(s).replace(/[^0-9.-]/g, ''));
  const revenueCsvRows = revenueRows.map(({ invoiceId, ...rest }) =>
    Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, currencyFields.has(key) ? parseMoney(value) : value])
    )
  );

  return (
    <div className="admin-stack">
      <div className="admin-filters">
        <select value={filters.eventType} onChange={(event) => update('eventType', event.target.value)}>
          <option value="">All event types</option>
          {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="">All booking statuses</option>
          {BOOKING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={(event) => update('startDate', event.target.value)} />
        <input type="date" value={filters.endDate} onChange={(event) => update('endDate', event.target.value)} />
        <button type="button" onClick={() => setFilters({ eventType: '', status: '', startDate: '', endDate: '' })}>Clear filters</button>
      </div>
      <div className="admin-metrics admin-metrics--compact">
        <Metric label="Confirmed value" value={money(totalBookingValue)} />
        <Metric label="Avg booking" value={money(confirmed.length ? totalBookingValue / confirmed.length : 0)} />
        <Metric label="Outstanding" value={money(outstanding)} />
        <Metric label="Deposits due" value={money(depositsDue)} />
        <Metric label="Conversion" value={`${Math.round(enquiryToConfirmedRate(filteredBookings) * 100)}%`} />
        <Metric label="Pending pipeline" value={money(pendingPipeline)} />
      </div>
      <ReportTable
        title="Outstanding Balances"
        rows={outstandingRows}
        onExport={() => downloadCsv('phee-outstanding-balances.csv', outstandingRows)}
      />
      <RevenueDetailTable
        rows={revenueRows}
        onExport={() => downloadCsv('phee-revenue-detail.csv', revenueCsvRows)}
        onInvoicePreview={onInvoicePreview}
      />
    </div>
  );
}

function Metric({ label, value }) {
  return <article className="admin-metric"><span>{label}</span><strong>{value}</strong></article>;
}

function ReportTable({ title, rows, onExport }) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <h2>{title}</h2>
        <button type="button" onClick={onExport}>Export CSV</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index}>{headers.map((header) => <td key={header}>{row[header]}</td>)}</tr>)}</tbody>
        </table>
        {!rows.length && <p className="admin-empty">No report rows for the selected filters.</p>}
      </div>
    </section>
  );
}

// Revenue detail table renders invoice # as a clickable button when a preview handler is available.
// The invoiceId field is used only for the click handler and is not shown as a column.
function RevenueDetailTable({ rows, onExport, onInvoicePreview }) {
  const displayHeaders = rows[0]
    ? Object.keys(rows[0]).filter((key) => key !== 'invoiceId')
    : [];

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__title">
        <h2>Revenue Detail</h2>
        <button type="button" onClick={onExport}>Export CSV</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>{displayHeaders.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {displayHeaders.map((header) => {
                  if (header === 'invoice #' && row.invoiceId && onInvoicePreview) {
                    return (
                      <td key={header}>
                        <button
                          type="button"
                          className="admin-link-btn"
                          onClick={() => onInvoicePreview(row.invoiceId)}
                        >
                          {row[header]}
                        </button>
                      </td>
                    );
                  }
                  return <td key={header}>{row[header]}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="admin-empty">No revenue records for the selected filters.</p>}
      </div>
    </section>
  );
}
