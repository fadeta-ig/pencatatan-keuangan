'use client';

import { useState, useEffect, useCallback } from 'react';
import { FirestoreTransfer } from '@/types/firestore';
import { getUserTransfers, deleteTransfer } from '@/lib/services/transfer.service';

interface UseTransfersOptions {
  userId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface UseTransfersReturn {
  transfers: Array<FirestoreTransfer & { id: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeTransfer: (transferId: string) => Promise<void>;
}

export function useTransfers(options: UseTransfersOptions = {}): UseTransfersReturn {
  const { userId, accountId, startDate, endDate, limit } = options;
  const [transfers, setTransfers] = useState<Array<FirestoreTransfer & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    if (!userId) {
      setTransfers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchOptions: {
        accountId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
      } = {};

      if (startDate) fetchOptions.startDate = startDate;
      if (endDate) fetchOptions.endDate = endDate;
      if (limit) fetchOptions.limit = limit;

      let data = await getUserTransfers(userId, fetchOptions);

      // Filter by account if specified
      if (accountId) {
        data = data.filter(
          (transfer) =>
            transfer.fromAccountId === accountId || transfer.toAccountId === accountId
        );
      }

      setTransfers(data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data transfer');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, accountId, startDate, endDate, limit]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const removeTransfer = useCallback(async (transferId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await deleteTransfer(transferId);

    // Update local state
    setTransfers((prev) => prev.filter((transfer) => transfer.id !== transferId));
  }, [userId]);

  return {
    transfers,
    loading,
    error,
    refetch: fetchTransfers,
    removeTransfer,
  };
}
