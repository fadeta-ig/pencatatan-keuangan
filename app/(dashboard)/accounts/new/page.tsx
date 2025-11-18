'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createAccount } from '@/lib/services/account.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccountType } from '@/types/firestore';
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

export default function NewAccountPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: AccountType.BANK,
    currency: userData?.currency || 'IDR',
    initialBalance: 0,
    description: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError('Anda harus login untuk menambah rekening');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Nama rekening harus diisi');
      return;
    }

    if (formData.initialBalance < 0) {
      setError('Saldo awal tidak boleh negatif');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createAccount({
        userId: user.uid,
        name: formData.name.trim(),
        type: formData.type,
        currency: formData.currency,
        initialBalance: formData.initialBalance,
        description: formData.description.trim() || undefined,
        isActive: true,
      });

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/accounts');
      }, 1500);
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Gagal menambahkan rekening. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | AccountType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const selectedType = accountTypeOptions.find(opt => opt.value === formData.type);

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
            <h1 className="text-3xl font-bold text-gray-900">Tambah Rekening Baru</h1>
            <p className="mt-1 text-sm text-gray-600">
              Tambahkan rekening bank, e-wallet, atau akun keuangan lainnya
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Rekening berhasil ditambahkan! Mengalihkan ke daftar rekening...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informasi Rekening</CardTitle>
              <CardDescription>
                Masukkan detail rekening yang ingin Anda tambahkan
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
                  disabled={loading || success}
                  required
                />
                <p className="text-xs text-gray-500">
                  Berikan nama yang mudah dikenali untuk rekening ini
                </p>
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
                        disabled={loading || success}
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

              {/* Currency and Initial Balance */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    Mata Uang <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange('currency', value)}
                    disabled={loading || success}
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
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <Label htmlFor="initialBalance">
                    Saldo Awal
                  </Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.initialBalance}
                    onChange={(e) => handleChange('initialBalance', parseFloat(e.target.value) || 0)}
                    disabled={loading || success}
                  />
                  <p className="text-xs text-gray-500">
                    Masukkan saldo awal rekening ini
                  </p>
                </div>
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
                  disabled={loading || success}
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/accounts')}
                  disabled={loading || success}
                  className="flex-1 md:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Rekening
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Preview Card */}
        {formData.name && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                Begini tampilan rekening Anda di daftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                {selectedType && (
                  <>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${selectedType.color} shadow-lg`}>
                      <selectedType.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{formData.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formData.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formData.currency} {formData.initialBalance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">{selectedType.label}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
