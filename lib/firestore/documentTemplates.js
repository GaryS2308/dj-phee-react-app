'use client';

import { ADMIN_LOCAL_KEYS } from '../adminUtils';
import { normalizeDocumentTemplate } from '../adminDataShapes';
import { deleteAdminRecord, listenToAdminCollection, saveAdminRecord } from './adminCollections';

const CONFIG = {
  collectionName: 'documentTemplates',
  localKey: ADMIN_LOCAL_KEYS.documentTemplates,
  normalize: normalizeDocumentTemplate
};

export function listenToDocumentTemplates(onData, onError) {
  return listenToAdminCollection(CONFIG, onData, onError);
}

export function saveDocumentTemplate(record) {
  return saveAdminRecord(CONFIG, record);
}

export function deleteDocumentTemplate(recordId) {
  return deleteAdminRecord(CONFIG, recordId);
}
