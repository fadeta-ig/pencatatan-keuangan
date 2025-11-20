'use client';

import { useAuth } from '@/lib/auth';
import { useTransfers, useAccounts } from '@/hooks';
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

  // Create account lookup map
  const accountMap = useMemo(() => {
    const map = new Map();
    accounts.forEach((account) => {
      map.set(account.id, account);
    });

    // Debug: Log account map
    if (accounts.length > 0) {
      console.log('Account Map:', {
        totalAccounts: accounts.length,
        accountIds: accounts.map(a => ({ id: a.id, name: a.name }))
      });
    }

    return map;
  }, [accounts]);

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

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Transfer
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalTransfers}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <ArrowRightLeft className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Ditransfer
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {transfers.length > 0 ? '~' : ''} {formatCurrency(stats.totalAmount, 'IDR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimasi (berbagai mata uang)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfers List */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>Riwayat Transfer</CardTitle>
            <CardDescription>
              Semua transfer antar rekening Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || accountsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <ArrowRightLeft className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum Ada Transfer
                </h3>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">
                  Mulai transfer uang antar rekening Anda untuk mengelola keuangan dengan lebih baik
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/transfers/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Transfer Baru
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => {
                  const fromAccount = accountMap.get(transfer.fromAccountId);
                  const toAccount = accountMap.get(transfer.toAccountId);
                  const isMultiCurrency = transfer.exchangeRate && transfer.convertedAmount;

                  // Debug: Log transfer lookup
                  if (!fromAccount || !toAccount) {
                    console.log('Account lookup failed:', {
                      transferId: transfer.id,
                      fromAccountId: transfer.fromAccountId,
                      toAccountId: transfer.toAccountId,
                      fromAccountFound: !!fromAccount,
                      toAccountFound: !!toAccount
                    });
                  }

                  return (
                    <div
                      key={transfer.id}
                      className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                        <ArrowRightLeft className="h-6 w-6 text-white" />
                      </div>

                      {/* Transfer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {fromAccount?.name || `Account ${transfer.fromAccountId.substring(0, 8)}`}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {toAccount?.name || `Account ${transfer.toAccountId.substring(0, 8)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {transfer.date.toDate().toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {isMultiCurrency && (
                            <Badge variant="outline" className="text-xs">
                              Multi-currency
                            </Badge>
                          )}
                        </div>
                        {transfer.notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {transfer.notes}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(transfer.amount, transfer.currency)}
                        </p>
                        {isMultiCurrency && (
                          <p className="text-xs text-gray-500">
                            → {formatCurrency(transfer.convertedAmount!, toAccount?.currency || 'IDR')}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
