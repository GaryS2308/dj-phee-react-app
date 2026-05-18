'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { updateBooking } from '../../../lib/firestore/bookings';
import { saveClient } from '../../../lib/firestore/clients';
import { deleteQuotation, nextQuotationNumber, saveQuotation } from '../../../lib/firestore/quotations';
import { quotationCsvRows, downloadCsv } from '../../../lib/adminCsv';
import { ensureBookingForQuotation } from '../../../lib/adminBookingLinks';
import {
  DEFAULT_DOCUMENT_TEMPLATE,
  STARTER_QUOTE_SERVICES,
  normalizeDocumentTemplate,
  normalizeLineItem,
  normalizeQuotation
} from '../../../lib/adminDataShapes';
import { addDays, clientKey, dateLabel, money, num, safeText, today, uid } from '../../../lib/adminUtils';

const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired'];
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

function quoteDraft({ quotations, template, booking }) {
  const issueDate = today();
  const amount = num(booking?.quotedAmount);
  return {
    id: '',
    quoteNumber: nextQuotationNumber(quotations, issueDate),
    status: 'draft',
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
    validUntil: addDays(14),
    notes: booking?.notes || '',
    terms: template?.quotationTerms || DEFAULT_DOCUMENT_TEMPLATE.quotationTerms,
    depositPercent: 50,
    items: amount
      ? [{ ...EMPTY_ITEM, id: uid(), name: booking?.eventType || 'DJ Performance', description: booking?.duration || '', quantity: 1, unitPrice: amount }]
      : []
  };
}

