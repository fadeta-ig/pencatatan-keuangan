'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getAccountById, updateAccount } from '@/lib/services/account.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountType, FirestoreAccount } from '@/types/firestore';
import { SUPPORTED_CURRENCIES } from '@/constants';
import {
  Landmark,
  Banknote,
  Smartphone,
  TrendingUp,
  CreditCard,
  Wallet,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Account type options
const accountTypeOptions = [
  { value: AccountType.BANK, label: 'Bank', icon: Landmark, color: 'from-blue-500 to-cyan-500' },
  { value: AccountType.CASH, label: 'Tunai', icon: Banknote, color: 'from-green-500 to-emerald-500' },
  { value: AccountType.E_WALLET, label: 'E-Wallet', icon: Smartphone, color: 'from-purple-500 to-pink-500' },
  { value: AccountType.INVESTMENT, label: 'Investasi', icon: TrendingUp, color: 'from-orange-500 to-amber-500' },
  { value: AccountType.CREDIT_CARD, label: 'Kartu Kredit', icon: CreditCard, color: 'from-red-500 to-rose-500' },
  { value: AccountType.OTHER, label: 'Lainnya', icon: Wallet, color: 'from-gray-500 to-slate-500' },
];

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;
  const { user } = useAuth();

  const [account, setAccount] = useState<(FirestoreAccount & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: AccountType.BANK,
    currency: 'IDR',
    description: '',
  });

  // Load account data
  useEffect(() => {
    async function loadAccount() {
      if (!accountId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getAccountById(accountId);

        if (!data) {
          setError('Rekening tidak ditemukan');
          return;
        }

        if (data.userId !== user?.uid) {
          setError('Anda tidak memiliki akses ke rekening ini');
          return;
        }

        setAccount(data);
        setFormData({
          name: data.name,
          type: data.type,
          currency: data.currency,
          description: data.description || '',
        });
      } catch (err) {
        console.error('Error loading account:', err);
        setError('Gagal memuat data rekening. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [accountId, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId) return;

    // Validation
    if (!formData.name.trim()) {
      setError('Nama rekening harus diisi');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateAccount(accountId, {
        name: formData.name.trim(),
        type: formData.type,
        currency: formData.currency,
        description: formData.description.trim() || undefined,
      });

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/accounts');
      }, 1500);
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Gagal mengupdate rekening. Silakan coba lagi.');
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | AccountType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !account) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/accounts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Edit Rekening</h1>
            <p className="mt-1 text-sm text-gray-600">
              Perbarui informasi rekening {account?.name}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Rekening berhasil diperbarui! Mengalihkan ke daftar rekening...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && account && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Account Info */}
        {account && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Saldo Awal</p>
                  <p className="text-xl font-bold text-gray-900">
                    {account.currency} {account.initialBalance.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Saldo Saat Ini</p>
                  <p className="text-xl font-bold text-gray-900">
                    {account.currency} {account.currentBalance.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Perubahan</p>
                  <p className={`text-xl font-bold ${account.currentBalance >= account.initialBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {account.currency} {(account.currentBalance - account.initialBalance).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informasi Rekening</CardTitle>
              <CardDescription>
                Perbarui detail rekening Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Rekening <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: BCA Tabungan, Dompet Tunai, GoPay"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={saving || success}
                  required
                />
              </div>

              {/* Account Type */}
              <div className="space-y-3">
                <Label>
                  Jenis Rekening <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {accountTypeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.type === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('type', option.value)}
                        disabled={saving || success}
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                          ${isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${option.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">
                  Mata Uang <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange('currency', value)}
                  disabled={saving || success}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Perhatian: Mengubah mata uang dapat mempengaruhi konversi transaksi
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Deskripsi (Opsional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tambahkan catatan atau deskripsi untuk rekening ini..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={saving || success}
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/accounts')}
                  disabled={saving || success}
                  className="flex-1 md:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving || success}
                  className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
