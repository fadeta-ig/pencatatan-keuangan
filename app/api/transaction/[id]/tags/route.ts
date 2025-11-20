// Transaction Tags API Routes
// POST /api/transaction/[id]/tags - Add tag to transaction

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  getTransactionById,
  addTagToTransaction,
} from '@/lib/services/transaction.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/transaction/[id]/tags
 * Add a tag to a transaction
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: transactionId } = await params;

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

    if (!body.tagId || typeof body.tagId !== 'string') {
      return errorResponse('Valid tagId is required');
    }

    // Add tag to transaction
    await addTagToTransaction(transactionId, body.tagId);

    // Get updated transaction
    const updatedTransaction = await getTransactionById(transactionId);

    return successResponse({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Error adding tag to transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to add tag to transaction',
      500
    );
  }
}
