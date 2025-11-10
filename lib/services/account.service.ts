// Account Service
// Handles all account-related Firestore operations

import { Timestamp } from 'firebase/firestore';
import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryUserDocuments,
  softDeleteDocument,
  restoreDocument,
} from '../firestore-helpers';
import {
  COLLECTIONS,
  FirestoreAccount,
  FirestoreAccountInput,
  AccountType,
} from '@/types/firestore';

// Create a new account
export async function createAccount(data: FirestoreAccountInput): Promise<string> {
  const accountData = {
    ...data,
    currentBalance: data.initialBalance,
  };

  return createDocument(COLLECTIONS.ACCOUNTS, accountData);
}

// Get account by ID
export async function getAccountById(
  accountId: string
): Promise<(FirestoreAccount & { id: string }) | null> {
  return getDocument<FirestoreAccount>(COLLECTIONS.ACCOUNTS, accountId);
}

// Get all accounts for a user
export async function getUserAccounts(
  userId: string,
  activeOnly: boolean = true
): Promise<Array<FirestoreAccount & { id: string }>> {
  const whereConditions = activeOnly
    ? [{ field: 'isActive', operator: '==' as const, value: true }]
    : [];

  return queryUserDocuments<FirestoreAccount>(COLLECTIONS.ACCOUNTS, userId, {
    where: whereConditions,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });
}

// Get accounts by type
export async function getAccountsByType(
  userId: string,
  type: AccountType
): Promise<Array<FirestoreAccount & { id: string }>> {
  return queryUserDocuments<FirestoreAccount>(COLLECTIONS.ACCOUNTS, userId, {
    where: [
      { field: 'type', operator: '==', value: type },
      { field: 'isActive', operator: '==', value: true },
    ],
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
  });
}

// Update account
export async function updateAccount(
  accountId: string,
  data: Partial<Omit<FirestoreAccountInput, 'userId'>>
): Promise<void> {
  return updateDocument(COLLECTIONS.ACCOUNTS, accountId, data);
}

// Update account balance
export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<void> {
  return updateDocument(COLLECTIONS.ACCOUNTS, accountId, {
    currentBalance: newBalance,
  });
}

// Soft delete account
export async function deleteAccount(accountId: string): Promise<void> {
  return softDeleteDocument(COLLECTIONS.ACCOUNTS, accountId);
}

// Restore deleted account
export async function restoreAccount(accountId: string): Promise<void> {
  return restoreDocument(COLLECTIONS.ACCOUNTS, accountId);
}

// Get total balance for user
export async function getTotalBalance(userId: string): Promise<number> {
  const accounts = await getUserAccounts(userId, true);
  return accounts.reduce((total, account) => total + account.currentBalance, 0);
}

// Get balance by currency
export async function getBalanceByCurrency(
  userId: string,
  currency: string
): Promise<number> {
  const accounts = await queryUserDocuments<FirestoreAccount>(
    COLLECTIONS.ACCOUNTS,
    userId,
    {
      where: [
        { field: 'currency', operator: '==', value: currency },
        { field: 'isActive', operator: '==', value: true },
      ],
    }
  );

  return accounts.reduce((total, account) => total + account.currentBalance, 0);
}
