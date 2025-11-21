/**
 * Export Utilities
 * Functions for exporting data to CSV and other formats
 */

import { formatDate } from './format';

export interface ExportTransaction {
  id: string;
  date: Date;
  type: string;
  category: string;
  account: string;
  amount: number;
  currency: string;
  notes?: string;
}

export interface ExportOptions {
  filename?: string;
  startDate?: Date;
  endDate?: Date;
  includeHeaders?: boolean;
}

/**
 * Convert transactions to CSV string
 */
export function transactionsToCSV(
  transactions: ExportTransaction[],
  options: ExportOptions = {}
): string {
  const { includeHeaders = true } = options;

  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Rekening', 'Jumlah', 'Mata Uang', 'Catatan'];

  const rows = transactions.map((txn) => [
    formatDate(txn.date, 'yyyy-MM-dd'),
    txn.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
    txn.category || '-',
    txn.account || '-',
    txn.amount.toString(),
    txn.currency,
    (txn.notes || '').replace(/"/g, '""'), // Escape quotes
  ]);

  const csvRows = rows.map((row) =>
    row.map((cell) => `"${cell}"`).join(',')
  );

  if (includeHeaders) {
    csvRows.unshift(headers.map((h) => `"${h}"`).join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate filename with date range
 */
export function generateExportFilename(
  prefix: string,
  startDate?: Date,
  endDate?: Date
): string {
  const parts = [prefix];

  if (startDate && endDate) {
    parts.push(formatDate(startDate, 'yyyyMMdd'));
    parts.push(formatDate(endDate, 'yyyyMMdd'));
  } else {
    parts.push(formatDate(new Date(), 'yyyyMMdd'));
  }

  return parts.join('_') + '.csv';
}

/**
 * Export summary data to CSV
 */
export interface ExportSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  currency: string;
  period: string;
}

export function summaryToCSV(summary: ExportSummary): string {
  const rows = [
    ['Ringkasan Keuangan', ''],
    ['Periode', summary.period],
    ['Mata Uang', summary.currency],
    ['', ''],
    ['Total Pemasukan', summary.totalIncome.toString()],
    ['Total Pengeluaran', summary.totalExpense.toString()],
    ['Pendapatan Bersih', summary.netIncome.toString()],
    ['Jumlah Transaksi', summary.transactionCount.toString()],
  ];

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}
