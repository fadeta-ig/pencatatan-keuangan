/**
 * Export Transactions API
 * GET /api/export/transactions - Export transactions to CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/api-auth';
import { getUserTransactions } from '@/lib/services/transaction.service';
import { getUserCategories } from '@/lib/services/category.service';
import { getUserAccounts } from '@/lib/services/account.service';
import { transactionsToCSV, generateExportFilename, ExportTransaction } from '@/lib/utils/export';
import { TransactionType } from '@/types/firestore';

export async function GET(request: NextRequest) {
  let userId: string;

  try {
    // Verify authentication
    const authUser = await verifyAuth(request);
    userId = authUser.uid;
  } catch (authError) {
    console.error('Auth error:', authError);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Fetch transactions
    const transactions = await getUserTransactions(userId, {
      startDate,
      endDate,
      type: type === 'INCOME' ? TransactionType.INCOME : type === 'EXPENSE' ? TransactionType.EXPENSE : undefined,
      accountId: accountId || undefined,
      limit: 10000, // High limit for export
    });

    // Fetch categories and accounts for lookup
    const [categories, accounts] = await Promise.all([
      getUserCategories(userId, false),
      getUserAccounts(userId, false),
    ]);

    // Create lookup maps
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    // Transform transactions for export
    const exportData: ExportTransaction[] = transactions.map((txn) => ({
      id: txn.id,
      date: txn.date.toDate(),
      type: txn.type,
      category: categoryMap.get(txn.categoryId) || 'Tanpa Kategori',
      account: accountMap.get(txn.accountId) || 'Unknown',
      amount: txn.amount,
      currency: txn.currency,
      notes: txn.notes,
    }));

    // Generate CSV
    const csvContent = transactionsToCSV(exportData);
    const filename = generateExportFilename('transaksi', startDate, endDate);

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}
