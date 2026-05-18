'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { updateBooking } from '../../../lib/firestore/bookings';
import { saveClient } from '../../../lib/firestore/clients';
import { deleteInvoice, nextInvoiceNumber, saveInvoice } from '../../../lib/firestore/invoices';
import { downloadCsv, invoiceCsvRows } from '../../../lib/adminCsv';
import { ensureBookingForInvoice } from '../../../lib/adminBookingLinks';
import {
  DEFAULT_DOCUMENT_TEMPLATE,
  STARTER_QUOTE_SERVICES,
  normalizeDocumentTemplate,
  normalizeInvoiceDoc,
  normalizeLineItem
} from '../../../lib/adminDataShapes';
import { addDays, clientKey, dateLabel, money, num, safeText, today, uid } from '../../../lib/adminUtils';

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'partial', 'overdue'];
const CATEGORIES = ['DJ Sets', 'Sound', 'Lighting', 'Other'];
const UNITS = ['hours', 'quantity', 'days', 'sets', 'items'];
const EMPTY_ITEM = {
  name: '',
  description: '',
  category: 'DJ Sets',
  unit: 'hours',
  quantity: 1,
  unitPrice: 0
};

function toInputDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function invoiceTotals(items, discount, depositPercent, amountPaid) {
  const normalized = items.map((item) => normalizeLineItem(item));
  const subtotal = normalized.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(subtotal - num(discount), 0);
  const depositDue = Math.round(total * (num(depositPercent) / 100));
  const balanceDue = Math.max(total - num(amountPaid), 0);
  return { items: normalized, subtotal, total, depositDue, balanceDue };
}

function templateText(template, key, fallback) {
  return template?.[key] === undefined || template?.[key] === null ? fallback : template[key];
}

function missingCount(document, keys) {
  return keys.filter((key) => !String(document?.[key] || '').trim()).length;
}

function customerLines(document) {
  return [
    document.company,
    document.clientEmail,
    document.clientPhone,
    document.clientAddress,
    document.clientTaxNumber,
    document.clientVatNumber ? `VAT number: ${document.clientVatNumber}` : '',
    document.clientCompanyRegistration ? `Co. Reg: ${document.clientCompanyRegistration}` : '',
    document.customerInfo
  ].filter(Boolean);
}

function FieldGroup({ title, missing = 0, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <details className="admin-document-field-group" open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary>
        <span className="admin-field-group-icon">{missing ? '+' : '✓'}</span>
        <span>{title}</span>
        <strong>{missing ? `${missing} missing` : 'Complete'}</strong>
      </summary>
      <div className="admin-field-group-body">{children}</div>
    </details>
  );
}

function draftFromBooking({ invoices, template, booking, quote }) {
  if (quote) return draftFromQuote({ invoices, template, quote });
  const issueDate = today();
  const amount = num(booking?.quotedAmount);
  return {
    id: '',
    invoiceNumber: nextInvoiceNumber(invoices, issueDate),
    status: 'draft',
    quoteNumber: booking?.quoteNumber || '',
    quotationId: '',
    bookingId: booking?.id || '',
    clientName: booking?.clientName || '',
    clientEmail: booking?.clientEmail || '',
    clientPhone: booking?.clientPhone || '',
    company: booking?.raw?.company || '',
    clientAddress: booking?.raw?.clientAddress || '',
    clientTaxNumber: booking?.raw?.clientTaxNumber || '',
    clientVatNumber: booking?.raw?.clientVatNumber || '',
    clientCompanyRegistration: booking?.raw?.clientCompanyRegistration || '',
    customerInfo: booking?.raw?.customerInfo || '',
    eventType: booking?.eventType || '',
    eventDate: toInputDate(booking?.eventDate),
    eventLocation: booking?.eventLocation || '',
    durationHours: num(booking?.duration) || '',
    issueDate,
    dueDate: addDays(7),
    terms: template?.invoiceTerms || DEFAULT_DOCUMENT_TEMPLATE.invoiceTerms,
    notes: booking?.notes || '',
    discount: 0,
    depositPercent: 50,
    amountPaid: num(booking?.amountPaid),
    items: amount
      ? [{ ...EMPTY_ITEM, id: uid(), name: booking?.eventType || 'DJ Performance', description: booking?.duration || '', quantity: 1, unitPrice: amount }]
      : []
  };
}

function draftFromQuote({ invoices, template, quote }) {
  const issueDate = today();
  return {
    id: '',
    invoiceNumber: nextInvoiceNumber(invoices, issueDate),
    status: 'draft',
    quoteNumber: quote.quoteNumber || '',
    quotationId: quote.id || '',
    bookingId: quote.bookingId || '',
    clientName: quote.clientName || quote.client?.name || '',
    clientEmail: quote.clientEmail || quote.client?.email || '',
    clientPhone: quote.clientPhone || quote.client?.phone || '',
    company: quote.company || quote.client?.company || '',
    clientAddress: quote.clientAddress || quote.client?.clientAddress || '',
    clientTaxNumber: quote.clientTaxNumber || quote.client?.clientTaxNumber || '',
    clientVatNumber: quote.clientVatNumber || quote.client?.clientVatNumber || '',
    clientCompanyRegistration: quote.clientCompanyRegistration || quote.client?.clientCompanyRegistration || '',
    customerInfo: quote.customerInfo || quote.client?.customerInfo || '',
    eventType: quote.eventType || '',
    eventDate: toInputDate(quote.eventDate),
    eventLocation: quote.eventLocation || '',
    durationHours: quote.durationHours || '',
    issueDate,
    dueDate: addDays(7),
    terms: template?.invoiceTerms || DEFAULT_DOCUMENT_TEMPLATE.invoiceTerms,
    notes: quote.notes || '',
    discount: quote.discount || 0,
    depositPercent: quote.depositPercent || 50,
    amountPaid: 0,
    items: quote.items?.length ? quote.items.map((item) => ({ ...item, id: uid() })) : []
  };
}

