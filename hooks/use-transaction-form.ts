'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserAccounts } from '@/lib/services/account.service';
import { getUserCategories } from '@/lib/services/category.service';
import { FirestoreAccount, FirestoreCategory, TransactionType, CategoryType } from '@/types/firestore';

interface UseTransactionFormOptions {
  userId: string | undefined;
  transactionType: TransactionType;
}

interface UseTransactionFormReturn {
  accounts: Array<FirestoreAccount & { id: string }>;
  categories: Array<FirestoreCategory & { id: string }>;
  filteredCategories: Array<FirestoreCategory & { id: string }>;
  loading: boolean;
  error: string | null;
  selectedAccount: (FirestoreAccount & { id: string }) | undefined;
  selectedCategory: (FirestoreCategory & { id: string }) | undefined;
  setSelectedAccountId: (id: string) => void;
  setSelectedCategoryId: (id: string) => void;
}

/**
 * Custom hook for transaction form data with optimized category filtering
 * Automatically filters categories based on transaction type
 */
export function useTransactionForm({
  userId,
  transactionType,
}: UseTransactionFormOptions): UseTransactionFormReturn {
  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [categories, setCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts and categories
  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [accountsData, categoriesData] = await Promise.all([
          getUserAccounts(userId, true),
          getUserCategories(userId, true),
        ]);

        setAccounts(accountsData);
        setCategories(categoriesData);

        // Set default account if available
        if (accountsData.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accountsData[0].id);
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // Memoized filtered categories based on transaction type
  const filteredCategories = useMemo(() => {
    const categoryType = transactionType === TransactionType.INCOME
      ? CategoryType.INCOME
      : CategoryType.EXPENSE;

    return categories.filter(cat => cat.type === categoryType);
  }, [categories, transactionType]);

  // Auto-select first available category when transaction type changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const currentCategory = categories.find(cat => cat.id === selectedCategoryId);
      const categoryType = transactionType === TransactionType.INCOME
        ? CategoryType.INCOME
        : CategoryType.EXPENSE;

      // Reset if current category doesn't match type
      if (!currentCategory || currentCategory.type !== categoryType) {
        setSelectedCategoryId(filteredCategories[0].id);
      }
    } else {
      setSelectedCategoryId('');
    }
  }, [filteredCategories, transactionType, categories, selectedCategoryId]);

  // Memoized selected objects
  const selectedAccount = useMemo(() => {
    return accounts.find(acc => acc.id === selectedAccountId);
  }, [accounts, selectedAccountId]);

  const selectedCategory = useMemo(() => {
    return filteredCategories.find(cat => cat.id === selectedCategoryId);
  }, [filteredCategories, selectedCategoryId]);

  return {
    accounts,
    categories,
    filteredCategories,
    loading,
    error,
    selectedAccount,
    selectedCategory,
    setSelectedAccountId,
    setSelectedCategoryId,
  };
}
