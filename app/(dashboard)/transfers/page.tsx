'use client';

import { useAuth } from '@/lib/auth';
import { useTransfers, useAccounts, useLookupHelpers } from '@/hooks';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils/format';
import {
  Plus,
  ArrowRightLeft,
  MoreHorizontal,
  Trash2,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useCallback, useMemo } from 'react';

export default function TransfersPage() {
  const { user } = useAuth();
  const { transfers, loading, error, removeTransfer } = useTransfers({
    userId: user?.uid,
  });
  const { accounts, loading: accountsLoading } = useAccounts({
    userId: user?.uid,
    activeOnly: false, // Include all accounts to show names
  });

  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Use lookup helpers for efficient account name lookups
  const { getAccountName, accountsMap } = useLookupHelpers({
    accounts,
    categories: [], // Not needed for transfers
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalTransfers = transfers.length;
    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransfers,
      totalAmount,
    };
  }, [transfers]);

  // Handle delete
  const handleDelete = useCallback(
    async (transferId: string) => {
      if (!confirm('Apakah Anda yakin ingin menghapus transfer ini? Saldo akun akan dikembalikan.')) {
        return;
      }

      try {
        setDeleteError(null);
        await removeTransfer(transferId);
      } catch (err) {
        console.error('Error deleting transfer:', err);
        setDeleteError('Gagal menghapus transfer. Silakan coba lagi.');
      }
    },
    [removeTransfer]
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transfer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola transfer antar rekening Anda
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/transfers/new">
              <Plus className="h-4 w-4 mr-2" />
              Transfer Baru
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Total Transfers Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90">
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
                    Total Transfer
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {stats.totalTransfers}
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRightLeft className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-90">
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
                    Total Ditransfer
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg mb-1">
                    {transfers.length > 0 ? '~' : ''} {formatCurrency(stats.totalAmount, 'IDR')}
                  </p>
                  <p className="text-xs text-white/70">
                    Estimasi (berbagai mata uang)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfers List - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Riwayat Transfer</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Semua transfer antar rekening Anda
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {(loading || accountsLoading) ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 shadow-lg">
                  <ArrowRightLeft className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Belum Ada Transfer
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                  Mulai transfer uang antar rekening Anda untuk mengelola keuangan dengan lebih baik
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                  <Link href="/transfers/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Transfer Baru
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => {
                  const fromAccountName = getAccountName(transfer.fromAccountId);
                  const toAccountName = getAccountName(transfer.toAccountId);
                  const toAccount = accountsMap.get(transfer.toAccountId);
                  const isMultiCurrency = transfer.exchangeRate && transfer.convertedAmount;

                  return (
                    <div
                      key={transfer.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          <ArrowRightLeft className="h-6 w-6 text-white drop-shadow-sm" />
                        </div>

                        {/* Transfer Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-sm">
                              {fromAccountName}
                            </span>
                            <ArrowRight className="h-4 w-4 text-purple-500" />
                            <span className="font-bold text-gray-900 text-sm">
                              {toAccountName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {transfer.date.toDate().toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {isMultiCurrency && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-[10px] px-2 py-0 border-purple-300 text-purple-600 bg-purple-50">
                                  Multi-currency
                                </Badge>
                              </>
                            )}
                          </div>
                          {transfer.notes && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {transfer.notes}
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="text-right mr-2">
                          <p className="text-lg font-black text-purple-600">
                            {formatCurrency(transfer.amount, transfer.currency)}
                          </p>
                          {isMultiCurrency && (
                            <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                              <ArrowRight className="h-3 w-3" />
                              {formatCurrency(transfer.convertedAmount!, toAccount?.currency || 'IDR')}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/60">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDelete(transfer.id)}
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