function quoteTotals(items, depositPercent) {
  const normalized = items.map((item) => normalizeLineItem(item));
  const subtotal = normalized.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;
  const depositDue = Math.round(total * (num(depositPercent) / 100));
  return { items: normalized, subtotal, total, depositDue };
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
          booking.quoteNumber
        ].join(' ').toLowerCase();
        return !term || haystack.includes(term);
      })
      .sort((a, b) => (b.eventDate?.getTime?.() || 0) - (a.eventDate?.getTime?.() || 0))
      .slice(0, 80);
  }, [bookings, search]);

  return (
    <div className="admin-booking-picker">
      <label className="admin-linked-select">From booking
        <select
          value={selectedBookingId || ''}
          onChange={(event) => {
            const booking = bookings.find((item) => item.id === event.target.value);
            if (booking) onSelect(booking);
          }}
        >
          <option value="">Manual quote - create booking on save</option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.eventDateLabel} · {booking.clientName} · {booking.eventType}{booking.quoteNumber ? ` · ${booking.quoteNumber}` : ''}
            </option>
          ))}
        </select>
      </label>
      <input
        className="admin-client-picker__search"
        placeholder="Search past bookings to attach…"
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
        <option value="">— link this quote to a booking —</option>
        {filtered.map((booking) => (
          <option key={booking.id} value={booking.id}>
            {booking.eventDateLabel} · {booking.clientName} · {booking.eventType}{booking.quoteNumber ? ` · ${booking.quoteNumber}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function QuotationEditor({ draft, setDraft, quotations, clients, bookings, services, template, onCancel, onSaved }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const totals = quoteTotals(draft.items || [], draft.depositPercent);
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
    const linkedDraft = quoteDraft({ quotations, template, booking });
    setDraft((current) => ({
      ...current,
      bookingId: booking.id,
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
      durationHours: linkedDraft.durationHours,
      notes: current.notes || linkedDraft.notes,
      items: current.items?.length ? current.items : linkedDraft.items
    }));
  };
  const persist = async (status) => {
    setSaving(true);
    const quoteNumber = draft.quoteNumber || nextQuotationNumber(quotations, draft.issueDate);
    const bookingId = await ensureBookingForQuotation({ draft, quoteNumber, totals, status, bookings });
    const clientId = clientKey({ email: draft.clientEmail, phone: draft.clientPhone, name: draft.clientName });
    const payload = normalizeQuotation(draft.id, {
      ...draft,
      bookingId,
      quoteNumber,
      status,
      clientId,
      client: {
        id: clientId,
        name: draft.clientName,
        email: draft.clientEmail,
        phone: draft.clientPhone,
        company: draft.company,
        clientAddress: draft.clientAddress,
        clientTaxNumber: draft.clientTaxNumber,
        clientVatNumber: draft.clientVatNumber,
        clientCompanyRegistration: draft.clientCompanyRegistration,
        customerInfo: draft.customerInfo
      },
      items: totals.items,
      subtotal: totals.subtotal,
      total: totals.total,
      depositDue: totals.depositDue
    });
    const [savedQuote] = await Promise.all([
      saveQuotation(payload),
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
        totalQuoted: totals.total
      })
    ]);
    if (bookingId) {
      try {
        await updateBooking(bookingId, { quoteId: savedQuote.id || payload.id, quotedAmount: totals.total, quoteNumber: payload.quoteNumber });
      } catch (error) {
        // The quote/client save is still valid if booking patching is blocked by rules or connectivity.
      }
    }
    setDraft((current) => ({ ...current, id: savedQuote.id || payload.id, bookingId, status, quoteNumber: payload.quoteNumber }));
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
    onSaved?.(normalizeQuotation(savedQuote.id || payload.id, { ...payload, ...savedQuote }));
  };
  const printCurrentDraft = () => {
    printQuote(normalizeQuotation(draft.id, {
      ...draft,
      items: totals.items,
      subtotal: totals.subtotal,
      total: totals.total,
      depositDue: totals.depositDue
    }), activeTemplate);
  };

  const liveQuote = normalizeQuotation(draft.id, {
    ...draft,
    items: totals.items,
    subtotal: totals.subtotal,
    total: totals.total,
    depositDue: totals.depositDue
  });

  return (
    <section className="admin-panel admin-panel--wide admin-doc-editor">
      <div className="admin-panel__title">
        <div className="admin-panel__intro">
          <h2>{draft.id ? `Edit ${draft.quoteNumber}` : 'New Quote'}</h2>
          <p>Fill in the details on the left — the preview updates live on the right.</p>
        </div>
        <div className="admin-panel__actions">
          {saved && <span className="admin-saved">Saved ✓</span>}
          <button type="button" onClick={() => persist('draft')} disabled={saving}>Save draft</button>
          <button type="button" onClick={() => persist('sent')} disabled={saving}>Save &amp; mark sent</button>
          <button type="button" onClick={printCurrentDraft}>Print PDF</button>
          <button type="button" onClick={onCancel}>Close</button>
        </div>
      </div>

      <div className="admin-doc-editor__body">
        <div className="admin-doc-editor__form">
          <FieldGroup title="Start here" defaultOpen missing={missingCount(draft, ['clientName', 'eventDate'])}>
            <p className="admin-field-group-help">Choose a saved client or booking first. The rest of the quote stays collapsed until you need to edit wording, billing details, or services.</p>
            {allClients.length > 0 && (
              <ClientPicker allClients={allClients} onSelect={selectClient} />
            )}
            {bookings.length > 0 && (
              <BookingPicker bookings={bookings} selectedBookingId={draft.bookingId} onSelect={selectBooking} />
            )}
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

          <FieldGroup title="Quotation details" missing={missingCount(draft, ['quoteNumber', 'issueDate', 'validUntil'])}>
            <div className="admin-quote-form">
              <label>Issue date<input type="date" value={draft.issueDate} onChange={(event) => update('issueDate', event.target.value)} /></label>
              <label>Valid until<input type="date" value={draft.validUntil} onChange={(event) => update('validUntil', event.target.value)} /></label>
              <label>Status<select value={draft.status} onChange={(event) => update('status', event.target.value)}>{QUOTE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <label>Deposit %<input type="number" min="0" max="100" value={draft.depositPercent} onChange={(event) => update('depositPercent', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Notes<textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label>
              <label className="admin-quote-form__wide">Terms<textarea value={draft.terms} onChange={(event) => update('terms', event.target.value)} placeholder={activeTemplate?.quotationTerms} /></label>
            </div>
          </FieldGroup>

          <FieldGroup title="Quote services" missing={draft.items?.length ? 0 : 1}>
            <LineItemsEditor items={draft.items} serviceOptions={serviceOptions} updateItem={updateItem} addBlankItem={addBlankItem} addServiceItem={addServiceItem} removeItem={removeItem} />
          </FieldGroup>

          <div className="admin-quote-totals">
            <span>Subtotal <strong>{money(totals.subtotal)}</strong></span>
            <span>Deposit due <strong>{money(totals.depositDue)}</strong></span>
            <span>Total <strong>{money(totals.total)}</strong></span>
          </div>
        </div>

        <div className="admin-doc-editor__preview">
          <div className="admin-doc-preview-label">Live preview</div>
          <QuotePreview quote={liveQuote} template={activeTemplate} />
        </div>
      </div>
    </section>
  );
}

function LineItemsEditor({ items, serviceOptions, updateItem, addBlankItem, addServiceItem, removeItem }) {
  return (
    <div className="admin-line-items">
      <div className="admin-panel__title">
        <h3>Line items</h3>
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
      {items.map((item) => {
        const lineTotal = num(item.quantity) * num(item.unitPrice);
        return (
          <div className="admin-line-item" key={item.id}>
            <input aria-label="Item name" placeholder="Name" value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} />
            <input aria-label="Description" placeholder="Description" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} />
            <select aria-label="Category" value={item.category} onChange={(event) => updateItem(item.id, 'category', event.target.value)}>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            <select aria-label="Unit" value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value)}>{UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select>
            <input aria-label="Quantity" type="number" min="0" step="0.5" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} />
            <input aria-label="Unit price" type="number" min="0" step="1" value={item.unitPrice} onChange={(event) => updateItem(item.id, 'unitPrice', event.target.value)} />
            <strong>{money(lineTotal)}</strong>
            <button type="button" className="admin-danger-btn" onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        );
      })}
    </div>
  );
}

function QuotePreview({ quote, template }) {
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
          <h3>{templateText(activeTemplate, 'quotationTitle', 'Quotation')}</h3>
          <p>{quote.quoteNumber || 'Draft'}<br />{templateText(activeTemplate, 'issuedLabel', 'Issued')} {dateLabel(quote.issueDate)}<br />{templateText(activeTemplate, 'validUntilLabel', 'Valid until')} {dateLabel(quote.validUntil)}</p>
        </div>
      </section>

      {/* Client / Event panels */}
      <section className="admin-document-preview__split">
        <div>
          <span>{templateText(activeTemplate, 'clientSectionTitle', 'Billed to')}</span>
          <p><strong>{quote.clientName || 'Client name'}</strong>{customerLines(quote).map((line, index) => <span key={`${line}-${index}`}><br />{line}</span>)}</p>
        </div>
        <div>
          <span>{templateText(activeTemplate, 'eventSectionTitle', 'Event')}</span>
          <p><strong>{quote.eventType || '—'}</strong><br />{dateLabel(quote.eventDate)}<br />{quote.eventLocation}{quote.durationHours ? <><br />{quote.durationHours} hours</> : null}</p>
        </div>
      </section>

      {/* Services table */}
      <div className="admin-document-preview__services-label">{templateText(activeTemplate, 'servicesSectionTitle', 'Services')}</div>
      <table className="admin-document-preview__table">
        <thead>
          <tr><th style={{textAlign:'left'}}>{templateText(activeTemplate, 'serviceColumnLabel', 'Service')}</th><th>{templateText(activeTemplate, 'unitColumnLabel', 'Units')}</th><th>{templateText(activeTemplate, 'rateColumnLabel', 'Rate')}</th><th>{templateText(activeTemplate, 'amountColumnLabel', 'Total')}</th></tr>
        </thead>
        <tbody>
          {quote.items.map((item) => (
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
        <p><span>{templateText(activeTemplate, 'subtotalLabel', 'Subtotal')}</span><strong>{money(quote.subtotal)}</strong></p>
        {quote.depositDue > 0 && <p><span>{templateText(activeTemplate, 'depositDueLabel', 'Deposit due')}</span><strong>{money(quote.depositDue)}</strong></p>}
        <p className="admin-document-preview__grand-total"><span>{templateText(activeTemplate, 'quoteTotalLabel', 'Quote total')}</span><strong>{money(quote.total)}</strong></p>
      </section>

      {/* Terms */}
      <section className="admin-document-preview__terms">
        <span>{templateText(activeTemplate, 'termsSectionTitle', 'Terms')}</span>
        <p>{quote.terms || activeTemplate.quotationTerms}</p>
      </section>

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

function buildQuotePrintHtml(quote, template) {
  const activeTemplate = normalizeDocumentTemplate(template?.id, template || DEFAULT_DOCUMENT_TEMPLATE);
  const items = quote.items || [];
  const unitLabel = (item) => `${escapeHtml(String(item.quantity))} ${escapeHtml(item.unit)}`;
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(quote.quoteNumber)}</title><style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { width: 210mm; min-height: 297mm; margin: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: ${escapeHtml(activeTemplate.documentBackground)}; color: ${escapeHtml(activeTemplate.bodyTextColor)}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    main { width: 210mm; min-height: 297mm; background: ${escapeHtml(activeTemplate.documentBackground)}; display: flex; flex-direction: column; padding: 5mm 5mm 8mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1,h2,h3,p { margin: 0; }

    /* ── Header ── */
    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; background: ${escapeHtml(activeTemplate.headerBackground)}; color: ${escapeHtml(activeTemplate.headerTextColor)}; padding: 22px 22px 20px; }
    .top-left { display: flex; align-items: flex-start; gap: 14px; }
    .logo { width: 64px; height: 64px; border-radius: 3px; overflow: hidden; flex-shrink: 0; background: ${escapeHtml(activeTemplate.accentColor)}; color: #fff; display: grid; place-items: center; font-size: 22px; font-weight: 800; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    .top-name { display: flex; flex-direction: column; justify-content: center; }
    .top-kicker { font-size: 8px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: ${escapeHtml(activeTemplate.labelColor)}; margin-bottom: 4px; }
    .top-name h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: ${escapeHtml(activeTemplate.headerTextColor)}; line-height: 1.1; }
    .top-name p { font-size: 11px; color: #c8c1b6; margin-top: 3px; }
    .top-right { text-align: right; }
    .top-right h2 { font-size: 36px; font-weight: 300; text-transform: uppercase; letter-spacing: .03em; color: ${escapeHtml(activeTemplate.headerTextColor)}; line-height: 1; }
    .top-right-meta { font-size: 11px; color: #c8c1b6; margin-top: 6px; line-height: 1.6; }

    /* ── Client / Event panels ── */
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0 0; }
    .meta-panel { border: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; background: ${escapeHtml(activeTemplate.panelBackground)}; padding: 12px 14px; }
    .label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .2em; color: ${escapeHtml(activeTemplate.labelColor)}; margin-bottom: 6px; }
    .meta-panel p { font-size: 12px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; }
    .meta-panel strong { font-size: 12px; }

    /* ── Services table ── */
    .services-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .2em; color: ${escapeHtml(activeTemplate.labelColor)}; margin: 16px 0 6px; }
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    colgroup .col-service { width: auto; }
    colgroup .col-units, colgroup .col-rate, colgroup .col-total { width: 90px; }
    th { background: ${escapeHtml(activeTemplate.tableHeaderBackground)}; color: ${escapeHtml(activeTemplate.tableHeaderTextColor)}; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; padding: 9px 10px; text-align: left; }
    th:not(:first-child), td:not(:first-child) { text-align: right; }
    td { border-bottom: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; padding: 10px 10px; vertical-align: top; font-size: 12px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; }
    .td-service-name { font-weight: 700; font-size: 13px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; }
    .td-service-desc { font-size: 10px; color: #888; margin-top: 2px; }

    /* ── Totals ── */
    .totals-row { display: flex; justify-content: flex-end; margin-top: 12px; }
    .totals-box { width: 240px; background: ${escapeHtml(activeTemplate.totalsBackground)}; color: ${escapeHtml(activeTemplate.totalsTextColor)}; padding: 14px 16px; display: grid; gap: 6px; }
    .totals-line { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; color: ${escapeHtml(activeTemplate.totalsTextColor)}; }
    .totals-line.grand { font-size: 15px; font-weight: 800; border-top: 1px solid rgba(255,255,255,.18); padding-top: 8px; margin-top: 4px; }
    .totals-line span, .totals-line strong { color: ${escapeHtml(activeTemplate.totalsTextColor)}; }

    /* ── Notes / Terms ── */
    .notes-terms { margin-top: 16px; }
    .section-block { border-top: 1px solid ${escapeHtml(activeTemplate.panelBorderColor)}; padding-top: 14px; }
    .section-block p { font-size: 11px; color: ${escapeHtml(activeTemplate.bodyTextColor)}; line-height: 1.6; margin-top: 5px; }

    /* ── Footer bar ── */
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
        <h2>${escapeHtml(templateText(activeTemplate, 'quotationTitle', 'Quotation'))}</h2>
        <p class="top-right-meta">${escapeHtml(quote.quoteNumber)}<br />${escapeHtml(templateText(activeTemplate, 'issuedLabel', 'Issued'))} ${escapeHtml(dateLabel(quote.issueDate))}<br />${escapeHtml(templateText(activeTemplate, 'validUntilLabel', 'Valid until'))} ${escapeHtml(dateLabel(quote.validUntil))}</p>
      </div>
    </div>

    <div class="meta">
      <div class="meta-panel">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'clientSectionTitle', 'Billed to'))}</p>
        <p>${customerHtml(quote)}</p>
      </div>
      <div class="meta-panel">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'eventSectionTitle', 'Event'))}</p>
        <p><strong>${escapeHtml(quote.eventType)}</strong><br />${escapeHtml(dateLabel(quote.eventDate))}<br />${escapeHtml(quote.eventLocation)}${quote.durationHours ? `<br />${escapeHtml(String(quote.durationHours))} hours` : ''}</p>
      </div>
    </div>

    <p class="services-label">${escapeHtml(templateText(activeTemplate, 'servicesSectionTitle', 'Services'))}</p>
    <table>
      <colgroup><col class="col-service" /><col class="col-units" /><col class="col-rate" /><col class="col-total" /></colgroup>
      <thead><tr><th>${escapeHtml(templateText(activeTemplate, 'serviceColumnLabel', 'Service'))}</th><th>${escapeHtml(templateText(activeTemplate, 'unitColumnLabel', 'Units'))}</th><th>${escapeHtml(templateText(activeTemplate, 'rateColumnLabel', 'Rate'))}</th><th>${escapeHtml(templateText(activeTemplate, 'amountColumnLabel', 'Total'))}</th></tr></thead>
      <tbody>${items.map((item) => `<tr>
        <td><div class="td-service-name">${escapeHtml(item.name)}</div>${item.description ? `<div class="td-service-desc">${escapeHtml(item.description)}</div>` : ''}</td>
        <td>${unitLabel(item)}</td>
        <td>${escapeHtml(money(item.unitPrice))}</td>
        <td>${escapeHtml(money(item.total))}</td>
      </tr>`).join('')}</tbody>
    </table>

    <div class="totals-row">
      <div class="totals-box">
        <div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'subtotalLabel', 'Subtotal'))}</span><strong>${escapeHtml(money(quote.subtotal))}</strong></div>
        ${quote.depositDue ? `<div class="totals-line"><span>${escapeHtml(templateText(activeTemplate, 'depositDueLabel', 'Deposit due'))}</span><strong>${escapeHtml(money(quote.depositDue))}</strong></div>` : ''}
        <div class="totals-line grand"><span>${escapeHtml(templateText(activeTemplate, 'quoteTotalLabel', 'Quote total'))}</span><strong>${escapeHtml(money(quote.total))}</strong></div>
      </div>
    </div>

    <div class="notes-terms">
      <div class="section-block">
        <p class="label">${escapeHtml(templateText(activeTemplate, 'termsSectionTitle', 'Terms'))}</p>
        <p>${escapeHtml(quote.terms || activeTemplate.quotationTerms)}</p>
      </div>
    </div>

    <div class="footer">
      <span>${escapeHtml(activeTemplate.businessName)}</span>
      <span>${escapeHtml(templateText(activeTemplate, 'footerNote', 'Prepared with availability subject to confirmation.'))}</span>
    </div>

  </main></body></html>`;
}

function printQuote(quote, template) {
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
  printDocument.write(buildQuotePrintHtml(quote, template));
  printDocument.close();
}

export default function AdminQuotations({ quotations, clients, bookings, quoteServices, documentTemplates, quotationError, bookingDraftId }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('issue-desc');
  const [editingQuote, setEditingQuote] = useState(null);
  const [localQuotes, setLocalQuotes] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const openedBookingRef = useRef('');
  const template = documentTemplates.find((item) => item.isDefault) || documentTemplates[0] || DEFAULT_DOCUMENT_TEMPLATE;
  const allQuotes = useMemo(() => {
    const map = new Map([...quotations, ...localQuotes].map((quote) => [quote.id, normalizeQuotation(quote.id, quote)]));
    return [...map.values()].filter((quote) => !deletedIds.includes(quote.id));
  }, [deletedIds, localQuotes, quotations]);

  useEffect(() => {
    if (!bookingDraftId || openedBookingRef.current === bookingDraftId) return;
    const booking = bookings.find((item) => item.id === bookingDraftId);
    if (booking) {
      openedBookingRef.current = bookingDraftId;
      setEditingQuote(quoteDraft({ quotations: allQuotes, template, booking }));
    }
  }, [allQuotes, bookingDraftId, bookings, template]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const rows = allQuotes.filter((quote) => {
      const haystack = [quote.quoteNumber, quote.clientName, quote.clientEmail, quote.eventType, quote.eventLocation].join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
    const getDate = (value) => new Date(value || 0).getTime() || 0;
    const sorters = {
      'issue-desc': (a, b) => getDate(b.issueDate) - getDate(a.issueDate),
      'event-date': (a, b) => getDate(a.eventDate) - getDate(b.eventDate),
      client: (a, b) => safeText(a.clientName).localeCompare(safeText(b.clientName)),
      total: (a, b) => b.total - a.total,
      status: (a, b) => safeText(a.status).localeCompare(safeText(b.status))
    };
    return [...rows].sort(sorters[sortBy] || sorters['issue-desc']);
  }, [allQuotes, search, sortBy]);

  const startNew = () => setEditingQuote(quoteDraft({ quotations: allQuotes, template }));
  const editQuote = (quote) => setEditingQuote({
    ...quote,
    issueDate: toInputDate(quote.issueDate),
    validUntil: toInputDate(quote.validUntil),
    eventDate: toInputDate(quote.eventDate),
    items: quote.items || []
  });
  const removeQuote = async (quote) => {
    if (!window.confirm(`Delete quotation ${quote.quoteNumber}? This cannot be undone.`)) return;
    setDeletedIds((current) => [...new Set([...current, quote.id])]);
    setLocalQuotes((current) => current.filter((item) => item.id !== quote.id));
    await deleteQuotation(quote.id);
    if (editingQuote?.id === quote.id) setEditingQuote(null);
  };
  const handleSaved = (quote) => {
    setLocalQuotes((current) => [quote, ...current.filter((item) => item.id !== quote.id)]);
  };
  const changeQuoteStatus = async (event, quote) => {
    event.stopPropagation();
    const status = event.target.value;
    const nextQuote = normalizeQuotation(quote.id, { ...quote, status });
    setLocalQuotes((current) => [nextQuote, ...current.filter((item) => item.id !== quote.id)]);
    const saved = await saveQuotation(nextQuote);
    setLocalQuotes((current) => [normalizeQuotation(saved.id || nextQuote.id, { ...nextQuote, ...saved }), ...current.filter((item) => item.id !== quote.id)]);
    const linkedBooking = bookings.find((booking) => booking.id === quote.bookingId || (quote.quoteNumber && booking.quoteNumber === quote.quoteNumber));
    if (linkedBooking) {
      const bookingPatch = { quoteNumber: quote.quoteNumber, quotedAmount: quote.total };
      if (status === 'accepted') bookingPatch.status = 'accepted';
      if (status === 'declined' || status === 'expired') bookingPatch.status = 'declined';
      await updateBooking(linkedBooking.id, bookingPatch);
    }
  };

  return (
    <div className="admin-stack">
      {editingQuote && (
        <QuotationEditor
          draft={editingQuote}
          setDraft={setEditingQuote}
          quotations={allQuotes}
          clients={clients}
          bookings={bookings}
          services={quoteServices}
          template={template}
          onCancel={() => setEditingQuote(null)}
          onSaved={handleSaved}
        />
      )}
      <section className="admin-panel admin-panel--wide">
        <div className="admin-panel__title">
          <div className="admin-panel__intro">
            <h2>Quotations</h2>
            <p>Create, edit, print, and export client quotations.</p>
          </div>
          <div className="admin-panel__actions">
            <button type="button" onClick={() => downloadCsv('phee-quotations.csv', quotationCsvRows(filtered))}>Export quote CSV</button>
            <button type="button" onClick={startNew}>New Quote</button>
          </div>
        </div>
        {quotationError && <p className="admin-alert admin-alert--warning">Quotation records are using local fallback where available: {quotationError}</p>}
        <div className="admin-filters admin-filters--compact">
          <input placeholder="Search quote, client, event, venue" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="issue-desc">Issue date newest</option>
            <option value="event-date">Event date</option>
            <option value="client">Client name</option>
            <option value="total">Total</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Quote</th><th>Client</th><th>Event</th><th>Date</th><th>Location</th><th>Valid until</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((quote) => (
                <tr key={quote.id} onClick={() => editQuote(quote)}>
                  <td>{quote.quoteNumber}</td>
                  <td><button type="button" onClick={() => editQuote(quote)}>{quote.clientName}</button><small>{quote.clientEmail}</small></td>
                  <td>{quote.eventType}</td>
                  <td>{dateLabel(quote.eventDate)}</td>
                  <td>{quote.eventLocation}</td>
                  <td>{dateLabel(quote.validUntil)}</td>
                  <td>
                    <select className={`admin-status-select admin-pill--${quote.status}`} value={quote.status} onClick={(event) => event.stopPropagation()} onChange={(event) => changeQuoteStatus(event, quote)}>
                      {QUOTE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{money(quote.total)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" onClick={(event) => { event.stopPropagation(); editQuote(quote); }}>View/Edit</button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); printQuote(quote, template); }}>Print</button>
                      <button type="button" className="admin-danger-btn" onClick={(event) => { event.stopPropagation(); removeQuote(quote); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="admin-empty">No quotations yet. Click ‘New Quote’ to create your first one.</p>}
        </div>
      </section>
    </div>
  );
}
