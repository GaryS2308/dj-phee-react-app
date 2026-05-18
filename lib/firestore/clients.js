'use client';

import { ADMIN_LOCAL_KEYS } from '../adminUtils';
import { normalizeClientRecord } from '../adminDataShapes';
import { deleteAdminRecord, listenToAdminCollection, saveAdminRecord } from './adminCollections';

const CONFIG = {
  collectionName: 'clients',
  localKey: ADMIN_LOCAL_KEYS.clients,
  normalize: normalizeClientRecord
};

export function listenToClients(onData, onError) {
  return listenToAdminCollection(CONFIG, onData, onError);
}

export function saveClient(record) {
  return saveAdminRecord(CONFIG, record);
}

export function deleteClient(recordId) {
  return deleteAdminRecord(CONFIG, recordId);
}
