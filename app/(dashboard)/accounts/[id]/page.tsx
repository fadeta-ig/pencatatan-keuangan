'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useSingleAccount } from '@/hooks';
import { deleteAccount } from '@/lib/services/account.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/format';
import { AccountType } from '@/types/firestore';
import {
  Landmark,
  Banknote,
  Smartphone,
  TrendingUp as TrendingUpIcon,
  CreditCard,
  Wallet,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

// Icon mapping for account types
const accountTypeIcons: Record<AccountType, React.ComponentType<{ className?: string }>> = {
  [AccountType.BANK]: Landmark,
  [AccountType.CASH]: Banknote,
  [AccountType.E_WALLET]: Smartphone,
  [AccountType.INVESTMENT]: TrendingUpIcon,
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

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;
  const { user } = useAuth();

  const { account, loading, error, balanceChange, balanceChangePercentage, isPositive } = useSingleAccount({
    accountId,
    userId: user?.uid,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!accountId) return;

    try {
      setDeleting(true);
      await deleteAccount(accountId);
      router.push('/accounts');
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !account) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Rekening tidak ditemukan'}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/accounts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar Rekening
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = accountTypeIcons[account.type];
  const gradient = accountTypeColors[account.type];
  const typeLabel = accountTypeLabels[account.type];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/accounts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {typeLabel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {account.currency}
                </Badge>
                {account.isActive ? (
                  <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                    Aktif
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-100">
                    Tidak Aktif
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/accounts/${account.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        {/* Account Card */}
        <Card className={`shadow-2xl border-0 bg-gradient-to-br ${gradient} text-white overflow-hidden`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Saldo Saat Ini</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(account.currentBalance, account.currency)}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm">
                {typeLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">Saldo Awal</p>
                <p className="text-xl font-bold">
                  {formatCurrency(account.initialBalance, account.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">Perubahan</p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <p className="text-xl font-bold">
                    {formatCurrency(Math.abs(balanceChange), account.currency)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">Persentase</p>
                <p className="text-xl font-bold">
                  {isPositive ? '+' : '-'}{Math.abs(parseFloat(balanceChangePercentage))}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Rekening</CardTitle>
              <CardDescription>Detail lengkap rekening Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Nama Rekening</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 text-right">{account.name}</p>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Jenis</p>
                </div>
                <Badge variant="outline">{typeLabel}</Badge>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Mata Uang</p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                  {account.currency}
                </Badge>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Dibuat</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 text-right">
                  {account.createdAt?.toDate?.()?.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) || '-'}
                </p>
              </div>
              <div className="flex items-start justify-between py-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-600">Terakhir Diperbarui</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 text-right">
                  {account.updatedAt?.toDate?.()?.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Description & Actions */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {account.description || 'Tidak ada deskripsi untuk rekening ini.'}
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                <CardDescription>Operasi yang dapat dilakukan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/transactions/new?account=${account.id}&type=income`}>
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    Tambah Pemasukan
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/transactions/new?account=${account.id}&type=expense`}>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Tambah Pengeluaran
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/transactions?account=${account.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Lihat Riwayat Transaksi
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions - Empty State */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi terakhir dari rekening ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Transaksi
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm">
                Mulai catat transaksi untuk rekening ini
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href={`/transactions/new?account=${account.id}`}>
                  Tambah Transaksi
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus Rekening
            </DialogTitle>
            <DialogDescription className="pt-3">
              Apakah Anda yakin ingin menghapus rekening <strong>{account.name}</strong>?
              <br />
              <br />
              Rekening yang dihapus akan dinonaktifkan dan tidak akan muncul dalam daftar aktif.
              Data transaksi yang terkait akan tetap tersimpan untuk keperluan audit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ya, Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
