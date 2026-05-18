'use client';

import { ADMIN_LOCAL_KEYS } from '../adminUtils';
import { normalizeQuotation } from '../adminDataShapes';
import { deleteAdminRecord, listenToAdminCollection, saveAdminRecord } from './adminCollections';

const CONFIG = {
  collectionName: 'quotations',
  localKey: ADMIN_LOCAL_KEYS.quotations,
  normalize: normalizeQuotation
};

export function listenToQuotations(onData, onError) {
  return listenToAdminCollection(CONFIG, onData, onError);
}

export function saveQuotation(record) {
  return saveAdminRecord(CONFIG, record);
}

export function deleteQuotation(recordId) {
  return deleteAdminRecord(CONFIG, recordId);
}

export function nextQuotationNumber(quotations = [], issueDate = new Date()) {
  const date = issueDate instanceof Date ? issueDate : new Date(issueDate);
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  const prefix = `QUO-${year}-`;
  const max = quotations.reduce((currentMax, quote) => {
    const number = String(quote.quoteNumber || '');
    if (!number.startsWith(prefix)) return currentMax;
    const sequence = Number(number.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(currentMax, sequence) : currentMax;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}
