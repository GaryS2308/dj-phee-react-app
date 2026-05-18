'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { loadLocal, saveLocal, uid } from '../adminUtils';

export function listenToAdminCollection({ collectionName, localKey, normalize, orderField = 'createdAt' }, onData, onError) {
  const ref = collection(db, collectionName);
  const orderedQuery = query(ref, orderBy(orderField, 'desc'));
  return onSnapshot(
    orderedQuery,
    (snapshot) => {
      const records = snapshot.docs.map((recordDoc) => normalize(recordDoc.id, recordDoc.data()));
      saveLocal(localKey, records);
      onData(records);
    },
    (error) => {
      const fallback = loadLocal(localKey);
      if (Array.isArray(fallback)) {
        onData(fallback.map((item) => normalize(item.id, item)));
      } else {
        onData([]);
      }
      onError?.(error);
    }
  );
}

export async function saveAdminRecord({ collectionName, localKey, normalize }, record) {
  const normalized = normalize(record.id, record);
  const localRecords = loadLocal(localKey);
  const existing = Array.isArray(localRecords) ? localRecords : [];
  const nextRecords = [
    { ...normalized, updatedAt: new Date().toISOString(), createdAt: normalized.createdAt || new Date().toISOString() },
    ...existing.filter((item) => item.id !== normalized.id)
  ];

  try {
    if (record.id) {
      await setDoc(doc(db, collectionName, normalized.id), {
        ...normalized,
        updatedAt: serverTimestamp(),
        createdAt: normalized.createdAt || serverTimestamp()
      }, { merge: true });
      saveLocal(localKey, nextRecords);
      return { ...normalized, savedToFirestore: true };
    }

    const recordRef = await addDoc(collection(db, collectionName), {
      ...normalized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const saved = { ...normalized, id: recordRef.id, savedToFirestore: true };
    saveLocal(localKey, [saved, ...existing.filter((item) => item.id !== saved.id)]);
    return saved;
  } catch (error) {
    if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') throw error;
    const localRecord = { ...normalized, id: normalized.id || uid(), savedLocally: true };
    saveLocal(localKey, [localRecord, ...existing.filter((item) => item.id !== localRecord.id)]);
    return localRecord;
  }
}

export async function deleteAdminRecord({ collectionName, localKey }, recordId) {
  const existing = loadLocal(localKey);
  if (Array.isArray(existing)) saveLocal(localKey, existing.filter((item) => item.id !== recordId));
  try {
    await deleteDoc(doc(db, collectionName, recordId));
    return { deletedFromFirestore: true };
  } catch (error) {
    if (error?.code !== 'permission-denied' && error?.code !== 'unavailable') throw error;
    return { deletedLocally: true };
  }
}
