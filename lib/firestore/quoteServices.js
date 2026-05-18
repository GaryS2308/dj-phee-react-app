'use client';

import { ADMIN_LOCAL_KEYS } from '../adminUtils';
import { normalizeQuoteService } from '../adminDataShapes';
import { deleteAdminRecord, listenToAdminCollection, saveAdminRecord } from './adminCollections';

const CONFIG = {
  collectionName: 'quoteServices',
  localKey: ADMIN_LOCAL_KEYS.quoteServices,
  normalize: normalizeQuoteService
};

export function listenToQuoteServices(onData, onError) {
  return listenToAdminCollection(CONFIG, onData, onError);
}

export function saveQuoteService(record) {
  return saveAdminRecord(CONFIG, record);
}

export function deleteQuoteService(recordId) {
  return deleteAdminRecord(CONFIG, recordId);
}
