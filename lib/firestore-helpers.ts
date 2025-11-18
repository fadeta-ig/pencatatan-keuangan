// Firestore Helper Functions
// This file provides utility functions for common Firestore operations

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  DocumentReference,
  CollectionReference,
  WhereFilterOp,
  OrderByDirection,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/types/firestore';

/**
 * Helper to ensure Firestore is initialized
 */
function ensureDb() {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return db;
}

/**
 * Helper to remove undefined values from an object
 * Firestore doesn't accept undefined values, so we need to filter them out
 */
function removeUndefinedFields<T extends DocumentData>(data: T): Partial<T> {
  const result: any = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result as Partial<T>;
}

// Generic function to create a document
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const timestamp = Timestamp.now();
  const docData = removeUndefinedFields({
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const docRef = await addDoc(collection(ensureDb(), collectionName) as any, docData as any);
  return docRef.id;
}

// Generic function to get a document by ID
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(ensureDb(), collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  }
  return null;
}

// Generic function to update a document
export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(ensureDb(), collectionName, docId);
  const updateData = removeUndefinedFields({
    ...data,
    updatedAt: Timestamp.now(),
  });
  await updateDoc(docRef as any, updateData as any);
}

// Generic function to delete a document
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(ensureDb(), collectionName, docId);
  await deleteDoc(docRef);
}

// Generic function to query documents
export interface QueryOptions {
  where?: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction?: OrderByDirection;
  }>;
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
}

export async function queryDocuments<T extends DocumentData>(
  collectionName: string,
  options: QueryOptions = {}
): Promise<Array<T & { id: string }>> {
  const constraints: QueryConstraint[] = [];

  // Add where clauses
  if (options.where) {
    options.where.forEach((w) => {
      constraints.push(where(w.field, w.operator, w.value));
    });
  }

  // Add orderBy clauses
  if (options.orderBy) {
    options.orderBy.forEach((o) => {
      constraints.push(orderBy(o.field, o.direction || 'asc'));
    });
  }

  // Add limit
  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  // Add pagination
  if (options.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  const q = query(collection(ensureDb(), collectionName), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<T & { id: string }>;
}

// Get all documents in a collection
export async function getAllDocuments<T extends DocumentData>(
  collectionName: string
): Promise<Array<T & { id: string }>> {
  const querySnapshot = await getDocs(collection(ensureDb(), collectionName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<T & { id: string }>;
}

// Check if document exists
export async function documentExists(
  collectionName: string,
  docId: string
): Promise<boolean> {
  const docRef = doc(ensureDb(), collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

// Batch operations helper
export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  collectionName: string;
  docId?: string;
  data?: DocumentData;
}

// Get collection reference
export function getCollectionRef(collectionName: string): CollectionReference {
  return collection(ensureDb(), collectionName);
}

// Get document reference
export function getDocRef(collectionName: string, docId: string): DocumentReference {
  return doc(ensureDb(), collectionName, docId);
}

// Timestamp helpers
export function toTimestamp(date: Date | string): Timestamp {
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  return Timestamp.fromDate(new Date(date));
}

export function fromTimestamp(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Convert Firestore Timestamp to ISO string
export function timestampToISO(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString();
}

// User-specific query helper
export async function queryUserDocuments<T extends DocumentData>(
  collectionName: string,
  userId: string,
  additionalOptions: QueryOptions = {}
): Promise<Array<T & { id: string }>> {
  return queryDocuments<T>(collectionName, {
    ...additionalOptions,
    where: [
      { field: 'userId', operator: '==', value: userId },
      ...(additionalOptions.where || []),
    ],
  });
}

// Soft delete helper (set isActive to false)
export async function softDeleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await updateDocument(collectionName, docId, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

// Restore soft-deleted document
export async function restoreDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await updateDocument(collectionName, docId, {
    isActive: true,
    updatedAt: Timestamp.now(),
  });
}
