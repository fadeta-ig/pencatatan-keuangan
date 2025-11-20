'use client';

import { useState, useEffect, useCallback } from 'react';
import { FirestoreCategory, CategoryType } from '@/types/firestore';
import {
  getUserCategories,
  getCategoriesByType,
  deleteCategory,
} from '@/lib/services/category.service';

interface UseCategoriesOptions {
  userId?: string;
  type?: CategoryType;
  activeOnly?: boolean;
}

interface UseCategoriesReturn {
  categories: Array<FirestoreCategory & { id: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const { userId, type, activeOnly = true } = options;
  const [categories, setCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: Array<FirestoreCategory & { id: string }>;

      if (type) {
        // Fetch by type
        data = await getCategoriesByType(userId, type);
      } else {
        // Fetch all user categories
        data = await getUserCategories(userId, activeOnly);
      }

      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data kategori');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [userId, type, activeOnly]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const removeCategory = useCallback(async (categoryId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await deleteCategory(categoryId);

    // Update local state
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  }, [userId]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    removeCategory,
  };
}
