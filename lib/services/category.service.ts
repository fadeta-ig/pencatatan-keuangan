// Category Service
// Handles all category-related Firestore operations

import {
  createDocument,
  getDocument,
  updateDocument,
  queryUserDocuments,
  softDeleteDocument,
  restoreDocument,
} from '../firestore-helpers';
import {
  COLLECTIONS,
  FirestoreCategory,
  FirestoreCategoryInput,
  CategoryType,
} from '@/types/firestore';

// Create a new category
export async function createCategory(
  data: FirestoreCategoryInput
): Promise<string> {
  return createDocument(COLLECTIONS.CATEGORIES, data);
}

// Get category by ID
export async function getCategoryById(
  categoryId: string
): Promise<(FirestoreCategory & { id: string }) | null> {
  return getDocument<FirestoreCategory>(COLLECTIONS.CATEGORIES, categoryId);
}

// Get all categories for a user
export async function getUserCategories(
  userId: string,
  activeOnly: boolean = true
): Promise<Array<FirestoreCategory & { id: string }>> {
  const whereConditions = activeOnly
    ? [{ field: 'isActive', operator: '==' as const, value: true }]
    : [];

  return queryUserDocuments<FirestoreCategory>(COLLECTIONS.CATEGORIES, userId, {
    where: whereConditions,
    orderBy: [{ field: 'name', direction: 'asc' }],
  });
}

// Get categories by type
export async function getCategoriesByType(
  userId: string,
  type: CategoryType
): Promise<Array<FirestoreCategory & { id: string }>> {
  return queryUserDocuments<FirestoreCategory>(COLLECTIONS.CATEGORIES, userId, {
    where: [
      { field: 'type', operator: '==', value: type },
      { field: 'isActive', operator: '==', value: true },
    ],
    orderBy: [{ field: 'name', direction: 'asc' }],
  });
}

// Get category by name and type
export async function getCategoryByName(
  userId: string,
  name: string,
  type: CategoryType
): Promise<(FirestoreCategory & { id: string }) | null> {
  const categories = await queryUserDocuments<FirestoreCategory>(
    COLLECTIONS.CATEGORIES,
    userId,
    {
      where: [
        { field: 'name', operator: '==', value: name },
        { field: 'type', operator: '==', value: type },
      ],
      limit: 1,
    }
  );

  return categories.length > 0 ? categories[0] : null;
}

// Update category
export async function updateCategory(
  categoryId: string,
  data: Partial<Omit<FirestoreCategoryInput, 'userId'>>
): Promise<void> {
  return updateDocument(COLLECTIONS.CATEGORIES, categoryId, data);
}

// Soft delete category
export async function deleteCategory(categoryId: string): Promise<void> {
  return softDeleteDocument(COLLECTIONS.CATEGORIES, categoryId);
}

// Restore deleted category
export async function restoreCategory(categoryId: string): Promise<void> {
  return restoreDocument(COLLECTIONS.CATEGORIES, categoryId);
}

// Check if category name exists
export async function categoryNameExists(
  userId: string,
  name: string,
  type: CategoryType,
  excludeId?: string
): Promise<boolean> {
  const category = await getCategoryByName(userId, name, type);

  if (!category) {
    return false;
  }

  // If we're excluding a specific ID (for updates), check if it's the same category
  if (excludeId && category.id === excludeId) {
    return false;
  }

  return true;
}
