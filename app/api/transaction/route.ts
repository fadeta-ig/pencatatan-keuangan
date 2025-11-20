// Transaction API Routes
// POST /api/transaction - Create new transaction
// GET /api/transaction - List transactions with filters

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  createTransaction,
  getUserTransactions,
  getIncomeSummary,
  getExpenseSummary,
} from '@/lib/services/transaction.service';
import {
  TransactionType,
  FirestoreTransactionInput,
} from '@/types/firestore';
import { toTimestamp } from '@/lib/firestore-helpers';

/**
 * POST /api/transaction
 * Create a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { accountId, categoryId, type, amount, currency, date, notes, tags } = body;

    if (!accountId || typeof accountId !== 'string') {
      return errorResponse('Valid accountId is required');
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return errorResponse('Valid categoryId is required');
    }

    if (!type || !Object.values(TransactionType).includes(type)) {
      return errorResponse('Valid transaction type is required (INCOME or EXPENSE)');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return errorResponse('Amount must be a positive number');
    }

    if (!currency || typeof currency !== 'string') {
      return errorResponse('Currency is required');
    }

    if (!date) {
      return errorResponse('Transaction date is required');
    }

    // Convert date to Timestamp
    let transactionDate;
    try {
      transactionDate = toTimestamp(new Date(date));
    } catch {
      return errorResponse('Invalid date format');
    }

    // Prepare transaction data
    const transactionData: FirestoreTransactionInput = {
      userId: user.uid,
      accountId,
      categoryId,
      type,
      amount,
      currency,
      date: transactionDate,
      notes: notes?.trim() || undefined,
      tags: Array.isArray(tags) ? tags : [],
    };

    // Create transaction
    const transactionId = await createTransaction(transactionData);

    return successResponse(
      {
        success: true,
        data: {
          id: transactionId,
          ...transactionData,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create transaction',
      500
    );
  }
}

/**
 * GET /api/transaction
 * List transactions with optional filters
 * Query params:
 * - type: TransactionType (INCOME or EXPENSE)
 * - accountId: string
 * - categoryId: string
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - limit: number
 * - summary: boolean (returns summary instead of transactions)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as TransactionType | null;
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const limitStr = searchParams.get('limit');
    const summary = searchParams.get('summary') === 'true';

    // Parse dates if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      try {
        startDate = new Date(startDateStr);
      } catch {
        return errorResponse('Invalid startDate format');
      }
    }

    if (endDateStr) {
      try {
        endDate = new Date(endDateStr);
      } catch {
        return errorResponse('Invalid endDate format');
      }
    }

    // Parse limit if provided
    let limit: number | undefined;
    if (limitStr) {
      limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit <= 0) {
        return errorResponse('Limit must be a positive number');
      }
    }

    // If summary is requested, return summary data
    if (summary) {
      const [income, expense] = await Promise.all([
        getIncomeSummary(user.uid, startDate, endDate),
        getExpenseSummary(user.uid, startDate, endDate),
      ]);

      return successResponse({
        success: true,
        data: {
          income,
          expense,
          balance: income - expense,
        },
      });
    }

    // Build filter options
    const options: any = {};

    if (type && Object.values(TransactionType).includes(type)) {
      options.type = type;
    }

    if (accountId) {
      options.accountId = accountId;
    }

    if (categoryId) {
      options.categoryId = categoryId;
    }

    if (startDate) {
      options.startDate = startDate;
    }

    if (endDate) {
      options.endDate = endDate;
    }

    if (limit) {
      options.limit = limit;
    }

    // Get transactions
    const transactions = await getUserTransactions(user.uid, options);

    return successResponse({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch transactions',
      500
    );
  }
}
