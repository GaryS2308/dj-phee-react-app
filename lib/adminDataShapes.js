'use client';

import { addDays, clientKey, dateLabel, num, safeText, today, uid } from './adminUtils';

export const BOOKING_STATUSES = ['pending', 'accepted', 'completed', 'cancelled', 'declined'];
export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid'];
export const EVENT_TYPE_OPTIONS = ['event / club', 'festival', 'wedding', 'private event', 'brand activation', 'other'];

export function normalizeEventTypeOption(value) {
  const text = safeText(value).toLowerCase();
  if (!text) return 'other';
  if (EVENT_TYPE_OPTIONS.includes(text)) return text;
  if (text.includes('festival')) return 'festival';
  if (text.includes('wedding')) return 'wedding';
  if (text.includes('brand') || text.includes('activation') || text.includes('corporate')) return 'brand activation';
  if (text.includes('private') || text.includes('birthday') || text.includes('party')) return 'private event';
  if (text.includes('club') || text.includes('bar') || text.includes('event')) return 'event / club';
  return 'other';
}

export const STARTER_QUOTE_SERVICES = [
  {
    id: 'starter-dj-performance',
    name: 'DJ Performance',
    category: 'DJ Sets',
    unit: 'hours',
    defaultQty: 1,
    unitPrice: 2500
  },
  {
    id: 'starter-sound-system',
    name: 'Sound System',
    category: 'Sound',
    unit: 'sets',
    defaultQty: 1,
    unitPrice: 4500
  },
  {
    id: 'starter-lighting-package',
    name: 'Lighting Package',
    category: 'Lighting',
    unit: 'sets',
    defaultQty: 1,
    unitPrice: 3200
  }
];

export const DEFAULT_DOCUMENT_TEMPLATE = {
  id: 'default-phee-template',
  name: 'PHEE Default',
  businessName: 'PHEE',
  roleTitle: 'DJ / Music Producer',
  logoUrl: '/favicon.png',
  accentColor: '#9b1c24',
  documentBackground: '#f2eee5',
  headerBackground: '#080808',
  headerTextColor: '#ffffff',
  bodyTextColor: '#34302a',
  labelColor: '#8a6a2f',
  panelBackground: '#f7f2ea',
  panelBorderColor: '#ded4c3',
  tableHeaderBackground: '#17100d',
  tableHeaderTextColor: '#ffffff',
  totalsBackground: '#17100d',
  totalsTextColor: '#ffffff',
  businessEmail: 'garyjohnstrybis@gmail.com',
  businessPhone: '0780750397',
  documentEyebrow: 'Performance Agreement',
  invoiceTitle: 'Invoice',
  quotationTitle: 'Quotation',
  clientSectionTitle: 'Billed to',
  eventSectionTitle: 'Event',
  servicesSectionTitle: 'Services',
  termsSectionTitle: 'Terms',
  notesSectionTitle: 'Notes',
  bankDetailsSectionTitle: 'Bank Details',
  issuedLabel: 'Issued',
  dueLabel: 'Due',
  validUntilLabel: 'Valid until',
  quoteReferenceLabel: 'Quote',
  serviceColumnLabel: 'Service',
  unitColumnLabel: 'Units',
  rateColumnLabel: 'Rate',
  amountColumnLabel: 'Total',
  subtotalLabel: 'Subtotal',
  discountLabel: 'Discount',
  depositDueLabel: 'Deposit due',
  balanceDueLabel: 'Balance due',
  quoteTotalLabel: 'Quote total',
  invoiceTotalLabel: 'Total',
  footerNote: 'Prepared with availability subject to confirmation.',
  bankName: 'Nedbank',
  accountHolder: 'PHEE',
  accountNumber: '',
  branchCode: '',
  bicSwiftCode: '',
  invoiceTerms: 'Payment is due by the due date shown on this invoice. Booking is confirmed once the required deposit has cleared.',
  quotationTerms: 'This quotation is valid until the date shown above. Availability is subject to confirmation and deposit payment.',
  isDefault: true
};

