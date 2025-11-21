'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserTransactions } from '@/lib/services/transaction.service';
import { getUserAccounts } from '@/lib/services/account.service';
import { getUserCategories } from '@/lib/services/category.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
// Card components available but not currently used in this view
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { downloadCSV, transactionsToCSV, generateExportFilename, ExportTransaction } from '@/lib/utils/export';
import { TransactionType, FirestoreAccount, FirestoreCategory } from '@/types/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/forms/date-picker';

export default function ReportsPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Data state
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; amount: number; categoryId: string; accountId: string; currency: string; notes?: string; date: { toDate: () => Date } }>>([]);
  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [categories, setCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);

  // Filter state
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate date range based on period
        let start = startDate;
        if (period !== 'custom') {
          start = new Date();
          if (period === '7d') start.setDate(start.getDate() - 7);
          else if (period === '30d') start.setDate(start.getDate() - 30);
          else if (period === '90d') start.setDate(start.getDate() - 90);
        }

        const [txns, accts, cats] = await Promise.all([
          getUserTransactions(user.uid, {
            startDate: start,
            endDate: period === 'custom' ? endDate : new Date(),
            limit: 10000,
          }),
          getUserAccounts(user.uid, false),
          getUserCategories(user.uid, false),
        ]);

        setTransactions(txns);
        setAccounts(accts);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading report data:', err);
        setError('Gagal memuat data laporan');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid, period, startDate, endDate]);

  // Calculate summary
  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netIncome: income - expense,
      transactionCount: transactions.length,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  }, [transactions]);

  // Prepare category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const expenseByCategory = new Map<string, { name: string; value: number; color: string }>();

    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((txn) => {
        const cat = categoryMap.get(txn.categoryId);
        const name = cat?.name || 'Tanpa Kategori';
        const color = cat?.color || '#94a3b8';

        if (expenseByCategory.has(txn.categoryId)) {
          const existing = expenseByCategory.get(txn.categoryId)!;
          expenseByCategory.set(txn.categoryId, { ...existing, value: existing.value + txn.amount });
        } else {
          expenseByCategory.set(txn.categoryId, { name, value: txn.amount, color });
        }
      });

    return Array.from(expenseByCategory.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [transactions, categories]);

  // Prepare daily trend data
  const dailyTrend = useMemo(() => {
    const dayMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((txn) => {
      const dateKey = formatDate(txn.date.toDate(), 'yyyy-MM-dd');
      const existing = dayMap.get(dateKey) || { income: 0, expense: 0 };

      if (txn.type === TransactionType.INCOME) {
        existing.income += txn.amount;
      } else {
        existing.expense += txn.amount;
      }

      dayMap.set(dateKey, existing);
    });

    return Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14) // Last 14 days
      .map(([date, data]) => ({
        tanggal: formatDate(new Date(date), 'dd MMM'),
        Pemasukan: data.income,
        Pengeluaran: data.expense,
      }));
  }, [transactions]);

  // Handle export
  const handleExport = async () => {
    if (!user?.uid) return;

    try {
      setExporting(true);

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
      const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

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

      const csvContent = transactionsToCSV(exportData);
      const filename = generateExportFilename('laporan', startDate, endDate);
      downloadCSV(csvContent, filename);
    } catch (err) {
      console.error('Export error:', err);
      setError('Gagal mengexport data');
    } finally {
      setExporting(false);
    }
  };

  const periodLabel = period === '7d' ? '7 Hari' : period === '30d' ? '30 Hari' : period === '90d' ? '90 Hari' : 'Custom';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="mt-1 text-sm text-gray-600">
              Analisis dan export data keuangan Anda
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={loading || exporting || transactions.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Mengexport...' : 'Export CSV'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Period Filter */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Periode:</span>
            </div>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {period === 'custom' && (
              <>
                <DatePicker
                  value={startDate}
                  onChange={(d) => d && setStartDate(d)}
                  placeholder="Tanggal Mulai"
                />
                <span className="text-gray-500">-</span>
                <DatePicker
                  value={endDate}
                  onChange={(d) => d && setEndDate(d)}
                  placeholder="Tanggal Akhir"
                />
              </>
            )}

            <Badge variant="outline" className="ml-auto">
              {transactions.length} transaksi
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium text-white/80">Total Pemasukan</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalIncome, userData?.currency || 'IDR')}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium text-white/80">Total Pengeluaran</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalExpense, userData?.currency || 'IDR')}
                </p>
              </div>

              <div className={`rounded-2xl p-6 text-white shadow-lg ${
                summary.netIncome >= 0
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-orange-500 to-red-600'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium text-white/80">Pendapatan Bersih</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.netIncome, userData?.currency || 'IDR')}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium text-white/80">Tingkat Tabungan</span>
                </div>
                <p className="text-2xl font-bold">{summary.savingsRate.toFixed(1)}%</p>
              </div>
            </>
          )}
        </div>

        {/* Charts */}
        {!loading && transactions.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Trend */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tren Harian</h3>
                <Badge variant="outline">{periodLabel}</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, userData?.currency || 'IDR')}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pengeluaran per Kategori</h3>
                <Badge variant="outline">Top 10</Badge>
              </div>
              {categoryBreakdown.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value, userData?.currency || 'IDR')}
                        contentStyle={{
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 overflow-y-auto max-h-[250px]">
                    {categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-gray-700 truncate flex-1">{cat.name}</span>
                        <span className="text-xs font-medium text-gray-900">
                          {formatCurrency(cat.value, userData?.currency || 'IDR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PieChartIcon className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Tidak ada data pengeluaran</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && transactions.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tidak ada transaksi dalam periode yang dipilih
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
