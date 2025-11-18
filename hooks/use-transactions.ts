'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserTransactions, deleteTransaction } from '@/lib/services/transaction.service';
import { FirestoreTransaction, TransactionType } from '@/types/firestore';

interface UseTransactionsOptions {
  userId: string | undefined;
  filterType?: TransactionType | 'ALL';
  filterAccountId?: string;
  filterCategoryId?: string;
  searchQuery?: string;
}

interface UseTransactionsReturn {
  transactions: Array<FirestoreTransaction & { id: string }>;
  filteredTransactions: Array<FirestoreTransaction & { id: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeTransaction: (transactionId: string) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

/**
 * Custom hook for fetching and managing transactions with memoization
 * Includes filtering and summary calculations
 */
export function useTransactions({
  userId,
  filterType = 'ALL',
  filterAccountId = 'ALL',
  filterCategoryId = 'ALL',
  searchQuery = '',
}: UseTransactionsOptions): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Array<FirestoreTransaction & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions function
  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserTransactions(userId);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filter by type
      if (filterType !== 'ALL' && transaction.type !== filterType) {
        return false;
      }

      // Filter by account
      if (filterAccountId !== 'ALL' && transaction.accountId !== filterAccountId) {
        return false;
      }

      // Filter by category
      if (filterCategoryId !== 'ALL' && transaction.categoryId !== filterCategoryId) {
        return false;
      }

      // Filter by search query (notes)
      if (searchQuery && !transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [transactions, filterType, filterAccountId, filterCategoryId, searchQuery]);

  // Memoized summary calculations
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netBalance = useMemo(() => {
    return totalIncome - totalExpense;
  }, [totalIncome, totalExpense]);

  // Delete transaction with optimistic update
  const removeTransaction = useCallback(async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      // Optimistic update
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      // Refetch on error to restore state
      await fetchTransactions();
      throw err;
    }
  }, [fetchTransactions]);

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    refetch: fetchTransactions,
    removeTransaction,
    totalIncome,
    totalExpense,
    netBalance,
  };
}
