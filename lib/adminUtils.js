'use client';

export const ADMIN_LOCAL_KEYS = {
  quotations: 'phee-admin-quotations',
  invoices: 'phee-admin-invoices',
  clients: 'phee-admin-clients',
  quoteServices: 'phee-admin-quoteServices',
  documentTemplates: 'phee-admin-documentTemplates'
};

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

export function money(value) {
  return `R ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num(value))}`;
}

export function dateLabel(value) {
  if (!value) return '';
  const date = value instanceof Date
    ? value
    : typeof value?.toDate === 'function'
      ? value.toDate()
      : new Date(value);
  if (Number.isNaN(date.getTime())) return safeText(value);
  return date.toLocaleDateString('en-ZA');
}

export function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function safeText(value) {
  return String(value ?? '').trim();
}

export function nextNumber(prefix, count) {
  return `${safeText(prefix)}-${String(num(count) + 1).padStart(4, '0')}`;
}

export function clientKey({ email, phone, name } = {}) {
  const cleanEmail = safeText(email).toLowerCase();
  if (cleanEmail) return `email:${cleanEmail}`;
  const cleanPhone = safeText(phone).replace(/\D/g, '');
  if (cleanPhone) return `phone:${cleanPhone}`;
  return `name:${safeText(name).toLowerCase().replace(/\s+/g, '-')}`;
}

export function saveLocal(key, data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(data));
}

export function loadLocal(key) {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null');
  } catch (error) {
    return null;
  }
}
