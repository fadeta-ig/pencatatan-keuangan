// Category API Routes (Single Category)
// GET /api/category/[id] - Get category by ID
// PATCH /api/category/[id] - Update category
// DELETE /api/category/[id] - Delete category

import { NextRequest } from 'next/server';
import { verifyAuth, errorResponse, successResponse } from '@/lib/auth/api-auth';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  categoryNameExists,
} from '@/lib/services/category.service';
import { CategoryType } from '@/types/firestore';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/category/[id]
 * Get a specific category by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: categoryId } = await params;

    // Get category
    const category = await getCategoryById(categoryId);

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // Verify ownership
    if (category.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this category', 403);
    }

    return successResponse({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch category',
      500
    );
  }
}

/**
 * PATCH /api/category/[id]
 * Update a category
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: categoryId } = await params;

    // Get existing category
    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return errorResponse('Category not found', 404);
    }

    // Verify ownership
    if (existingCategory.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this category', 403);
    }

    // Parse request body
    const body = await request.json();

    // Validate and prepare update data
    const updateData: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return errorResponse('Category name must be a non-empty string');
      }

      // Check if the new name conflicts with existing categories
      const trimmedName = body.name.trim();
      if (trimmedName !== existingCategory.name) {
        const exists = await categoryNameExists(
          user.uid,
          trimmedName,
          existingCategory.type,
          categoryId
        );
        if (exists) {
          return errorResponse(
            `Category "${trimmedName}" already exists for ${existingCategory.type.toLowerCase()} type`
          );
        }
      }

      updateData.name = trimmedName;
    }

    if (body.type !== undefined) {
      if (!Object.values(CategoryType).includes(body.type)) {
        return errorResponse('Invalid category type');
      }

      // If type is changing, check for name conflicts in new type
      if (body.type !== existingCategory.type) {
        const nameToCheck = updateData.name || existingCategory.name;
        const exists = await categoryNameExists(
          user.uid,
          nameToCheck,
          body.type,
          categoryId
        );
        if (exists) {
          return errorResponse(
            `Category "${nameToCheck}" already exists for ${body.type.toLowerCase()} type`
          );
        }
      }

      updateData.type = body.type;
    }

    if (body.color !== undefined) {
      updateData.color = body.color || undefined;
    }

    if (body.icon !== undefined) {
      updateData.icon = body.icon || undefined;
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || undefined;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') {
        return errorResponse('isActive must be a boolean');
      }
      updateData.isActive = body.isActive;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update');
    }

    // Update category
    await updateCategory(categoryId, updateData);

    // Get updated category
    const updatedCategory = await getCategoryById(categoryId);

    return successResponse({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update category',
      500
    );
  }
}

/**
 * DELETE /api/category/[id]
 * Soft delete a category
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);

    const { id: categoryId } = await params;

    // Get existing category
    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
      return errorResponse('Category not found', 404);
    }

    // Verify ownership
    if (existingCategory.userId !== user.uid) {
      return errorResponse('Forbidden: You do not own this category', 403);
    }

    // Soft delete category
    await deleteCategory(categoryId);

    return successResponse({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete category',
      500
    );
  }
}
