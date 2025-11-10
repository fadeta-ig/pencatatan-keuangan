// Firestore Types and Collection Names
// This file defines all Firestore data models and collection structure

import { Timestamp } from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  TRANSFERS: 'transfers',
  TAGS: 'tags',
  AUDIT_LOGS: 'auditLogs',
} as const;

// Enums
export enum AccountType {
  BANK = 'BANK',
  CASH = 'CASH',
  E_WALLET = 'E_WALLET',
  INVESTMENT = 'INVESTMENT',
  CREDIT_CARD = 'CREDIT_CARD',
  OTHER = 'OTHER',
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// User Document
export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  password: string; // Hashed with bcryptjs
  timezone: string;
  currency: string;
  locale: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUserInput extends Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'> {}

// Account Document
export interface FirestoreAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreAccountInput extends Omit<FirestoreAccount, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'> {}

// Category Document
export interface FirestoreCategory {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreCategoryInput extends Omit<FirestoreCategory, 'id' | 'createdAt' | 'updatedAt'> {}

// Transaction Document
export interface FirestoreTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: Timestamp;
  notes?: string;
  attachmentUrl?: string;
  attachmentMeta?: Record<string, any>;
  tags: string[]; // Array of tag IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreTransactionInput extends Omit<FirestoreTransaction, 'id' | 'createdAt' | 'updatedAt'> {}

// Transfer Document
export interface FirestoreTransfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  date: Timestamp;
  notes?: string;
  exchangeRate?: number;
  convertedAmount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreTransferInput extends Omit<FirestoreTransfer, 'id' | 'createdAt' | 'updatedAt'> {}

// Tag Document
export interface FirestoreTag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreTagInput extends Omit<FirestoreTag, 'id' | 'createdAt' | 'updatedAt'> {}

// AuditLog Document
export interface FirestoreAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

export interface FirestoreAuditLogInput extends Omit<FirestoreAuditLog, 'id' | 'timestamp'> {}

// Helper type for document creation
export type WithTimestamps<T> = T & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Helper type for document with ID
export type WithId<T> = T & {
  id: string;
};
