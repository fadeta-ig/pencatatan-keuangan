// Transfer API Routes
// POST /api/transfer - Create new transfer
// GET /api/transfer - List transfers

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  createTransfer,
  getUserTransfers,
} from '@/lib/services/transfer.service';
import { getAccountById } from '@/lib/services/account.service';
import { FirestoreTransferInput } from '@/types/firestore';
import { toTimestamp } from '@/lib/firestore-helpers';

/**
 * POST /api/transfer
 * Create a new transfer between accounts
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { fromAccountId, toAccountId, amount, date, notes, exchangeRate } = body;

    if (!fromAccountId || typeof fromAccountId !== 'string') {
      return errorResponse('Source account ID is required');
    }

    if (!toAccountId || typeof toAccountId !== 'string') {
      return errorResponse('Destination account ID is required');
    }

    if (fromAccountId === toAccountId) {
      return errorResponse('Cannot transfer to the same account');
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return errorResponse('Amount must be a positive number');
    }

    if (!date) {
      return errorResponse('Date is required');
    }

    // Get both accounts to verify ownership and get currency
    const [fromAccount, toAccount] = await Promise.all([
      getAccountById(fromAccountId),
      getAccountById(toAccountId),
    ]);

    if (!fromAccount) {
      return errorResponse('Source account not found', 404);
    }

    if (!toAccount) {
      return errorResponse('Destination account not found', 404);
    }

    // Verify ownership
    if (fromAccount.userId !== user.uid || toAccount.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own one or both accounts', 403);
    }

    // Check if source account has sufficient balance
    if (fromAccount.currentBalance < amount) {
      return errorResponse('Insufficient balance in source account');
    }

    // Calculate converted amount for multi-currency transfers
    let convertedAmount = amount;
    let finalExchangeRate = exchangeRate;

    if (fromAccount.currency !== toAccount.currency) {
      if (!exchangeRate || exchangeRate <= 0) {
        return errorResponse('Exchange rate is required for multi-currency transfers');
      }
      convertedAmount = amount * exchangeRate;
    } else {
      // Same currency, no conversion needed
      finalExchangeRate = undefined;
      convertedAmount = amount;
    }

    // Prepare transfer data
    const transferData: FirestoreTransferInput = {
      userId: user.uid,
      fromAccountId,
      toAccountId,
      amount,
      currency: fromAccount.currency,
      date: toTimestamp(new Date(date)),
      notes: notes?.trim() || undefined,
      exchangeRate: finalExchangeRate,
      convertedAmount: fromAccount.currency !== toAccount.currency ? convertedAmount : undefined,
    };

    // Create transfer (this will also update account balances)
    const transferId = await createTransfer(transferData);

    return successResponse(
      {
        success: true,
        data: {
          id: transferId,
          ...transferData,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating transfer:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create transfer',
      500
    );
  }
}

/**
 * GET /api/transfer
 * List transfers with optional filters
 * Query params:
 * - accountId: Filter by account (shows transfers from or to this account)
 * - startDate: Filter by start date
 * - endDate: Filter by end date
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const options: any = {};

    if (startDate) {
      options.startDate = new Date(startDate);
    }

    if (endDate) {
      options.endDate = new Date(endDate);
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        options.limit = limitNum;
      }
    }

    let transfers;

    if (accountId) {
      // Verify account ownership
      const account = await getAccountById(accountId);
      if (!account) {
        return errorResponse('Account not found', 404);
      }
      if (account.userId !== user.uid) {
        return errorResponse('Forbidden: You do not own this account', 403);
      }

      // Get transfers for specific account (not implemented in service yet, using getUserTransfers)
      transfers = await getUserTransfers(user.uid, options);
      // Filter client-side for specific account
      transfers = transfers.filter(
        (t) => t.fromAccountId === accountId || t.toAccountId === accountId
      );
    } else {
      // Get all user transfers
      transfers = await getUserTransfers(user.uid, options);
    }

    return successResponse({
      success: true,
      data: transfers,
      count: transfers.length,
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch transfers',
      500
    );
  }
}
