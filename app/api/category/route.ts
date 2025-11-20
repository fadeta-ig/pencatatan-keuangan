// Category API Routes
// POST /api/category - Create new category
// GET /api/category - List categories

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  createCategory,
  getUserCategories,
  getCategoriesByType,
  categoryNameExists,
} from '@/lib/services/category.service';
import { CategoryType, FirestoreCategoryInput } from '@/types/firestore';

/**
 * POST /api/category
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { name, type, color, icon, description, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse('Category name is required');
    }

    if (!type || !Object.values(CategoryType).includes(type)) {
      return errorResponse('Valid category type is required (INCOME or EXPENSE)');
    }

    // Check if category name already exists for this user and type
    const exists = await categoryNameExists(user.uid, name.trim(), type);
    if (exists) {
      return errorResponse(
        `Category "${name}" already exists for ${type.toLowerCase()} type`
      );
    }

    // Prepare category data
    const categoryData: FirestoreCategoryInput = {
      userId: user.uid,
      name: name.trim(),
      type,
      color: color || undefined,
      icon: icon || undefined,
      description: description?.trim() || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    };

    // Create category
    const categoryId = await createCategory(categoryData);

    return successResponse(
      {
        success: true,
        data: {
          id: categoryId,
          ...categoryData,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create category',
      500
    );
  }
}

/**
 * GET /api/category
 * List categories with optional filters
 * Query params:
 * - type: CategoryType (INCOME or EXPENSE)
 * - activeOnly: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as CategoryType | null;
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // default true

    let categories;

    if (type && Object.values(CategoryType).includes(type)) {
      // Get categories by type
      categories = await getCategoriesByType(user.uid, type);
    } else {
      // Get all user categories
      categories = await getUserCategories(user.uid, activeOnly);
    }

    return successResponse({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch categories',
      500
    );
  }
}
