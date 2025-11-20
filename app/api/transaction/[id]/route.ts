// Transaction API Routes (Single Transaction)
// GET /api/transaction/[id] - Get transaction by ID
// PATCH /api/transaction/[id] - Update transaction
// DELETE /api/transaction/[id] - Delete transaction

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '@/lib/services/transaction.service';
import { TransactionType } from '@/types/firestore';
import { toTimestamp } from '@/lib/firestore-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/transaction/[id]
 * Get a specific transaction by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const transactionId = params.id;

    // Get transaction
    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Verify ownership
    if (transaction.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transaction', 403);
    }

    return successResponse({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch transaction',
      500
    );
  }
}

/**
 * PATCH /api/transaction/[id]
 * Update a transaction
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const transactionId = params.id;

    // Get existing transaction
    const existingTransaction = await getTransactionById(transactionId);

    if (!existingTransaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Verify ownership
    if (existingTransaction.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transaction', 403);
    }

    // Parse request body
    const body = await request.json();

    // Validate and prepare update data
    const updateData: any = {};

    if (body.accountId !== undefined) {
      if (typeof body.accountId !== 'string' || body.accountId.trim().length === 0) {
        return errorResponse('accountId must be a non-empty string');
      }
      updateData.accountId = body.accountId;
    }

    if (body.categoryId !== undefined) {
      if (typeof body.categoryId !== 'string' || body.categoryId.trim().length === 0) {
        return errorResponse('categoryId must be a non-empty string');
      }
      updateData.categoryId = body.categoryId;
    }

    if (body.type !== undefined) {
      if (!Object.values(TransactionType).includes(body.type)) {
        return errorResponse('Invalid transaction type');
      }
      updateData.type = body.type;
    }

    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount <= 0) {
        return errorResponse('Amount must be a positive number');
      }
      updateData.amount = body.amount;
    }

    if (body.currency !== undefined) {
      if (typeof body.currency !== 'string' || body.currency.trim().length === 0) {
        return errorResponse('Currency must be a non-empty string');
      }
      updateData.currency = body.currency;
    }

    if (body.date !== undefined) {
      try {
        updateData.date = toTimestamp(new Date(body.date));
      } catch {
        return errorResponse('Invalid date format');
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || undefined;
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return errorResponse('Tags must be an array');
      }
      updateData.tags = body.tags;
    }

    if (body.attachmentUrl !== undefined) {
      updateData.attachmentUrl = body.attachmentUrl || undefined;
    }

    if (body.attachmentMeta !== undefined) {
      updateData.attachmentMeta = body.attachmentMeta || undefined;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update');
    }

    // Update transaction
    await updateTransaction(transactionId, updateData);

    // Get updated transaction
    const updatedTransaction = await getTransactionById(transactionId);

    return successResponse({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update transaction',
      500
    );
  }
}

/**
 * DELETE /api/transaction/[id]
 * Delete a transaction (hard delete with balance reversal)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const transactionId = params.id;

    // Get existing transaction
    const existingTransaction = await getTransactionById(transactionId);

    if (!existingTransaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Verify ownership
    if (existingTransaction.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transaction', 403);
    }

    // Delete transaction (service will handle balance reversal)
    await deleteTransaction(transactionId);

    return successResponse({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete transaction',
      500
    );
  }
}
