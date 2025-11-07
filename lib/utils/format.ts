import { format as dateFnsFormat } from 'date-fns';

/**
 * Format currency with proper locale and currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(
  value: number,
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format date with custom format
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr);
}

/**
 * Format date to ISO string for database
 */
export function toISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Parse amount from string (remove non-numeric characters)
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
