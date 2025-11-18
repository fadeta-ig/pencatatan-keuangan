'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserTransactions, deleteTransaction } from '@/lib/services/transaction.service';
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
  FirestoreTransaction,
  FirestoreAccount,
  FirestoreCategory,
  TransactionType,
  CategoryType
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
  const [transactions, setTransactions] = useState<Array<FirestoreTransaction & { id: string }>>([]);
  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [categories, setCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterAccountId, setFilterAccountId] = useState<string>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Load accounts and categories first
        const [accountsData, categoriesData] = await Promise.all([
          getUserAccounts(user.uid, true),
          getUserCategories(user.uid, true),
        ]);

        setAccounts(accountsData);
        setCategories(categoriesData);

        // Load transactions
        const transactionsData = await getUserTransactions(user.uid);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Gagal memuat data transaksi. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filterType !== 'ALL' && transaction.type !== filterType) {
      return false;
    }

    // Filter by account
    if (filterAccountId !== 'ALL' && transaction.accountId !== filterAccountId) {
      return false;
    }

    // Filter by category
    if (filterCategoryId !== 'ALL' && transaction.categoryId !== filterCategoryId) {
      return false;
    }

    // Filter by search query (notes)
    if (searchQuery && !transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculate summaries
  const totalIncome = filteredTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Handle delete
  const handleDelete = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      setTransactions(transactions.filter((t) => t.id !== transactionId));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Gagal menghapus transaksi. Silakan coba lagi.');
    }
  };

  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown';
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#94a3b8';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola semua pemasukan dan pengeluaran Anda
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-1">
                    Total Pemasukan
                  </p>
                  <p className="text-3xl font-bold mb-2">
                    {formatCurrency(totalIncome, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.filter(t => t.type === TransactionType.INCOME).length} transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ArrowUpCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-600 to-rose-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-1">
                    Total Pengeluaran
                  </p>
                  <p className="text-3xl font-bold mb-2">
                    {formatCurrency(totalExpense, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).length} transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ArrowDownCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-lg border-0 ${netBalance >= 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-orange-600 to-amber-600'} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-1">
                    Saldo Bersih
                  </p>
                  <p className="text-3xl font-bold mb-2">
                    {formatCurrency(netBalance, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {filteredTransactions.length} total transaksi
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm">
                  {netBalance >= 0 ? (
                    <TrendingUp className="h-7 w-7 text-white" />
                  ) : (
                    <TrendingDown className="h-7 w-7 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle>Filter</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipe Transaksi
                </label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rekening
                </label>
                <Select value={filterAccountId} onValueChange={setFilterAccountId}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kategori
                </label>
                <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cari Catatan
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari catatan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaksi ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || filterType !== 'ALL' || filterAccountId !== 'ALL' || filterCategoryId !== 'ALL'
                    ? 'Tidak Ada Transaksi Ditemukan'
                    : 'Belum Ada Transaksi'}
                </h3>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">
                  {searchQuery || filterType !== 'ALL' || filterAccountId !== 'ALL' || filterCategoryId !== 'ALL'
                    ? 'Coba ubah filter untuk melihat transaksi lainnya'
                    : 'Tambahkan transaksi pertama Anda untuk mulai mencatat pemasukan dan pengeluaran'}
                </p>
                <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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

                  return (
                    <div
                      key={transaction.id}
                      className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${isIncome ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        {isIncome ? (
                          <ArrowUpCircle className="h-6 w-6 text-white" />
                        ) : (
                          <ArrowDownCircle className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {getCategoryName(transaction.categoryId)}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: getCategoryColor(transaction.categoryId),
                              color: getCategoryColor(transaction.categoryId)
                            }}
                          >
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="truncate">
                            {getAccountName(transaction.accountId)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transactionDate)}
                          </span>
                          {transaction.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate">{transaction.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
