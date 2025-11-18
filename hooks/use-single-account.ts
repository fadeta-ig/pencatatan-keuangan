'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAccountById } from '@/lib/services/account.service';
import { FirestoreAccount } from '@/types/firestore';

interface UseSingleAccountOptions {
  accountId: string | undefined;
  userId: string | undefined;
}

interface UseSingleAccountReturn {
  account: (FirestoreAccount & { id: string }) | null;
  loading: boolean;
  error: string | null;
  balanceChange: number;
  balanceChangePercentage: string;
  isPositive: boolean;
}

/**
 * Custom hook for fetching a single account with computed values
 * Includes memoized calculations for balance changes
 */
export function useSingleAccount({ accountId, userId }: UseSingleAccountOptions): UseSingleAccountReturn {
  const [account, setAccount] = useState<(FirestoreAccount & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      if (!accountId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAccountById(accountId);

        if (!data) {
          setError('Rekening tidak ditemukan');
          return;
        }

        if (data.userId !== userId) {
          setError('Anda tidak memiliki akses ke rekening ini');
          return;
        }

        setAccount(data);
      } catch (err) {
        console.error('Error loading account:', err);
        setError('Gagal memuat data rekening. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [accountId, userId]);

  // Memoized balance calculations
  const balanceChange = useMemo(() => {
    if (!account) return 0;
    return account.currentBalance - account.initialBalance;
  }, [account]);

  const balanceChangePercentage = useMemo(() => {
    if (!account || account.initialBalance === 0) return '0';
    return ((balanceChange / account.initialBalance) * 100).toFixed(2);
  }, [account, balanceChange]);

  const isPositive = useMemo(() => balanceChange >= 0, [balanceChange]);

  return {
    account,
    loading,
    error,
    balanceChange,
    balanceChangePercentage,
    isPositive,
  };
}
