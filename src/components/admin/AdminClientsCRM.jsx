'use client';

import { useMemo, useState } from 'react';
import { aggregateClients, clientCsvRows } from '../../../lib/adminCrm';
import { downloadCsv } from '../../../lib/adminCsv';
import { money } from '../../../lib/adminUtils';

export default function AdminClientsCRM({ clients, bookings, quotations, invoices }) {
  const [selectedId, setSelectedId] = useState('');
  const rows = useMemo(() => aggregateClients({ clients, bookings, quotations, invoices }), [clients, bookings, quotations, invoices]);
  const selected = rows.find((client) => client.id === selectedId);

  return (
    <div className="admin-stack">
      <section className="admin-panel admin-panel--wide">
        <div className="admin-panel__title">
          <div className="admin-panel__intro">
            <h2>Client CRM</h2>
            <p>Clients combined from saved CRM records, bookings, quotations, and invoices.</p>
          </div>
          <button type="button" onClick={() => downloadCsv('phee-clients.csv', clientCsvRows(rows))}>Export client CSV</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-client-table">
            <thead><tr><th>Client</th><th>Interaction summary</th><th>Last interaction</th><th>Outstanding</th></tr></thead>
            <tbody>
              {rows.map((client) => (
                <tr key={client.id} onClick={() => setSelectedId(client.id)}>
                  <td>
                    <button type="button">{client.name}</button>
                    <small>{client.company || client.email || client.phone || 'Contact details needed'}</small>
                  </td>
                  <td>{client.summary}</td>
                  <td>{client.lastInteraction}</td>
                  <td>{money(client.outstandingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="admin-empty">No clients yet. Clients appear after bookings, quotes, or invoices are saved.</p>}
        </div>
      </section>
      {selected && (
        <aside className="admin-detail" aria-label="Client detail">
          <div className="admin-detail__head">
            <div>
              <p className="admin-kicker">Client detail</p>
              <h2>{selected.name}</h2>
            </div>
            <button type="button" onClick={() => setSelectedId('')}>Close</button>
          </div>
          <dl className="admin-detail__grid">
            <div><dt>Company</dt><dd>{selected.company || 'N/A'}</dd></div>
            <div><dt>Email</dt><dd>{selected.email || 'N/A'}</dd></div>
            <div><dt>Phone</dt><dd>{selected.phone || 'N/A'}</dd></div>
            <div><dt>Interaction summary</dt><dd>{selected.summary}</dd></div>
            <div><dt>Last interaction</dt><dd>{selected.lastInteraction}</dd></div>
            <div><dt>Bookings</dt><dd>{selected.bookings.length}</dd></div>
            <div><dt>Invoiced</dt><dd>{money(selected.invoicedTotal)}</dd></div>
            <div><dt>Paid</dt><dd>{money(selected.paidTotal)}</dd></div>
            <div><dt>Outstanding</dt><dd>{money(selected.outstandingBalance)}</dd></div>
          </dl>
          <section className="admin-client-contact-card">
            <h3>Contact details</h3>
            <div>
              <span>Email</span>
              <p>{selected.emails?.length ? selected.emails.join(', ') : 'N/A'}</p>
            </div>
            <div>
              <span>Phone</span>
              <p>{selected.phones?.length ? selected.phones.join(', ') : 'N/A'}</p>
            </div>
            <div>
              <span>Companies</span>
              <p>{selected.companies?.length ? selected.companies.join(', ') : selected.company || 'N/A'}</p>
            </div>
          </section>
          <ClientTable title="Booking history" rows={selected.bookings} columns={['eventType', 'eventDateLabel', 'status', 'quotedAmount']} />
          <ClientTable title="Related quotes" rows={selected.quotations} columns={['quoteNumber', 'eventType', 'status', 'total']} />
          <ClientTable title="Related invoices" rows={selected.invoices} columns={['invoiceNumber', 'eventType', 'status', 'balanceDue']} />
        </aside>
      )}
    </div>
  );
}

function ClientTable({ title, rows, columns }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.invoiceNumber || row.quoteNumber}>
                {columns.map((column) => (
                  <td key={column}>{typeof row[column] === 'number' ? money(row[column]) : row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="admin-empty">No records yet.</p>}
      </div>
    </>
  );
}
