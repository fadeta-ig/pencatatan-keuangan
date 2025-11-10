// Transfer Service
// Handles all transfer-related Firestore operations

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
  FirestoreTransfer,
  FirestoreTransferInput,
} from '@/types/firestore';
import { updateAccountBalance, getAccountById } from './account.service';

// Create a new transfer and update account balances
export async function createTransfer(
  data: FirestoreTransferInput
): Promise<string> {
  const transferId = await createDocument(COLLECTIONS.TRANSFERS, data);

  // Update account balances
  await updateAccountBalancesAfterTransfer(
    data.fromAccountId,
    data.toAccountId,
    data.amount,
    data.convertedAmount || data.amount
  );

  return transferId;
}

// Get transfer by ID
export async function getTransferById(
  transferId: string
): Promise<(FirestoreTransfer & { id: string }) | null> {
  return getDocument<FirestoreTransfer>(COLLECTIONS.TRANSFERS, transferId);
}

// Get all transfers for a user
export async function getUserTransfers(
  userId: string,
  options?: {
    accountId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<Array<FirestoreTransfer & { id: string }>> {
  const whereConditions: Array<{
    field: string;
    operator: any;
    value: any;
  }> = [];

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

  return queryUserDocuments<FirestoreTransfer>(COLLECTIONS.TRANSFERS, userId, {
    where: whereConditions,
    orderBy: [{ field: 'date', direction: 'desc' }],
    limit: options?.limit,
  });
}

// Get transfers for a specific account
export async function getAccountTransfers(
  userId: string,
  accountId: string
): Promise<Array<FirestoreTransfer & { id: string }>> {
  // Get transfers where account is either sender or receiver
  const transfersFrom = await queryUserDocuments<FirestoreTransfer>(
    COLLECTIONS.TRANSFERS,
    userId,
    {
      where: [{ field: 'fromAccountId', operator: '==', value: accountId }],
      orderBy: [{ field: 'date', direction: 'desc' }],
    }
  );

  const transfersTo = await queryUserDocuments<FirestoreTransfer>(
    COLLECTIONS.TRANSFERS,
    userId,
    {
      where: [{ field: 'toAccountId', operator: '==', value: accountId }],
      orderBy: [{ field: 'date', direction: 'desc' }],
    }
  );

  // Combine and sort by date
  const allTransfers = [...transfersFrom, ...transfersTo];
  allTransfers.sort((a, b) => {
    return b.date.toMillis() - a.date.toMillis();
  });

  return allTransfers;
}

// Update transfer
export async function updateTransfer(
  transferId: string,
  data: Partial<Omit<FirestoreTransferInput, 'userId'>>
): Promise<void> {
  const oldTransfer = await getTransferById(transferId);

  if (!oldTransfer) {
    throw new Error('Transfer not found');
  }

  // Revert old balance changes
  await updateAccountBalancesAfterTransfer(
    oldTransfer.fromAccountId,
    oldTransfer.toAccountId,
    -oldTransfer.amount,
    -(oldTransfer.convertedAmount || oldTransfer.amount)
  );

  // Apply new balance changes
  const newAmount = data.amount || oldTransfer.amount;
  const newConvertedAmount =
    data.convertedAmount || data.amount || oldTransfer.convertedAmount || oldTransfer.amount;

  await updateAccountBalancesAfterTransfer(
    data.fromAccountId || oldTransfer.fromAccountId,
    data.toAccountId || oldTransfer.toAccountId,
    newAmount,
    newConvertedAmount
  );

  return updateDocument(COLLECTIONS.TRANSFERS, transferId, data);
}

// Delete transfer
export async function deleteTransfer(transferId: string): Promise<void> {
  const transfer = await getTransferById(transferId);

  if (!transfer) {
    throw new Error('Transfer not found');
  }

  // Revert balance changes
  await updateAccountBalancesAfterTransfer(
    transfer.fromAccountId,
    transfer.toAccountId,
    -transfer.amount,
    -(transfer.convertedAmount || transfer.amount)
  );

  return deleteDocument(COLLECTIONS.TRANSFERS, transferId);
}

// Helper function to update account balances after transfer
async function updateAccountBalancesAfterTransfer(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  convertedAmount: number
): Promise<void> {
  const fromAccount = await getAccountById(fromAccountId);
  const toAccount = await getAccountById(toAccountId);

  if (!fromAccount || !toAccount) {
    throw new Error('One or both accounts not found');
  }

  // Deduct from source account
  await updateAccountBalance(fromAccountId, fromAccount.currentBalance - amount);

  // Add to destination account
  await updateAccountBalance(
    toAccountId,
    toAccount.currentBalance + convertedAmount
  );
}