export function normalizeLineItem(data = {}) {
  const quantity = num(data.quantity ?? data.qty ?? data.defaultQty ?? 1) || 1;
  const unitPrice = num(data.unitPrice ?? data.price ?? data.rate);
  const total = num(data.total) || quantity * unitPrice;
  return {
    id: safeText(data.id) || uid(),
    serviceId: safeText(data.serviceId),
    name: safeText(data.name || data.service || 'Service'),
    description: safeText(data.description),
    category: safeText(data.category),
    unit: safeText(data.unit || 'each'),
    quantity,
    unitPrice,
    total
  };
}

export function normalizeQuoteService(id, data = {}) {
  return {
    id: safeText(id || data.id) || uid(),
    name: safeText(data.name || 'New service'),
    category: safeText(data.category),
    unit: safeText(data.unit || 'each'),
    defaultQty: num(data.defaultQty ?? data.quantity ?? 1) || 1,
    unitPrice: num(data.unitPrice ?? data.price ?? data.rate),
    description: safeText(data.description),
    active: data.active !== false,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export function normalizeDocumentTemplate(id, data = {}) {
  return {
    ...DEFAULT_DOCUMENT_TEMPLATE,
    ...data,
    id: safeText(id || data.id) || uid(),
    name: safeText(data.name || DEFAULT_DOCUMENT_TEMPLATE.name),
    businessName: safeText(data.businessName || DEFAULT_DOCUMENT_TEMPLATE.businessName),
    roleTitle: safeText(data.roleTitle || data.role || DEFAULT_DOCUMENT_TEMPLATE.roleTitle),
    logoUrl: safeText(data.logoUrl),
    accentColor: safeText(data.accentColor || DEFAULT_DOCUMENT_TEMPLATE.accentColor),
    documentBackground: safeText(data.documentBackground || DEFAULT_DOCUMENT_TEMPLATE.documentBackground),
    headerBackground: safeText(data.headerBackground || DEFAULT_DOCUMENT_TEMPLATE.headerBackground),
    headerTextColor: safeText(data.headerTextColor || DEFAULT_DOCUMENT_TEMPLATE.headerTextColor),
    bodyTextColor: safeText(data.bodyTextColor || DEFAULT_DOCUMENT_TEMPLATE.bodyTextColor),
    labelColor: safeText(data.labelColor || DEFAULT_DOCUMENT_TEMPLATE.labelColor),
    panelBackground: safeText(data.panelBackground || DEFAULT_DOCUMENT_TEMPLATE.panelBackground),
    panelBorderColor: safeText(data.panelBorderColor || DEFAULT_DOCUMENT_TEMPLATE.panelBorderColor),
    tableHeaderBackground: safeText(data.tableHeaderBackground || DEFAULT_DOCUMENT_TEMPLATE.tableHeaderBackground),
    tableHeaderTextColor: safeText(data.tableHeaderTextColor || DEFAULT_DOCUMENT_TEMPLATE.tableHeaderTextColor),
    totalsBackground: safeText(data.totalsBackground || DEFAULT_DOCUMENT_TEMPLATE.totalsBackground),
    totalsTextColor: safeText(data.totalsTextColor || DEFAULT_DOCUMENT_TEMPLATE.totalsTextColor),
    businessEmail: safeText(data.businessEmail || data.email),
    businessPhone: safeText(data.businessPhone || data.phone),
    documentEyebrow: safeText(data.documentEyebrow || DEFAULT_DOCUMENT_TEMPLATE.documentEyebrow),
    invoiceTitle: safeText(data.invoiceTitle || DEFAULT_DOCUMENT_TEMPLATE.invoiceTitle),
    quotationTitle: safeText(data.quotationTitle || DEFAULT_DOCUMENT_TEMPLATE.quotationTitle),
    clientSectionTitle: safeText(data.clientSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.clientSectionTitle),
    eventSectionTitle: safeText(data.eventSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.eventSectionTitle),
    servicesSectionTitle: safeText(data.servicesSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.servicesSectionTitle),
    termsSectionTitle: safeText(data.termsSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.termsSectionTitle),
    notesSectionTitle: safeText(data.notesSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.notesSectionTitle),
    bankDetailsSectionTitle: safeText(data.bankDetailsSectionTitle || DEFAULT_DOCUMENT_TEMPLATE.bankDetailsSectionTitle),
    issuedLabel: safeText(data.issuedLabel || DEFAULT_DOCUMENT_TEMPLATE.issuedLabel),
    dueLabel: safeText(data.dueLabel || DEFAULT_DOCUMENT_TEMPLATE.dueLabel),
    validUntilLabel: safeText(data.validUntilLabel || DEFAULT_DOCUMENT_TEMPLATE.validUntilLabel),
    quoteReferenceLabel: safeText(data.quoteReferenceLabel || DEFAULT_DOCUMENT_TEMPLATE.quoteReferenceLabel),
    serviceColumnLabel: safeText(data.serviceColumnLabel || DEFAULT_DOCUMENT_TEMPLATE.serviceColumnLabel),
    unitColumnLabel: safeText(data.unitColumnLabel || DEFAULT_DOCUMENT_TEMPLATE.unitColumnLabel),
    rateColumnLabel: safeText(data.rateColumnLabel || DEFAULT_DOCUMENT_TEMPLATE.rateColumnLabel),
    amountColumnLabel: safeText(data.amountColumnLabel || DEFAULT_DOCUMENT_TEMPLATE.amountColumnLabel),
    subtotalLabel: safeText(data.subtotalLabel || DEFAULT_DOCUMENT_TEMPLATE.subtotalLabel),
    discountLabel: safeText(data.discountLabel || DEFAULT_DOCUMENT_TEMPLATE.discountLabel),
    depositDueLabel: safeText(data.depositDueLabel || DEFAULT_DOCUMENT_TEMPLATE.depositDueLabel),
    balanceDueLabel: safeText(data.balanceDueLabel || DEFAULT_DOCUMENT_TEMPLATE.balanceDueLabel),
    quoteTotalLabel: safeText(data.quoteTotalLabel || DEFAULT_DOCUMENT_TEMPLATE.quoteTotalLabel),
    invoiceTotalLabel: safeText(data.invoiceTotalLabel || DEFAULT_DOCUMENT_TEMPLATE.invoiceTotalLabel),
    footerNote: safeText(data.footerNote || DEFAULT_DOCUMENT_TEMPLATE.footerNote),
    bankName: safeText(data.bankName),
    accountHolder: safeText(data.accountHolder),
    accountNumber: safeText(data.accountNumber),
    branchCode: safeText(data.branchCode),
    bicSwiftCode: safeText(data.bicSwiftCode),
    invoiceTerms: safeText(data.invoiceTerms || data.terms || DEFAULT_DOCUMENT_TEMPLATE.invoiceTerms),
    quotationTerms: safeText(data.quotationTerms || DEFAULT_DOCUMENT_TEMPLATE.quotationTerms),
    isDefault: Boolean(data.isDefault)
  };
}

export function normalizeClientRecord(id, data = {}) {
  const name = safeText(data.name || data.clientName || 'Unknown client');
  const email = safeText(data.email || data.clientEmail);
  const phone = safeText(data.phone || data.clientPhone);
  return {
    id: safeText(id || data.id) || clientKey({ email, phone, name }),
    name,
    email,
    phone,
    company: safeText(data.company || data.clientCompany),
    clientAddress: safeText(data.clientAddress),
    clientTaxNumber: safeText(data.clientTaxNumber),
    clientVatNumber: safeText(data.clientVatNumber),
    clientCompanyRegistration: safeText(data.clientCompanyRegistration),
    customerInfo: safeText(data.customerInfo),
    notes: safeText(data.notes),
    source: safeText(data.source),
    totalQuoted: num(data.totalQuoted),
    totalPaid: num(data.totalPaid),
    bookingIds: Array.isArray(data.bookingIds) ? data.bookingIds : [],
    clientKey: safeText(data.clientKey) || clientKey({ email, phone, name }),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export function normalizeQuotation(id, data = {}) {
  const items = Array.isArray(data.items || data.lineItems)
    ? (data.items || data.lineItems).map(normalizeLineItem)
    : [];
  const subtotal = num(data.subtotal) || items.reduce((sum, item) => sum + item.total, 0);
  const discount = num(data.discount);
  const total = num(data.total) || Math.max(subtotal - discount, 0);
  const client = normalizeClientRecord(data.clientId, data.client || data);
  return {
    id: safeText(id || data.id) || uid(),
    quoteNumber: safeText(data.quoteNumber || data.number),
    status: safeText(data.status || 'draft'),
    bookingId: safeText(data.bookingId),
    clientId: safeText(data.clientId),
    client,
    clientName: safeText(data.clientName || client.name),
    clientEmail: safeText(data.clientEmail || client.email),
    clientPhone: safeText(data.clientPhone || client.phone),
    company: safeText(data.company || client.company),
    clientAddress: safeText(data.clientAddress),
    clientTaxNumber: safeText(data.clientTaxNumber),
    clientVatNumber: safeText(data.clientVatNumber),
    clientCompanyRegistration: safeText(data.clientCompanyRegistration),
    customerInfo: safeText(data.customerInfo),
    issueDate: data.issueDate || today(),
    validUntil: data.validUntil || addDays(14),
    eventDate: data.eventDate || '',
    eventType: safeText(data.eventType),
    eventLocation: safeText(data.eventLocation || data.location),
    durationHours: num(data.durationHours ?? data.duration),
    items,
    subtotal,
    discount,
    total,
    depositPercent: num(data.depositPercent ?? 50),
    depositDue: num(data.depositDue) || Math.round(total * (num(data.depositPercent ?? 50) / 100)),
    templateId: safeText(data.templateId),
    terms: safeText(data.terms),
    notes: safeText(data.notes),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export function normalizeInvoiceDoc(id, data = {}) {
  const items = Array.isArray(data.items || data.lineItems)
    ? (data.items || data.lineItems).map(normalizeLineItem)
    : [];
  const subtotal = num(data.subtotal) || items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = num(data.taxAmount);
  const discount = num(data.discount);
  const total = num(data.total) || Math.max(subtotal + taxAmount - discount, 0);
  const depositPercent = num(data.depositPercent ?? 50);
  const depositDue = num(data.depositDue) || Math.round(total * (depositPercent / 100));
  const amountPaid = num(data.amountPaid ?? data.depositPaid);
  const rawStatus = safeText(data.status || 'draft');
  const status = rawStatus === 'issued' ? 'sent' : rawStatus;
  return {
    id: safeText(id || data.id) || uid(),
    bookingId: safeText(data.bookingId),
    quotationId: safeText(data.quotationId),
    quoteNumber: safeText(data.quoteNumber || data.quotationNumber),
    invoiceNumber: safeText(data.invoiceNumber || data.number),
    clientId: safeText(data.clientId),
    clientName: safeText(data.clientName || data.name),
    clientEmail: safeText(data.clientEmail || data.email),
    clientPhone: safeText(data.clientPhone || data.phone),
    company: safeText(data.company || data.clientCompany),
    clientAddress: safeText(data.clientAddress),
    clientTaxNumber: safeText(data.clientTaxNumber),
    clientVatNumber: safeText(data.clientVatNumber),
    clientCompanyRegistration: safeText(data.clientCompanyRegistration),
    customerInfo: safeText(data.customerInfo),
    eventType: safeText(data.eventType || data.event),
    eventDate: data.eventDate || '',
    eventLocation: safeText(data.eventLocation || data.location),
    durationHours: num(data.durationHours ?? data.duration),
    issueDate: data.issueDate || today(),
    dueDate: data.dueDate || addDays(7),
    items,
    subtotal,
    taxAmount,
    discount,
    total,
    depositPercent,
    depositDue,
    amountPaid,
    balanceDue: num(data.balanceDue) || Math.max(total - amountPaid, 0),
    status,
    paymentStatus: safeText(data.paymentStatus || 'unpaid'),
    pdfUrl: safeText(data.pdfUrl),
    terms: safeText(data.terms),
    notes: safeText(data.notes),
    dateLabel: dateLabel(data.issueDate || data.createdAt),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}
