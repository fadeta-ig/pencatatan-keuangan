// Tag Service
// Handles all tag-related Firestore operations

import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryUserDocuments,
} from '../firestore-helpers';
import { COLLECTIONS, FirestoreTag, FirestoreTagInput } from '@/types/firestore';

// Create a new tag
export async function createTag(data: FirestoreTagInput): Promise<string> {
  return createDocument(COLLECTIONS.TAGS, data);
}

// Get tag by ID
export async function getTagById(
  tagId: string
): Promise<(FirestoreTag & { id: string }) | null> {
  return getDocument<FirestoreTag>(COLLECTIONS.TAGS, tagId);
}

// Get all tags for a user
export async function getUserTags(
  userId: string
): Promise<Array<FirestoreTag & { id: string }>> {
  return queryUserDocuments<FirestoreTag>(COLLECTIONS.TAGS, userId, {
    orderBy: [{ field: 'name', direction: 'asc' }],
  });
}

// Get tag by name
export async function getTagByName(
  userId: string,
  name: string
): Promise<(FirestoreTag & { id: string }) | null> {
  const tags = await queryUserDocuments<FirestoreTag>(COLLECTIONS.TAGS, userId, {
    where: [{ field: 'name', operator: '==', value: name }],
    limit: 1,
  });

  return tags.length > 0 ? tags[0] : null;
}

// Update tag
export async function updateTag(
  tagId: string,
  data: Partial<Omit<FirestoreTagInput, 'userId'>>
): Promise<void> {
  return updateDocument(COLLECTIONS.TAGS, tagId, data);
}

// Delete tag
export async function deleteTag(tagId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.TAGS, tagId);
}

// Check if tag name exists
export async function tagNameExists(
  userId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const tag = await getTagByName(userId, name);

  if (!tag) {
    return false;
  }

  // If we're excluding a specific ID (for updates), check if it's the same tag
  if (excludeId && tag.id === excludeId) {
    return false;
  }

  return true;
}