function blankDraft({ invoices, template }) {
  const issueDate = today();
  return {
    id: '',
    invoiceNumber: nextInvoiceNumber(invoices, issueDate),
    status: 'draft',
    quoteNumber: '',
    quotationId: '',
    bookingId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    company: '',
    clientAddress: '',
    clientTaxNumber: '',
    clientVatNumber: '',
    clientCompanyRegistration: '',
    customerInfo: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    durationHours: '',
    issueDate,
    dueDate: addDays(7),
    terms: template?.invoiceTerms || DEFAULT_DOCUMENT_TEMPLATE.invoiceTerms,
    notes: '',
    discount: 0,
    depositPercent: 50,
    amountPaid: 0,
    items: []
  };
}

function ClientPicker({ allClients, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return allClients.filter((c) =>
      [c.name, c.email, c.phone, c.company].join(' ').toLowerCase().includes(term)
    ).slice(0, 60);
  }, [allClients, search]);

  return (
    <div className="admin-client-picker">
      <input
        className="admin-client-picker__search"
        placeholder="Search saved clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="admin-client-picker__select"
        value=""
        onChange={(e) => {
          const client = allClients.find((c) => (c.clientKey || c.id) === e.target.value);
          if (client) { onSelect(client); setSearch(''); }
        }}
      >
        <option value="">— pick a client to fill fields —</option>
        {filtered.map((c) => (
          <option key={c.clientKey || c.id} value={c.clientKey || c.id}>
            {c.name}{c.company ? ` · ${c.company}` : ''}{c.email ? ` · ${c.email}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function durationHoursFromBooking(booking) {
  return num(booking?.duration) || num(String(booking?.duration || '').match(/\d+(?:\.\d+)?/)?.[0]);
}

function BookingPicker({ bookings, selectedBookingId, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return bookings
      .filter((booking) => {
        const haystack = [
          booking.clientName,
          booking.clientEmail,
          booking.eventType,
          booking.eventDateLabel,
          booking.eventLocation,
          booking.invoiceNumber,
          booking.quoteNumber
        ].join(' ').toLowerCase();
        return !term || haystack.includes(term);
      })
      .sort((a, b) => (b.eventDate?.getTime?.() || 0) - (a.eventDate?.getTime?.() || 0))
      .slice(0, 80);
  }, [bookings, search]);

  return (
    <div className="admin-booking-picker">
      <input
        className="admin-client-picker__search"
        placeholder="Search past bookings to attach..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <select
        className="admin-client-picker__select"
        value={selectedBookingId || ''}
        onChange={(event) => {
          const booking = bookings.find((item) => item.id === event.target.value);
          if (booking) {
            onSelect(booking);
            setSearch('');
          }
        }}
      >
        <option value="">-- link this invoice to a booking --</option>
        {filtered.map((booking) => (
          <option key={booking.id} value={booking.id}>
            {booking.eventDateLabel} · {booking.clientName} · {booking.eventType}{booking.invoiceNumber ? ` · ${booking.invoiceNumber}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function InvoiceEditor({ draft, setDraft, invoices, clients, bookings, quotations, services, template, onCancel, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const totals = invoiceTotals(draft.items || [], draft.discount, draft.depositPercent, draft.amountPaid);
  const allClients = useMemo(() => {
    const fromBookings = bookings.map((booking) => ({
      id: clientKey({ email: booking.clientEmail, phone: booking.clientPhone, name: booking.clientName }),
      name: booking.clientName,
      email: booking.clientEmail,
      phone: booking.clientPhone,
      company: booking.raw?.company || ''
    }));
    const map = new Map([...clients, ...fromBookings].map((c) => [c.clientKey || c.id, c]));
    return [...map.values()].filter((c) => c.name).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings, clients]);
  const serviceOptions = services.length ? services : STARTER_QUOTE_SERVICES;

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateItem = (id, key, value) => setDraft((current) => ({
    ...current,
    items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item)
  }));
  const addBlankItem = () => update('items', [...draft.items, { ...EMPTY_ITEM, id: uid() }]);
  const addServiceItem = (serviceId) => {
    const service = serviceOptions.find((item) => item.id === serviceId);
    if (!service) return;
    update('items', [
      ...draft.items,
      {
        id: uid(),
        serviceId: service.id,
        name: service.name,
        description: service.description || '',
        category: service.category || 'Other',
        unit: service.unit || 'items',
        quantity: service.defaultQty || 1,
        unitPrice: service.unitPrice || 0
      }
    ]);
  };
  const removeItem = (id) => update('items', draft.items.filter((item) => item.id !== id));
  const selectClient = (client) => setDraft((current) => ({
    ...current,
    clientName: client.name || '',
    clientEmail: client.email || '',
    clientPhone: client.phone || '',
    company: client.company || '',
    clientAddress: client.clientAddress || '',
    clientTaxNumber: client.clientTaxNumber || '',
    clientVatNumber: client.clientVatNumber || '',
    clientCompanyRegistration: client.clientCompanyRegistration || '',
    customerInfo: client.customerInfo || ''
  }));
  const selectBooking = (booking) => {
    const linkedDraft = draftFromBooking({ invoices, template, booking });
    setDraft((current) => ({
      ...current,
      bookingId: booking.id,
      quoteNumber: linkedDraft.quoteNumber,
      clientName: linkedDraft.clientName,
      clientEmail: linkedDraft.clientEmail,
      clientPhone: linkedDraft.clientPhone,
      company: linkedDraft.company,
      clientAddress: linkedDraft.clientAddress,
      clientTaxNumber: linkedDraft.clientTaxNumber,
      clientVatNumber: linkedDraft.clientVatNumber,
      clientCompanyRegistration: linkedDraft.clientCompanyRegistration,
      customerInfo: linkedDraft.customerInfo,
      eventType: linkedDraft.eventType,
      eventDate: linkedDraft.eventDate,
      eventLocation: linkedDraft.eventLocation,
      durationHours: durationHoursFromBooking(booking),
      notes: current.notes || linkedDraft.notes,
      amountPaid: current.amountPaid || linkedDraft.amountPaid,
      items: current.items?.length ? current.items : linkedDraft.items
    }));
  };
  const selectQuote = (quoteId) => {
    const quote = quotations.find((item) => item.id === quoteId);
    if (!quote) {
      update('quotationId', '');
      return;
    }
    setDraft((current) => ({
      ...current,
      ...draftFromQuote({ invoices, template, quote }),
      id: current.id,
      invoiceNumber: current.invoiceNumber,
      issueDate: current.issueDate,
      dueDate: current.dueDate,
      status: current.status
    }));
  };
  const persist = async (status) => {
    setSaving(true);
    const invoiceNumber = draft.invoiceNumber || nextInvoiceNumber(invoices, draft.issueDate);
    const bookingId = await ensureBookingForInvoice({ draft, invoiceNumber, totals, status, bookings });
    const clientId = clientKey({ email: draft.clientEmail, phone: draft.clientPhone, name: draft.clientName });
    const payload = normalizeInvoiceDoc(draft.id, {
      ...draft,
      bookingId,
      invoiceNumber,
      status,
      clientId,
      items: totals.items,
      subtotal: totals.subtotal,
      total: totals.total,
      depositDue: totals.depositDue,
      balanceDue: totals.balanceDue
    });
    const [savedInvoice] = await Promise.all([
      saveInvoice(payload),
      saveClient({
        id: clientId,
        name: draft.clientName,
        email: draft.clientEmail,
        phone: draft.clientPhone,
        company: draft.company,
        clientAddress: draft.clientAddress,
        clientTaxNumber: draft.clientTaxNumber,
        clientVatNumber: draft.clientVatNumber,
        clientCompanyRegistration: draft.clientCompanyRegistration,
        customerInfo: draft.customerInfo,
        totalQuoted: totals.total,
        totalPaid: num(draft.amountPaid)
      })
    ]);
    if (bookingId) {
      try {
        await updateBooking(bookingId, {
          quotedAmount: totals.total,
          totalAmount: totals.total,
          amountPaid: num(draft.amountPaid),
          balanceAmount: totals.balanceDue,
          invoiceNumber: payload.invoiceNumber,
          invoiceId: savedInvoice.id || payload.id
        });
      } catch (error) {
        // The invoice/client save is still valid if booking patching is blocked by rules or connectivity.
      }
    }
    setDraft((current) => ({ ...current, id: savedInvoice.id || payload.id, bookingId, invoiceNumber: payload.invoiceNumber, status }));
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
    onSaved?.(normalizeInvoiceDoc(savedInvoice.id || payload.id, { ...payload, ...savedInvoice }));
  };
  const printCurrentDraft = () => {
    printInvoice(normalizeInvoiceDoc(draft.id, {
      ...draft,
      items: totals.items,
      subtotal: totals.subtotal,
      total: totals.total,
      depositDue: totals.depositDue,
      balanceDue: totals.balanceDue
    }), activeTemplate);
  };

  const liveInvoice = normalizeInvoiceDoc(draft.id, {
    ...draft,
    items: totals.items,
    subtotal: totals.subtotal,
    total: totals.total,
    depositDue: totals.depositDue,
    balanceDue: totals.balanceDue
  });

  return (
    <section className="admin-panel admin-panel--wide admin-doc-editor">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>{draft.id ? `Edit ${draft.invoiceNumber}` : 'New Invoice'}</h2>
          <p>Fill in the details on the left — the preview updates live on the right.</p>
        </div>
        <div className="admin-panel__actions">
          {saved && <span className="admin-saved">Saved ✓</span>}
          <button type="button" onClick={() => persist('draft')} disabled={saving}>Save draft</button>
          <button type="button" onClick={() => persist('sent')} disabled={saving}>Save &amp; mark sent</button>
          <button type="button" onClick={() => persist('paid')} disabled={saving}>Mark paid</button>
          <button type="button" onClick={printCurrentDraft}>Print PDF</button>
          <button type="button" onClick={onCancel}>Close</button>
        </div>
      </div>

      <div className="admin-doc-editor__body">
        <div className="admin-doc-editor__form">
          <FieldGroup title="Start here" defaultOpen missing={missingCount(draft, ['clientName', 'eventDate'])}>
            <p className="admin-field-group-help">Choose the source quote, booking, or saved client first. If no booking is linked, saving the invoice will attach or create one from the event information.</p>
            {allClients.length > 0 && (
              <ClientPicker allClients={allClients} onSelect={selectClient} />
            )}
            {bookings.length > 0 && (
              <BookingPicker bookings={bookings} selectedBookingId={draft.bookingId} onSelect={selectBooking} />
            )}
            <label className="admin-linked-select">From quote
              <select value={draft.quotationId || ''} onChange={(event) => selectQuote(event.target.value)}>
                <option value="">None</option>
                {quotations.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.eventType || 'Event'} · {dateLabel(quote.eventDate)} · {quote.clientName} · {quote.quoteNumber}
                  </option>
                ))}
              </select>
            </label>
          </FieldGroup>

          <FieldGroup title="Billed to" missing={missingCount(draft, ['clientName', 'clientEmail'])}>
            <div className="admin-quote-form">
              <label>Client name<input value={draft.clientName} onChange={(event) => update('clientName', event.target.value)} required /></label>
              <label>Client email<input type="email" value={draft.clientEmail} onChange={(event) => update('clientEmail', event.target.value)} /></label>
              <label>Client phone<input value={draft.clientPhone} onChange={(event) => update('clientPhone', event.target.value)} /></label>
              <label>Company<input value={draft.company} onChange={(event) => update('company', event.target.value)} /></label>
              <label>VAT number<input value={draft.clientVatNumber || ''} onChange={(event) => update('clientVatNumber', event.target.value)} /></label>
              <label>Co. reg. number<input value={draft.clientCompanyRegistration || ''} onChange={(event) => update('clientCompanyRegistration', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Client address<textarea value={draft.clientAddress || ''} onChange={(event) => update('clientAddress', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Additional billed-to information<textarea value={draft.customerInfo || ''} onChange={(event) => update('customerInfo', event.target.value)} /></label>
            </div>
          </FieldGroup>

          <FieldGroup title="Event details" missing={missingCount(draft, ['eventType', 'eventDate', 'eventLocation'])}>
            <div className="admin-quote-form">
              <label>Event type<input value={draft.eventType} onChange={(event) => update('eventType', event.target.value)} /></label>
              <label>Event date<input type="date" value={draft.eventDate} onChange={(event) => update('eventDate', event.target.value)} /></label>
              <label>Location<input value={draft.eventLocation} onChange={(event) => update('eventLocation', event.target.value)} /></label>
              <label>Duration (hrs)<input type="number" min="0" step="0.5" value={draft.durationHours} onChange={(event) => update('durationHours', event.target.value)} /></label>
            </div>
          </FieldGroup>

          <FieldGroup title="Invoice details" missing={missingCount(draft, ['invoiceNumber', 'issueDate', 'dueDate'])}>
            <div className="admin-quote-form">
              <label>Status
                <select value={draft.status} onChange={(event) => update('status', event.target.value)}>
                  {INVOICE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label>Issue date<input type="date" value={draft.issueDate} onChange={(event) => update('issueDate', event.target.value)} /></label>
              <label>Due date<input type="date" value={draft.dueDate} onChange={(event) => update('dueDate', event.target.value)} /></label>
              <label>Discount (R)<input type="number" min="0" step="1" value={draft.discount} onChange={(event) => update('discount', event.target.value)} /></label>
              <label>Deposit %<input type="number" min="0" max="100" value={draft.depositPercent} onChange={(event) => update('depositPercent', event.target.value)} /></label>
              <label>Amount paid (R)<input type="number" min="0" step="1" value={draft.amountPaid} onChange={(event) => update('amountPaid', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Notes<textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Terms<textarea value={draft.terms} onChange={(event) => update('terms', event.target.value)} placeholder={activeTemplate?.invoiceTerms} /></label>
            </div>
          </FieldGroup>

          <FieldGroup title="Invoice services" missing={draft.items?.length ? 0 : 1}>
            <div className="admin-line-items">
            <div className="admin-panel__title">
              <div />
              <div className="admin-panel__actions">
                <button type="button" onClick={addBlankItem}>Add blank line</button>
              </div>
            </div>
            <div className="admin-service-buttons">
              {serviceOptions.map((service) => (
                <button type="button" key={service.id} onClick={() => addServiceItem(service.id)}>
                  Add {service.name}
                  <small>{money(service.unitPrice)}/{service.unit}</small>
                </button>
              ))}
            </div>
            {draft.items.map((item) => {
              const lineTotal = num(item.quantity) * num(item.unitPrice);
              return (
                <div className="admin-line-item" key={item.id}>
                  <input aria-label="Item name" placeholder="Name" value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} />
                  <input aria-label="Description" placeholder="Description" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} />
                  <select aria-label="Category" value={item.category} onChange={(event) => updateItem(item.id, 'category', event.target.value)}>
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <select aria-label="Unit" value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value)}>
                    {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <input aria-label="Quantity" type="number" min="0" step="0.5" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} />
                  <input aria-label="Unit price" type="number" min="0" step="1" value={item.unitPrice} onChange={(event) => updateItem(item.id, 'unitPrice', event.target.value)} />
                  <strong>{money(lineTotal)}</strong>
                  <button type="button" className="admin-danger-btn" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              );
            })}
            </div>
          </FieldGroup>

          <div className="admin-quote-totals">
            <span>Subtotal <strong>{money(totals.subtotal)}</strong></span>
            <span>Discount <strong>-{money(draft.discount)}</strong></span>
            <span>Deposit due <strong>{money(totals.depositDue)}</strong></span>
            <span>Total <strong>{money(totals.total)}</strong></span>
            <span>Balance due <strong>{money(totals.balanceDue)}</strong></span>
          </div>
        </div>

        <div className="admin-doc-editor__preview">
          <div className="admin-doc-preview-label">Live preview</div>
          <InvoicePreview invoice={liveInvoice} template={activeTemplate} />
        </div>
      </div>
    </section>
  );
}

export function InvoicePreview({ invoice, template }) {
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const style = documentStyle(activeTemplate);
  return (
    <article className="admin-document-preview" style={style}>
      {/* Header */}
      <section className="admin-document-preview__top">
        <div className="admin-document-preview__top-left">
          <div className="admin-document-preview__logo">
            {activeTemplate.logoUrl ? <img src={activeTemplate.logoUrl} alt="" /> : activeTemplate.businessName.slice(0, 1)}
          </div>
          <div>
            <span className="admin-document-preview__kicker">{templateText(activeTemplate, 'documentEyebrow', 'Performance Agreement')}</span>
            <h2>{activeTemplate.businessName}</h2>
            <p>{activeTemplate.roleTitle}</p>
          </div>
        </div>
        <div className="admin-document-preview__top-right">
          <h3>{templateText(activeTemplate, 'invoiceTitle', 'Invoice')}</h3>
          <p>{invoice.invoiceNumber || 'Draft'}<br />{templateText(activeTemplate, 'issuedLabel', 'Issued')} {dateLabel(invoice.issueDate)}<br />{templateText(activeTemplate, 'dueLabel', 'Due')} {dateLabel(invoice.dueDate)}{invoice.quoteNumber ? <><br />{templateText(activeTemplate, 'quoteReferenceLabel', 'Quote')}: {invoice.quoteNumber}</> : null}</p>
        </div>
      </section>

      {/* Client / Event panels */}
      <section className="admin-document-preview__split">
        <div>
          <span>{templateText(activeTemplate, 'clientSectionTitle', 'Billed to')}</span>
          <p><strong>{invoice.clientName || 'Client name'}</strong>{customerLines(invoice).map((line, index) => <span key={`${line}-${index}`}><br />{line}</span>)}</p>
        </div>
        <div>
          <span>{templateText(activeTemplate, 'eventSectionTitle', 'Event')}</span>
          <p><strong>{invoice.eventType || '—'}</strong><br />{dateLabel(invoice.eventDate)}<br />{invoice.eventLocation}{invoice.durationHours ? <><br />{invoice.durationHours} hours</> : null}</p>
        </div>
      </section>

      {/* Services table */}
      <div className="admin-document-preview__services-label">{templateText(activeTemplate, 'servicesSectionTitle', 'Services')}</div>
      <table className="admin-document-preview__table">
        <thead>
          <tr><th style={{textAlign:'left'}}>{templateText(activeTemplate, 'serviceColumnLabel', 'Service')}</th><th>{templateText(activeTemplate, 'unitColumnLabel', 'Units')}</th><th>{templateText(activeTemplate, 'rateColumnLabel', 'Rate')}</th><th>{templateText(activeTemplate, 'amountColumnLabel', 'Total')}</th></tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong>{item.description ? <small>{item.description}</small> : null}</td>
              <td>{item.quantity} {item.unit}</td>
              <td>{money(item.unitPrice)}</td>
              <td>{money(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <section className="admin-document-preview__totals">
        <p><span>{templateText(activeTemplate, 'subtotalLabel', 'Subtotal')}</span><strong>{money(invoice.subtotal)}</strong></p>
        {num(invoice.discount) > 0 && <p><span>{templateText(activeTemplate, 'discountLabel', 'Discount')}</span><strong>-{money(invoice.discount)}</strong></p>}
        {invoice.depositDue > 0 && <p><span>{templateText(activeTemplate, 'depositDueLabel', 'Deposit due')}</span><strong>{money(invoice.depositDue)}</strong></p>}
        <p className="admin-document-preview__grand-total"><span>{templateText(activeTemplate, 'invoiceTotalLabel', 'Total')}</span><strong>{money(invoice.total)}</strong></p>
        <p><span>{templateText(activeTemplate, 'balanceDueLabel', 'Balance due')}</span><strong>{money(invoice.balanceDue)}</strong></p>
      </section>

      {/* Bank / Terms */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'14px'}}>
        {(activeTemplate.bankName || activeTemplate.accountNumber) && (
          <section className="admin-document-preview__terms">
            <span>{templateText(activeTemplate, 'bankDetailsSectionTitle', 'Bank Details')}</span>
            <p>{activeTemplate.bankName}<br />{activeTemplate.accountHolder}<br />{activeTemplate.accountNumber}<br />{activeTemplate.branchCode}{activeTemplate.bicSwiftCode ? <><br />{activeTemplate.bicSwiftCode}</> : null}</p>
          </section>
        )}
        <section className="admin-document-preview__terms">
          <span>{templateText(activeTemplate, 'termsSectionTitle', 'Terms')}</span>
          <p>{invoice.terms || activeTemplate.invoiceTerms}</p>
        </section>
      </div>

      {/* Footer bar */}
      <footer className="admin-document-preview__footer">
        <span>{activeTemplate.businessName}</span>
        <span>{templateText(activeTemplate, 'footerNote', 'Prepared with availability subject to confirmation.')}</span>
      </footer>
    </article>
  );
}

function documentStyle(template) {
  return {
    '--doc-accent': template.accentColor,
    '--doc-bg': template.documentBackground,
    '--doc-header-bg': template.headerBackground,
    '--doc-header-text': template.headerTextColor,
    '--doc-body-text': template.bodyTextColor,
    '--doc-label': template.labelColor,
    '--doc-panel-bg': template.panelBackground,
    '--doc-panel-border': template.panelBorderColor,
    '--doc-table-header-bg': template.tableHeaderBackground,
    '--doc-table-header-text': template.tableHeaderTextColor,
    '--doc-totals-bg': template.totalsBackground,
    '--doc-totals-text': template.totalsTextColor
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function customerHtml(document) {
  return `<strong>${escapeHtml(document.clientName)}</strong>${customerLines(document).map((line) => `<br />${escapeHtml(line)}`).join('')}`;
}

export function buildInvoicePrintHtml(invoice, template) {
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const items = invoice.items || [];
  const unitLabel = (item) => `${escapeHtml(String(item.quantity))} ${escapeHtml(item.unit)}`;
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(invoice.invoiceNumber)}</title><style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { width: 210mm; min-height: 297mm; margin: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: ${escapeHtml(activeTemplate.documentBackground)}; color: ${escapeHtml(activeTemplate.bodyTextColor)}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    main { width: 210mm; min-height: 297mm; background: ${escapeHtml(activeTemplate.documentBackground)}; display: flex; flex-direction: column; padding: 5mm 5mm 8mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1,h2,h3,p { margin: 0; }

    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; background: ${escapeHtml(activeTemplate.headerBackground)}; color: ${escapeHtml(activeTemplate.headerTextColor)}; padding: 22px 22px 20px; }
    .top-left { display: flex; align-items: flex-start; gap: 14px; }
    .logo { width: 64px; height: 64px; border-radius: 3px; overflow: hidden; flex-shrink: 0; background: ${escapeHtml(activeTemplate.accentColor)}; color: #fff; display: grid; place-items: center; font-size: 22px; font-weight: 800; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    .top-kicker { font-size: 8px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: ${escapeHtml(activeTemplate.labelColor)}; margin-bottom: 4px; }
    .top-name h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: ${escapeHtml(activeTemplate.headerTextColor)}; line-height: 1.1; }
    .top-name p { font-size: 11px; color: #c8c1b6; margin-top: 3px; }
    .top-right { text-align: right; }
    .top-right h2 { font-size: 36px; font-weight: 300; text-transform: uppercase; letter-spacing: .03em; color: ${escapeHtml(activeTemplate.headerTextColor)}; line-height: 1; }
    .top-right-meta { font-size: 11px; color: #c8c1b6; margin-top: 6px; line-height: 1.6; }

    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0 0; }
    .meta-panel { border: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; background: ${escapeHtml(activeTemplate.panelBackground)}; padding: 12px 14px; }
    .label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .2em; color: ${escapeHtml(activeTemplate.labelColor)}; margin-bottom: 6px; }
    .meta-panel p { font-size: 12px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; }

    .services-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .2em; color: ${escapeHtml(activeTemplate.labelColor)}; margin: 16px 0 6px; }
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    colgroup .col-units, colgroup .col-rate, colgroup .col-total { width: 90px; }
    th { background: ${escapeHtml(activeTemplate.tableHeaderBackground)}; color: ${escapeHtml(activeTemplate.tableHeaderTextColor)}; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; padding: 9px 10px; text-align: left; }
    th:not(:first-child), td:not(:first-child) { text-align: right; }
    td { border-bottom: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; padding: 10px 10px; vertical-align: top; font-size: 12px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; }
    .td-name { font-weight: 700; font-size: 13px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; }
    .td-desc { font-size: 10px; color: #888; margin-top: 2px; }

    .totals-row { display: flex; justify-content: flex-end; margin-top: 12px; }
    .totals-box { width: 240px; background: ${escapeHtml(activeTemplate.totalsBackground)}; color: ${escapeHtml(activeTemplate.totalsTextColor)}; padding: 14px 16px; display: grid; gap: 6px; }
    .totals-line { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; color: ${escapeHtml(activeTemplate.totalsTextColor)}; }
    .totals-line span, .totals-line strong { color: ${escapeHtml(activeTemplate.totalsTextColor)}; }
    .grand { font-size: 15px; font-weight: 800; border-top: 1px solid rgba(255,255,255,.18); padding-top: 8px; margin-top: 4px; }

    .notes-terms { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .section-block { border-top: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; padding-top: 14px; }
    .section-block p { font-size: 11px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; margin-top: 5px; }

    .footer { margin-top: 20px; padding-top: 12px; padding-bottom: 8px; border-top: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; display: flex; justify-content: space-between; align-items: center; }
    .footer span { font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: .18em; color: ${escapeHtml(activeTemplate.labelColor)}; }
  </style></head><body><main>

    <div class="top">
      <div class="top-left">
        <div class="logo">${activeTemplate.logoUrl ? `<img src="${escapeHtml(activeTemplate.logoUrl)}" alt="" />` : escapeHtml(activeTemplate.businessName.slice(0, 1))}</div>
        <div class="top-name">
          <p class="top-kicker">${escapeHtml(templateText(activeTemplate, 'documentEyebrow', 'Performance Agreement'))}</p>
          <h1>${escapeHtml(activeTemplate.businessName)}</h1>
          <p>${escapeHtml(activeTemplate.roleTitle)}</p>
        </div>
      </div>
      <div class="top-right">
        <h2>${escapeHtml(templateText(activeTemplate, 'invoiceTitle', 'Invoice'))}</h2>
        <p class="top-right-meta">${escapeHtml(invoice.invoiceNumber)}<br />${escapeHtml(templateText(activeTemplate, 'issuedLabel', 'Issued'))} ${escapeHtml(dateLabel(invoice.issueDate))}<br />${escapeHtml(templateText(activeTemplate, 'dueLabel', 'Due'))} ${escapeHtml(dateLabel(invoice.dueDate))}${invoice.quoteNumber ? `<br />${escapeHtml(templateText(activeTemplate, 'quoteReferenceLabel', 'Quote'))}: ${escapeHtml(invoice.quoteNumber)}` : ''}</p>
      </div>
    </div>

    <div class="meta">
      <div class="meta-panel">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'clientSectionTitle', 'Billed to'))}</p>
        <p>${customerHtml(invoice)}</p>
      </div>
      <div class="meta-panel">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'eventSectionTitle', 'Event'))}</p>
        <p><strong>${escapeHtml(invoice.eventType)}</strong><br />${escapeHtml(dateLabel(invoice.eventDate))}<br />${escapeHtml(invoice.eventLocation)}${invoice.durationHours ? `<br />${escapeHtml(String(invoice.durationHours))} hours` : ''}</p>
      </div>
    </div>

    <p class="services-label">${escapeHtml(templateText(activeTemplate, 'servicesSectionTitle', 'Services'))}</p>
    <table>
      <colgroup><col /><col class="col-units" /><col class="col-rate" /><col class="col-total" /></colgroup>
      <thead><tr><th>${escapeHtml(templateText(activeTemplate, 'serviceColumnLabel', 'Service'))}</th><th>${escapeHtml(templateText(activeTemplate, 'unitColumnLabel', 'Units'))}</th><th>${escapeHtml(templateText(activeTemplate, 'rateColumnLabel', 'Rate'))}</th><th>${escapeHtml(templateText(activeTemplate, 'amountColumnLabel', 'Total'))}</th></tr></thead>
      <tbody>${items.map((item) => `<tr>
        <td><div class="td-name">${escapeHtml(item.name)}</div>${item.description ? `<div class="td-desc">${escapeHtml(item.description)}</div>` : ''}</td>
        <td>${unitLabel(item)}</td>
        <td>${escapeHtml(money(item.unitPrice))}</td>
        <td>${escapeHtml(money(item.total))}</td>
      </tr>`).join('')}</tbody>
    </table>

    <div class="totals-row">
      <div class="totals-box">
        <div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'subtotalLabel', 'Subtotal'))}</span><strong>${escapeHtml(money(invoice.subtotal))}</strong></div>
        ${num(invoice.discount) > 0 ? `<div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'discountLabel', 'Discount'))}</span><strong>-${escapeHtml(money(invoice.discount))}</strong></div>` : ''}
        ${invoice.depositDue ? `<div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'depositDueLabel', 'Deposit due'))}</span><strong>${escapeHtml(money(invoice.depositDue))}</strong></div>` : ''}
        <div class="totals-line grand"><span>${escapeHtml(templateText(activeTemplate, 'invoiceTotalLabel', 'Total'))}</span><strong>${escapeHtml(money(invoice.total))}</strong></div>
        <div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'balanceDueLabel', 'Balance due'))}</span><strong>${escapeHtml(money(invoice.balanceDue))}</strong></div>
      </div>
    </div>

    <div class="notes-terms">
      <div class="section-block">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'termsSectionTitle', 'Terms'))}</p>
        <p>${escapeHtml(invoice.terms || activeTemplate.invoiceTerms)}</p>
      </div>
      ${(activeTemplate.bankName || activeTemplate.accountNumber) ? `<div class="section-block"><p class="label">${escapeHtml(templateText(activeTemplate, 'bankDetailsSectionTitle', 'Bank Details'))}</p><p>${escapeHtml(activeTemplate.bankName)}<br />${escapeHtml(activeTemplate.accountHolder)}<br />${escapeHtml(activeTemplate.accountNumber)}<br />${escapeHtml(activeTemplate.branchCode)}${activeTemplate.bicSwiftCode ? `<br />${escapeHtml(activeTemplate.bicSwiftCode)}` : ''}</p></div>` : ''}
    </div>

    <div class="footer">
      <span>${escapeHtml(activeTemplate.businessName)}</span>
      <span>${escapeHtml(templateText(activeTemplate, 'footerNote', 'Prepared with availability subject to confirmation.'))}</span>
    </div>

  </main></body></html>`;
}

export function printInvoice(invoice, template) {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const printWindow = frame.contentWindow;
  if (!printWindow) {
    frame.remove();
    return;
  }

  frame.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => frame.remove(), 1000);
    }, 300);
  };

  const printDocument = printWindow.document;
  printDocument.open();
  printDocument.write(buildInvoicePrintHtml(invoice, template));
  printDocument.close();
}

export default function AdminInvoices({ invoices, quotations, clients, bookings, quoteServices, documentTemplates, invoiceError, bookingDraftId }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('issue-desc');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [localInvoices, setLocalInvoices] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const openedBookingRef = useRef('');
  const template = documentTemplates.find((item) => item.isDefault) || documentTemplates[0] || DEFAULT_DOCUMENT_TEMPLATE;
  const allInvoices = useMemo(() => {
    const map = new Map([...invoices, ...localInvoices].map((invoice) => [invoice.id, normalizeInvoiceDoc(invoice.id, invoice)]));
    return [...map.values()].filter((invoice) => !deletedIds.includes(invoice.id));
  }, [deletedIds, invoices, localInvoices]);

  useEffect(() => {
    if (!bookingDraftId || openedBookingRef.current === bookingDraftId) return;
    const booking = bookings.find((item) => item.id === bookingDraftId);
    if (booking) {
      openedBookingRef.current = bookingDraftId;
      const linkedQuote = quotations.find((quote) => quote.bookingId === booking.id || quote.quoteNumber === booking.quoteNumber);
      setEditingInvoice(draftFromBooking({ invoices: allInvoices, template, booking, quote: linkedQuote }));
    }
  }, [allInvoices, bookingDraftId, bookings, quotations, template]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const rows = allInvoices.filter((invoice) => {
      const haystack = [invoice.invoiceNumber, invoice.clientName, invoice.clientEmail, invoice.eventType, invoice.quoteNumber].join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
    const getDate = (value) => new Date(value || 0).getTime() || 0;
    const sorters = {
      'issue-desc': (a, b) => getDate(b.issueDate) - getDate(a.issueDate),
      'due-date': (a, b) => getDate(a.dueDate) - getDate(b.dueDate),
      'event-date': (a, b) => getDate(a.eventDate) - getDate(b.eventDate),
      client: (a, b) => safeText(a.clientName).localeCompare(safeText(b.clientName)),
      total: (a, b) => b.total - a.total,
      status: (a, b) => safeText(a.status).localeCompare(safeText(b.status))
    };
    return [...rows].sort(sorters[sortBy] || sorters['issue-desc']);
  }, [allInvoices, search, sortBy]);

  const editInvoice = (invoice) => setEditingInvoice({
    ...invoice,
    issueDate: toInputDate(invoice.issueDate),
    dueDate: toInputDate(invoice.dueDate),
    eventDate: toInputDate(invoice.eventDate),
    items: invoice.items || []
  });
  const removeInvoice = async (invoice) => {
    if (!window.confirm('Are you sure you want to delete this? This cannot be undone.')) return;
    setDeletedIds((current) => [...new Set([...current, invoice.id])]);
    setLocalInvoices((current) => current.filter((item) => item.id !== invoice.id));
    await deleteInvoice(invoice.id);
    if (editingInvoice?.id === invoice.id) setEditingInvoice(null);
  };
  const handleSaved = (invoice) => {
    setLocalInvoices((current) => [invoice, ...current.filter((item) => item.id !== invoice.id)]);
  };
  const changeInvoiceStatus = async (event, invoice) => {
    event.stopPropagation();
    const status = event.target.value;
    const amountPaid = status === 'paid' ? invoice.total : status === 'draft' || status === 'sent' ? invoice.amountPaid : invoice.amountPaid;
    const paymentStatus = status === 'paid' ? 'paid' : status === 'partial' ? 'partial' : status === 'overdue' ? 'overdue' : invoice.paymentStatus;
    const nextInvoice = normalizeInvoiceDoc(invoice.id, {
      ...invoice,
      status,
      paymentStatus,
      amountPaid,
      balanceDue: status === 'paid' ? 0 : Math.max(invoice.total - amountPaid, 0)
    });
    setLocalInvoices((current) => [nextInvoice, ...current.filter((item) => item.id !== invoice.id)]);
    const saved = await saveInvoice(nextInvoice);
    setLocalInvoices((current) => [normalizeInvoiceDoc(saved.id || nextInvoice.id, { ...nextInvoice, ...saved }), ...current.filter((item) => item.id !== invoice.id)]);
    const linkedBooking = bookings.find((booking) => booking.id === invoice.bookingId || (invoice.invoiceNumber && booking.invoiceNumber === invoice.invoiceNumber));
    if (linkedBooking) {
      const bookingPatch = {
        quotedAmount: nextInvoice.total,
        totalAmount: nextInvoice.total,
        amountPaid: nextInvoice.amountPaid,
        balanceAmount: nextInvoice.balanceDue,
        paymentStatus: nextInvoice.paymentStatus,
        invoiceNumber: nextInvoice.invoiceNumber,
        invoiceId: nextInvoice.id
      };
      if (status === 'paid') bookingPatch.status = 'accepted';
      await updateBooking(linkedBooking.id, bookingPatch);
    }
  };

  return (
    <div className="admin-stack">
      {editingInvoice && (
        <InvoiceEditor
          draft={editingInvoice}
          setDraft={setEditingInvoice}
          invoices={allInvoices}
          clients={clients}
          bookings={bookings}
          quotations={quotations}
          services={quoteServices}
          template={template}
          onCancel={() => setEditingInvoice(null)}
          onSaved={handleSaved}
        />
      )}
      <section className="admin-panel admin-panel--wide">
        <div className="admin-panel__title">
          <div className="admin-panel__intro">
            <h2>Invoices</h2>
            <p>Create, edit, print, and export client invoices.</p>
          </div>
          <div className="admin-panel__actions">
            <button type="button" onClick={() => downloadCsv('phee-invoices.csv', invoiceCsvRows(filtered))}>Export CSV</button>
            <button type="button" onClick={() => setEditingInvoice(blankDraft({ invoices: allInvoices, template }))}>New Invoice</button>
          </div>
        </div>
        {invoiceError && <p className="admin-alert admin-alert--warning">Invoice records are using local fallback where available: {invoiceError}</p>}
        <div className="admin-filters admin-filters--compact">
          <input placeholder="Search invoice, client, event, quote" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="issue-desc">Issue date</option>
            <option value="due-date">Due date</option>
            <option value="event-date">Event date</option>
            <option value="client">Client name</option>
            <option value="total">Total</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Invoice</th><th>Client</th><th>Event</th><th>Date</th><th>Location</th><th>Quote</th><th>Due</th><th>Status</th><th>Total</th><th>Balance</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} onClick={() => editInvoice(invoice)}>
                  <td>{invoice.invoiceNumber}</td>
                  <td><button type="button" onClick={() => editInvoice(invoice)}>{invoice.clientName}</button><small>{invoice.clientEmail}</small></td>
                  <td>{invoice.eventType}</td>
                  <td>{dateLabel(invoice.eventDate)}</td>
                  <td>{invoice.eventLocation}</td>
                  <td>{invoice.quoteNumber}</td>
                  <td>{dateLabel(invoice.dueDate)}</td>
                  <td>
                    <select className={`admin-status-select admin-pill--${invoice.status}`} value={invoice.status} onClick={(event) => event.stopPropagation()} onChange={(event) => changeInvoiceStatus(event, invoice)}>
                      {INVOICE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{money(invoice.total)}</td>
                  <td>{money(invoice.balanceDue)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" onClick={(event) => { event.stopPropagation(); editInvoice(invoice); }}>View/Edit</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); printInvoice(invoice, template); }}>Print</button>
                      <button type="button" className="admin-danger-btn" onClick={(event) => { event.stopPropagation(); removeInvoice(invoice); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="admin-empty">No invoices yet. Click ‘New Invoice’ to create your first one.</p>}
        </div>
      </section>
    </div>
  );
}
