/**
 * Application Constants
 */

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
} as const;

// Account Types
export const ACCOUNT_TYPES = {
  BANK: 'bank',
  CASH: 'cash',
  E_WALLET: 'e_wallet',
  INVESTMENT: 'investment',
  CREDIT_CARD: 'credit_card',
  OTHER: 'other',
} as const;

// Currency
export const DEFAULT_CURRENCY = 'IDR';
export const SUPPORTED_CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'] as const;

// Date Ranges (for quick filters)
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const;

// Category Colors (for UI)
export const CATEGORY_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#06B6D4', // cyan
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// App Metadata
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pencatatan Keuangan';
export const APP_DESCRIPTION = 'Aplikasi pencatatan keuangan pribadi dan bisnis';
