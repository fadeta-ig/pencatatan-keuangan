'use client';

import { useAuth } from '@/lib/auth';
import { useAccounts } from '@/hooks';
import { deleteAccount } from '@/lib/services/account.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils/format';
import { FirestoreAccount, AccountType } from '@/types/firestore';
import {
  Wallet,
  Plus,
  CreditCard,
  Landmark,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState, useCallback } from 'react';

// Icon mapping for account types
const accountTypeIcons: Record<AccountType, React.ComponentType<{ className?: string }>> = {
  [AccountType.BANK]: Landmark,
  [AccountType.CASH]: Banknote,
  [AccountType.E_WALLET]: Smartphone,
  [AccountType.INVESTMENT]: TrendingUp,
  [AccountType.CREDIT_CARD]: CreditCard,
  [AccountType.OTHER]: Wallet,
};

// Color mapping for account types
const accountTypeColors: Record<AccountType, string> = {
  [AccountType.BANK]: 'from-blue-500 to-cyan-500',
  [AccountType.CASH]: 'from-green-500 to-emerald-500',
  [AccountType.E_WALLET]: 'from-purple-500 to-pink-500',
  [AccountType.INVESTMENT]: 'from-orange-500 to-amber-500',
  [AccountType.CREDIT_CARD]: 'from-red-500 to-rose-500',
  [AccountType.OTHER]: 'from-gray-500 to-slate-500',
};

// Label mapping for account types
const accountTypeLabels: Record<AccountType, string> = {
  [AccountType.BANK]: 'Bank',
  [AccountType.CASH]: 'Tunai',
  [AccountType.E_WALLET]: 'E-Wallet',
  [AccountType.INVESTMENT]: 'Investasi',
  [AccountType.CREDIT_CARD]: 'Kartu Kredit',
  [AccountType.OTHER]: 'Lainnya',
};

export default function AccountsPage() {
  const { user, userData } = useAuth();
  const { accounts, loading, error, totalBalance, balanceByCurrency, removeAccount } = useAccounts({
    userId: user?.uid,
    activeOnly: true,
  });

  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Memoized currency entries for display
  const currencyEntries = useMemo(() => {
    return Object.entries(balanceByCurrency).slice(0, 2);
  }, [balanceByCurrency]);

  // Handle delete with error handling
  const handleDelete = useCallback(async (accountId: string, accountName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rekening "${accountName}"?`)) {
      return;
    }

    try {
      setDeleteError(null);
      await removeAccount(accountId);
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteError('Gagal menghapus rekening. Silakan coba lagi.');
    }
  }, [removeAccount]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rekening</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola semua rekening dan akun keuangan Anda
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
            <Link href="/accounts/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Rekening
            </Link>
          </Button>
        </div>

        {/* Error Alert */}
        {(error || deleteError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || deleteError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards - Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Balance Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90">
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
                    Total Saldo (Semua Mata Uang)
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg mb-1">
                    {formatCurrency(totalBalance, userData?.currency || 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    {accounts.length} rekening aktif
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Currency Balance Cards */}
          {currencyEntries.map(([currency, balance], index) => {
            const gradients = [
              'from-emerald-600 to-teal-600',
              'from-violet-600 to-purple-600',
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <div key={currency} className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
                {/* Animated Liquid Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}>
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
                        Saldo {currency}
                      </p>
                      <p className="text-3xl font-black text-white drop-shadow-lg mb-1">
                        {formatCurrency(balance, currency)}
                      </p>
                      <p className="text-xs text-white/70">
                        {accounts.filter(a => a.currency === currency).length} rekening
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accounts List - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Daftar Rekening</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Semua rekening keuangan Anda dalam satu tempat
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-lg">
                  <Wallet className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Belum Ada Rekening
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                  Tambahkan rekening pertama Anda untuk mulai mencatat transaksi keuangan
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Link href="/accounts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Rekening
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const Icon = accountTypeIcons[account.type];
                  const gradient = accountTypeColors[account.type];
                  const typeLabel = accountTypeLabels[account.type];
                  const balanceChange = account.currentBalance - account.initialBalance;
                  const isPositive = balanceChange >= 0;

                  return (
                    <div
                      key={account.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                        </div>

                        {/* Account Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {account.name}
                            </h3>
                            <Badge variant="outline" className="text-[10px] px-2 py-0">
                              {typeLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {account.description || 'Tidak ada deskripsi'}
                          </p>
                        </div>

                        {/* Balance */}
                        <div className="text-right mr-2">
                          <p className="text-lg font-black text-gray-900">
                            {formatCurrency(account.currentBalance, account.currency)}
                          </p>
                          <div className="flex items-center gap-1 justify-end text-xs">
                            {isPositive ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            )}
                            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(balanceChange), account.currency)}
                            </span>
                          </div>
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
                              <Link href={`/accounts/${account.id}`} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/accounts/${account.id}/edit`} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(account.id, account.name)}
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
