/**
 * Global TypeScript Types
 */

import { TRANSACTION_TYPES, ACCOUNT_TYPES } from '@/constants';

// Type helpers
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];

// Common types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface DateRangeFilter {
  from: Date;
  to: Date;
}

export interface FilterParams {
  dateRange?: DateRangeFilter;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
}

// Dashboard types
export interface BalanceSummary {
  accountId: string;
  accountName: string;
  balance: number;
  currency: string;
}

export interface IncomeSummary {
  total: number;
  count: number;
  currency: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  currency: string;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
  net: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form state types
export interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
