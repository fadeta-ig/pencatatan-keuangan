// Transaction Service
// Handles all transaction-related Firestore operations

import { Timestamp } from 'firebase/firestore';
import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryUserDocuments,
  toTimestamp,
} from '../firestore-helpers';
import {
  COLLECTIONS,
  FirestoreTransaction,
  FirestoreTransactionInput,
  TransactionType,
} from '@/types/firestore';
import { updateAccountBalance, getAccountById } from './account.service';

// Create a new transaction and update account balance
export async function createTransaction(
  data: FirestoreTransactionInput
): Promise<string> {
  const transactionId = await createDocument(COLLECTIONS.TRANSACTIONS, data);

  // Update account balance
  await updateAccountBalanceAfterTransaction(
    data.accountId,
    data.amount,
    data.type
  );

  return transactionId;
}

// Get transaction by ID
export async function getTransactionById(
  transactionId: string
): Promise<(FirestoreTransaction & { id: string }) | null> {
  return getDocument<FirestoreTransaction>(COLLECTIONS.TRANSACTIONS, transactionId);
}

// Get all transactions for a user
export async function getUserTransactions(
  userId: string,
  options?: {
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<Array<FirestoreTransaction & { id: string }>> {
  const whereConditions: Array<{
    field: string;
    operator: any;
    value: any;
  }> = [];

  if (options?.type) {
    whereConditions.push({ field: 'type', operator: '==', value: options.type });
  }

  if (options?.accountId) {
    whereConditions.push({
      field: 'accountId',
      operator: '==',
      value: options.accountId,
    });
  }

  if (options?.categoryId) {
    whereConditions.push({
      field: 'categoryId',
      operator: '==',
      value: options.categoryId,
    });
  }

  if (options?.startDate) {
    whereConditions.push({
      field: 'date',
      operator: '>=',
      value: toTimestamp(options.startDate),
    });
  }

  if (options?.endDate) {
    whereConditions.push({
      field: 'date',
      operator: '<=',
      value: toTimestamp(options.endDate),
    });
  }

  return queryUserDocuments<FirestoreTransaction>(
    COLLECTIONS.TRANSACTIONS,
    userId,
    {
      where: whereConditions,
      orderBy: [{ field: 'date', direction: 'desc' }],
      limit: options?.limit,
    }
  );
}

// Get transactions by tag
export async function getTransactionsByTag(
  userId: string,
  tagId: string
): Promise<Array<FirestoreTransaction & { id: string }>> {
  return queryUserDocuments<FirestoreTransaction>(
    COLLECTIONS.TRANSACTIONS,
    userId,
    {
      where: [{ field: 'tags', operator: 'array-contains', value: tagId }],
      orderBy: [{ field: 'date', direction: 'desc' }],
    }
  );
}

// Update transaction
export async function updateTransaction(
  transactionId: string,
  data: Partial<Omit<FirestoreTransactionInput, 'userId'>>
): Promise<void> {
  const oldTransaction = await getTransactionById(transactionId);

  if (!oldTransaction) {
    throw new Error('Transaction not found');
  }

  // Determine new values (use old values if not provided)
  const newAmount = data.amount !== undefined ? data.amount : oldTransaction.amount;
  const newType = data.type !== undefined ? data.type : oldTransaction.type;
  const newAccountId = data.accountId !== undefined ? data.accountId : oldTransaction.accountId;

  // Revert old balance change from old account
  await updateAccountBalanceAfterTransaction(
    oldTransaction.accountId,
    -oldTransaction.amount,
    oldTransaction.type
  );

  // Apply new balance change to new account (could be same or different)
  await updateAccountBalanceAfterTransaction(
    newAccountId,
    newAmount,
    newType
  );

  return updateDocument(COLLECTIONS.TRANSACTIONS, transactionId, data);
}

// Delete transaction
export async function deleteTransaction(transactionId: string): Promise<void> {
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Revert balance change
  await updateAccountBalanceAfterTransaction(
    transaction.accountId,
    -transaction.amount,
    transaction.type
  );

  return deleteDocument(COLLECTIONS.TRANSACTIONS, transactionId);
}

// Add tag to transaction
export async function addTagToTransaction(
  transactionId: string,
  tagId: string
): Promise<void> {
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const updatedTags = [...new Set([...transaction.tags, tagId])];
  return updateDocument(COLLECTIONS.TRANSACTIONS, transactionId, {
    tags: updatedTags,
  });
}

// Remove tag from transaction
export async function removeTagFromTransaction(
  transactionId: string,
  tagId: string
): Promise<void> {
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const updatedTags = transaction.tags.filter((t) => t !== tagId);
  return updateDocument(COLLECTIONS.TRANSACTIONS, transactionId, {
    tags: updatedTags,
  });
}

// Helper function to update account balance after transaction
async function updateAccountBalanceAfterTransaction(
  accountId: string,
  amount: number,
  type: TransactionType
): Promise<void> {
  const account = await getAccountById(accountId);

  if (!account) {
    throw new Error('Account not found');
  }

  let newBalance = account.currentBalance;

  if (type === TransactionType.INCOME) {
    newBalance += amount;
  } else if (type === TransactionType.EXPENSE) {
    newBalance -= amount;
  }

  await updateAccountBalance(accountId, newBalance);
}

// Get income summary
export async function getIncomeSummary(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const transactions = await getUserTransactions(userId, {
    type: TransactionType.INCOME,
    startDate,
    endDate,
  });

  return transactions.reduce((total, t) => total + t.amount, 0);
}

// Get expense summary
export async function getExpenseSummary(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const transactions = await getUserTransactions(userId, {
    type: TransactionType.EXPENSE,
    startDate,
    endDate,
  });

  return transactions.reduce((total, t) => total + t.amount, 0);
}
