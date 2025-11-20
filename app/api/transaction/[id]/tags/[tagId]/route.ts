// Transaction Tags API Routes (Single Tag)
// DELETE /api/transaction/[id]/tags/[tagId] - Remove tag from transaction

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  getTransactionById,
  removeTagFromTransaction,
} from '@/lib/services/transaction.service';

interface RouteParams {
  params: {
    id: string;
    tagId: string;
  };
}

/**
 * DELETE /api/transaction/[id]/tags/[tagId]
 * Remove a tag from a transaction
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: transactionId, tagId } = params;

    // Get existing transaction
    const existingTransaction = await getTransactionById(transactionId);

    if (!existingTransaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Verify ownership
    if (existingTransaction.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transaction', 403);
    }

    // Remove tag from transaction
    await removeTagFromTransaction(transactionId, tagId);

    // Get updated transaction
    const updatedTransaction = await getTransactionById(transactionId);

    return successResponse({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Error removing tag from transaction:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to remove tag from transaction',
      500
    );
  }
}
