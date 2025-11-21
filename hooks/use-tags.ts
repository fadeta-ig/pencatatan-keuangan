'use client';

import { useState, useEffect, useCallback } from 'react';
import { FirestoreTag } from '@/types/firestore';
import {
  getUserTags,
  createTag,
  updateTag,
  deleteTag,
  tagNameExists,
} from '@/lib/services/tag.service';

interface UseTagsOptions {
  userId?: string;
}

interface UseTagsReturn {
  tags: Array<FirestoreTag & { id: string }>;
  loading: boolean;
  error: string | null;
  addTag: (name: string, color?: string) => Promise<string>;
  editTag: (tagId: string, data: { name?: string; color?: string }) => Promise<void>;
  removeTag: (tagId: string) => Promise<void>;
  refreshTags: () => Promise<void>;
  getTagById: (tagId: string) => (FirestoreTag & { id: string }) | undefined;
  getTagsByIds: (tagIds: string[]) => Array<FirestoreTag & { id: string }>;
}

export function useTags({ userId }: UseTagsOptions): UseTagsReturn {
  const [tags, setTags] = useState<Array<FirestoreTag & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    if (!userId) {
      setTags([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserTags(userId);
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Gagal memuat tags');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Add new tag
  const addTag = useCallback(async (name: string, color?: string): Promise<string> => {
    if (!userId) throw new Error('User ID is required');

    // Check if name exists
    const exists = await tagNameExists(userId, name);
    if (exists) {
      throw new Error(`Tag "${name}" sudah ada`);
    }

    const tagId = await createTag({
      userId,
      name: name.trim(),
      color: color || '#6366F1',
    });

    // Refresh tags list
    await fetchTags();
    return tagId;
  }, [userId, fetchTags]);

  // Edit tag
  const editTag = useCallback(async (tagId: string, data: { name?: string; color?: string }) => {
    if (!userId) throw new Error('User ID is required');

    // Check if name exists (excluding current tag)
    if (data.name) {
      const exists = await tagNameExists(userId, data.name, tagId);
      if (exists) {
        throw new Error(`Tag "${data.name}" sudah ada`);
      }
    }

    await updateTag(tagId, data);
    await fetchTags();
  }, [userId, fetchTags]);

  // Remove tag
  const removeTag = useCallback(async (tagId: string) => {
    await deleteTag(tagId);
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  }, []);

  // Get tag by ID
  const getTagById = useCallback((tagId: string) => {
    return tags.find((t) => t.id === tagId);
  }, [tags]);

  // Get tags by IDs
  const getTagsByIds = useCallback((tagIds: string[]) => {
    return tags.filter((t) => tagIds.includes(t.id));
  }, [tags]);

  return {
    tags,
    loading,
    error,
    addTag,
    editTag,
    removeTag,
    refreshTags: fetchTags,
    getTagById,
    getTagsByIds,
  };
}
