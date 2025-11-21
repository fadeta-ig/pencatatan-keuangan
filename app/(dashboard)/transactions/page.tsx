'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useTransactions, useLookupHelpers } from '@/hooks';
import { getUserAccounts } from '@/lib/services/account.service';
import { getUserCategories } from '@/lib/services/category.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils/format';
import {
  FirestoreAccount,
  FirestoreCategory,
  TransactionType,
} from '@/types/firestore';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Search,
  Wallet,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Timestamp } from 'firebase/firestore';

// Helper to convert Firestore Timestamp to Date
function toDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function TransactionsPage() {
  const { user, userData } = useAuth();

  // Filters state
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterAccountId, setFilterAccountId] = useState<string>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Separate state for accounts and categories for filters
  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [categories, setCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Fetch accounts and categories for filters
  useEffect(() => {
    async function loadMetadata() {
      if (!user?.uid) return;

      try {
        const [accountsData, categoriesData] = await Promise.all([
          getUserAccounts(user.uid, true),
          getUserCategories(user.uid, true),
        ]);

        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading metadata:', err);
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMetadata();
  }, [user?.uid]);

  // Use transactions hook with filters
  const {
    filteredTransactions,
    loading: loadingTransactions,
    error,
    removeTransaction,
    totalIncome,
    totalExpense,
    netBalance,
  } = useTransactions({
    userId: user?.uid,
    filterType,
    filterAccountId: filterAccountId !== 'ALL' ? filterAccountId : undefined,
    filterCategoryId: filterCategoryId !== 'ALL' ? filterCategoryId : undefined,
    searchQuery,
  });

  // Use lookup helpers for efficient name/color lookups
  const { getAccountName, getCategoryName, getCategoryColor } = useLookupHelpers({
    accounts,
    categories,
  });

  // Handle delete with error handling
  const handleDelete = useCallback(async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await removeTransaction(transactionId);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Gagal menghapus transaksi. Silakan coba lagi.');
    }
  }, [removeTransaction]);

  const loading = loadingTransactions || loadingMeta;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola semua pemasukan dan pengeluaran Anda
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
            <Link href="/transactions/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Link>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards with Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Income Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 opacity-90">
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Total Pemasukan
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg mb-2">
                    {formatCurrency(totalIncome, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.filter(t => t.type === TransactionType.INCOME).length} transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowUpCircle className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-rose-600 opacity-90">
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Total Pengeluaran
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg mb-2">
                    {formatCurrency(totalExpense, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).length} transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowDownCircle className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className={`absolute inset-0 ${netBalance >= 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-orange-600 to-amber-600'} opacity-90`}>
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Saldo Bersih
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg mb-2">
                    {formatCurrency(netBalance, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.length} total transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {netBalance >= 0 ? (
                    <TrendingUp className="h-7 w-7 text-white drop-shadow-md" />
                  ) : (
                    <TrendingDown className="h-7 w-7 text-white drop-shadow-md" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Filter Transaksi</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Tipe Transaksi
              </label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value={TransactionType.INCOME}>Pemasukan</SelectItem>
                  <SelectItem value={TransactionType.EXPENSE}>Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Rekening
              </label>
              <Select value={filterAccountId} onValueChange={setFilterAccountId}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Rekening</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Kategori
              </label>
              <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Cari Catatan
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/60 backdrop-blur-sm border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterType !== 'ALL' || filterAccountId !== 'ALL' || filterCategoryId !== 'ALL' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-600">Filter aktif:</span>
              <div className="flex flex-wrap gap-2">
                {filterType !== 'ALL' && (
                  <Badge variant="secondary" className="text-xs">
                    {filterType === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran'}
                  </Badge>
                )}
                {filterAccountId !== 'ALL' && (
                  <Badge variant="secondary" className="text-xs">
                    {getAccountName(filterAccountId)}
                  </Badge>
                )}
                {filterCategoryId !== 'ALL' && (
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryName(filterCategoryId)}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    "{searchQuery}"
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => {
                    setFilterType('ALL');
                    setFilterAccountId('ALL');
                    setFilterCategoryId('ALL');
                    setSearchQuery('');
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Daftar Transaksi</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {filteredTransactions.length} transaksi ditemukan
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4 shadow-lg">
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {searchQuery || filterType !== 'ALL' || filterAccountId !== 'ALL' || filterCategoryId !== 'ALL'
                    ? 'Tidak Ada Transaksi Ditemukan'
                    : 'Belum Ada Transaksi'}
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                  {searchQuery || filterType !== 'ALL' || filterAccountId !== 'ALL' || filterCategoryId !== 'ALL'
                    ? 'Coba ubah filter untuk melihat transaksi lainnya'
                    : 'Tambahkan transaksi pertama Anda untuk mulai mencatat pemasukan dan pengeluaran'}
                </p>
                <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
                  <Link href="/transactions/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Transaksi
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === TransactionType.INCOME;
                  const transactionDate = toDate(transaction.date);
                  const categoryColor = getCategoryColor(transaction.categoryId);

                  return (
                    <div
                      key={transaction.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Category Icon with Color */}
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor})`
                          }}
                        >
                          {isIncome ? (
                            <ArrowUpCircle className="h-6 w-6 text-white drop-shadow-sm" />
                          ) : (
                            <ArrowDownCircle className="h-6 w-6 text-white drop-shadow-sm" />
                          )}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {getCategoryName(transaction.categoryId)}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 py-0"
                              style={{
                                borderColor: categoryColor,
                                color: categoryColor,
                                backgroundColor: `${categoryColor}10`
                              }}
                            >
                              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">
                                {getAccountName(transaction.accountId)}
                              </span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(transactionDate)}</span>
                            </div>
                          </div>

                          {transaction.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {transaction.notes}
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="text-right mr-2">
                          <p className={`text-lg font-black ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/60">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                            <DropdownMenuItem asChild>
                              <Link href={`/transactions/${transaction.id}/edit`} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
