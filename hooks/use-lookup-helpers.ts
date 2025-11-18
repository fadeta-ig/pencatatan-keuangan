'use client';

import { useMemo, useCallback } from 'react';
import { FirestoreAccount, FirestoreCategory } from '@/types/firestore';

interface UseLookupHelpersOptions {
  accounts: Array<FirestoreAccount & { id: string }>;
  categories: Array<FirestoreCategory & { id: string }>;
}

interface UseLookupHelpersReturn {
  getAccountName: (accountId: string) => string;
  getCategoryName: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;
  accountsMap: Map<string, FirestoreAccount & { id: string }>;
  categoriesMap: Map<string, FirestoreCategory & { id: string }>;
}

/**
 * Custom hook for efficient lookup of account and category data
 * Uses Map for O(1) lookups instead of O(n) array searches
 */
export function useLookupHelpers({
  accounts,
  categories,
}: UseLookupHelpersOptions): UseLookupHelpersReturn {
  // Create memoized Maps for O(1) lookups
  const accountsMap = useMemo(() => {
    return new Map(accounts.map(acc => [acc.id, acc]));
  }, [accounts]);

  const categoriesMap = useMemo(() => {
    return new Map(categories.map(cat => [cat.id, cat]));
  }, [categories]);

  // Memoized lookup functions
  const getAccountName = useCallback((accountId: string): string => {
    return accountsMap.get(accountId)?.name || 'Unknown';
  }, [accountsMap]);

  const getCategoryName = useCallback((categoryId: string): string => {
    return categoriesMap.get(categoryId)?.name || 'Unknown';
  }, [categoriesMap]);

  const getCategoryColor = useCallback((categoryId: string): string => {
    return categoriesMap.get(categoryId)?.color || '#94a3b8';
  }, [categoriesMap]);

  return {
    getAccountName,
    getCategoryName,
    getCategoryColor,
    accountsMap,
    categoriesMap,
  };
}
