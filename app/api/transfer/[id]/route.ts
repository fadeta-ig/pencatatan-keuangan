// Transfer API Routes (Single Transfer)
// GET /api/transfer/[id] - Get transfer by ID
// DELETE /api/transfer/[id] - Delete transfer

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  getTransferById,
  deleteTransfer,
} from '@/lib/services/transfer.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/transfer/[id]
 * Get a specific transfer by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: transferId } = await params;

    // Get transfer
    const transfer = await getTransferById(transferId);

    if (!transfer) {
      return errorResponse('Transfer not found', 404);
    }

    // Verify ownership
    if (transfer.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transfer', 403);
    }

    return successResponse({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.error('Error fetching transfer:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch transfer',
      500
    );
  }
}

/**
 * DELETE /api/transfer/[id]
 * Delete a transfer (and revert account balances)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: transferId } = await params;

    // Get existing transfer
    const existingTransfer = await getTransferById(transferId);

    if (!existingTransfer) {
      return errorResponse('Transfer not found', 404);
    }

    // Verify ownership
    if (existingTransfer.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this transfer', 403);
    }

    // Delete transfer (this will also revert balance changes)
    await deleteTransfer(transferId);

    return successResponse({
      success: true,
      message: 'Transfer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transfer:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete transfer',
      500
    );
  }
}
