'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserAccounts, deleteAccount } from '@/lib/services/account.service';
import { FirestoreAccount } from '@/types/firestore';

interface UseAccountsOptions {
  userId: string | undefined;
  activeOnly?: boolean;
}

interface UseAccountsReturn {
  accounts: Array<FirestoreAccount & { id: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  totalBalance: number;
  balanceByCurrency: Record<string, number>;
}

/**
 * Custom hook for fetching and managing accounts with memoization
 * Optimized to prevent unnecessary re-calculations
 */
export function useAccounts({ userId, activeOnly = true }: UseAccountsOptions): UseAccountsReturn {
  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts function
  const fetchAccounts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserAccounts(userId, activeOnly);
      setAccounts(data);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Gagal memuat data rekening. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [userId, activeOnly]);

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Memoized total balance calculation
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  }, [accounts]);

  // Memoized balance by currency calculation
  const balanceByCurrency = useMemo(() => {
    return accounts.reduce((acc, account) => {
      if (!acc[account.currency]) {
        acc[account.currency] = 0;
      }
      acc[account.currency] += account.currentBalance;
      return acc;
    }, {} as Record<string, number>);
  }, [accounts]);

  // Delete account with optimistic update
  const removeAccount = useCallback(async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      // Optimistic update
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      console.error('Error deleting account:', err);
      // Refetch on error to restore state
      await fetchAccounts();
      throw err;
    }
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    removeAccount,
    totalBalance,
    balanceByCurrency,
  };
}
