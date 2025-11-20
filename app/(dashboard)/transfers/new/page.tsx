'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createTransfer } from '@/lib/services/transfer.service';
import { getUserAccounts } from '@/lib/services/account.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { FirestoreAccount } from '@/types/firestore';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/forms/date-picker';
import { toTimestamp } from '@/lib/firestore-helpers';
import { formatCurrency } from '@/lib/utils/format';

export default function NewTransferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date(),
    notes: '',
    exchangeRate: 1,
  });

  // Load accounts
  useEffect(() => {
    async function loadAccounts() {
      if (!user?.uid) return;

      try {
        const accountsData = await getUserAccounts(user.uid, true);
        setAccounts(accountsData);

        // Set default accounts if available
        if (accountsData.length > 0 && !formData.fromAccountId) {
          setFormData((prev) => ({ ...prev, fromAccountId: accountsData[0].id }));
        }
        if (accountsData.length > 1 && !formData.toAccountId) {
          setFormData((prev) => ({ ...prev, toAccountId: accountsData[1].id }));
        }
      } catch (err) {
        console.error('Error loading accounts:', err);
      }
    }

    loadAccounts();
  }, [user?.uid]);

  const selectedFromAccount = useMemo(
    () => accounts.find((acc) => acc.id === formData.fromAccountId),
    [accounts, formData.fromAccountId]
  );

  const selectedToAccount = useMemo(
    () => accounts.find((acc) => acc.id === formData.toAccountId),
    [accounts, formData.toAccountId]
  );

  const isMultiCurrency = useMemo(
    () =>
      selectedFromAccount &&
      selectedToAccount &&
      selectedFromAccount.currency !== selectedToAccount.currency,
    [selectedFromAccount, selectedToAccount]
  );

  const convertedAmount = useMemo(() => {
    if (isMultiCurrency) {
      return formData.amount * formData.exchangeRate;
    }
    return formData.amount;
  }, [formData.amount, formData.exchangeRate, isMultiCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError('Anda harus login untuk membuat transfer');
      return;
    }

    // Validation
    if (formData.amount <= 0) {
      setError('Jumlah harus lebih besar dari 0');
      return;
    }

    if (!formData.fromAccountId) {
      setError('Pilih rekening asal');
      return;
    }

    if (!formData.toAccountId) {
      setError('Pilih rekening tujuan');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Rekening asal dan tujuan tidak boleh sama');
      return;
    }

    if (!selectedFromAccount) {
      setError('Rekening asal tidak ditemukan');
      return;
    }

    if (selectedFromAccount.currentBalance < formData.amount) {
      setError(
        `Saldo tidak mencukupi. Saldo tersedia: ${formatCurrency(
          selectedFromAccount.currentBalance,
          selectedFromAccount.currency
        )}`
      );
      return;
    }

    if (isMultiCurrency && formData.exchangeRate <= 0) {
      setError('Kurs harus lebih besar dari 0 untuk transfer multi-currency');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createTransfer({
        userId: user.uid,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: formData.amount,
        currency: selectedFromAccount.currency,
        date: toTimestamp(formData.date),
        notes: formData.notes.trim() || undefined,
        exchangeRate: isMultiCurrency ? formData.exchangeRate : undefined,
        convertedAmount: isMultiCurrency ? convertedAmount : undefined,
      });

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/transfers');
      }, 1500);
    } catch (err) {
      console.error('Error creating transfer:', err);
      setError('Gagal membuat transfer. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transfers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Transfer Baru</h1>
            <p className="mt-1 text-sm text-gray-600">
              Transfer uang antar rekening Anda
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Transfer berhasil dibuat! Mengalihkan ke daftar transfer...
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
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle>Informasi Transfer</CardTitle>
              <CardDescription>
                Masukkan detail transfer yang ingin Anda lakukan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From and To Accounts */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* From Account */}
                <div className="space-y-2">
                  <Label htmlFor="fromAccountId">
                    Dari Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.fromAccountId}
                    onValueChange={(value) => handleChange('fromAccountId', value)}
                    disabled={loading || success || accounts.length === 0}
                  >
                    <SelectTrigger id="fromAccountId">
                      <SelectValue placeholder="Pilih rekening asal" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id}
                          disabled={account.id === formData.toAccountId}
                        >
                          {account.name} ({formatCurrency(account.currentBalance, account.currency)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFromAccount && (
                    <p className="text-xs text-gray-600">
                      Saldo: {formatCurrency(selectedFromAccount.currentBalance, selectedFromAccount.currency)}
                    </p>
                  )}
                </div>

                {/* To Account */}
                <div className="space-y-2">
                  <Label htmlFor="toAccountId">
                    Ke Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.toAccountId}
                    onValueChange={(value) => handleChange('toAccountId', value)}
                    disabled={loading || success || accounts.length === 0}
                  >
                    <SelectTrigger id="toAccountId">
                      <SelectValue placeholder="Pilih rekening tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id}
                          disabled={account.id === formData.fromAccountId}
                        >
                          {account.name} ({account.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedToAccount && (
                    <p className="text-xs text-gray-600">
                      Saldo: {formatCurrency(selectedToAccount.currentBalance, selectedToAccount.currency)}
                    </p>
                  )}
                </div>
              </div>

              {accounts.length < 2 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Anda memerlukan minimal 2 rekening untuk melakukan transfer.{' '}
                    <Link href="/accounts/new" className="underline font-medium">
                      Tambah rekening baru
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Jumlah <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {selectedFromAccount?.currency || 'IDR'}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                    disabled={loading || success}
                    className="pl-16 text-lg font-semibold text-gray-900"
                    required
                  />
                </div>
                {selectedFromAccount && formData.amount > 0 && (
                  <p className="text-xs text-gray-600">
                    {formData.amount > selectedFromAccount.currentBalance ? (
                      <span className="text-red-600">
                        ⚠️ Saldo tidak mencukupi! Kurang:{' '}
                        {formatCurrency(
                          formData.amount - selectedFromAccount.currentBalance,
                          selectedFromAccount.currency
                        )}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        ✓ Saldo setelah transfer:{' '}
                        {formatCurrency(
                          selectedFromAccount.currentBalance - formData.amount,
                          selectedFromAccount.currency
                        )}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Exchange Rate (Multi-currency only) */}
              {isMultiCurrency && (
                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">
                    Kurs (1 {selectedFromAccount?.currency} = ? {selectedToAccount?.currency})
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="1.0000"
                    value={formData.exchangeRate || ''}
                    onChange={(e) => handleChange('exchangeRate', parseFloat(e.target.value) || 1)}
                    disabled={loading || success}
                    className="text-gray-900"
                    required
                  />
                  {formData.amount > 0 && formData.exchangeRate > 0 && (
                    <p className="text-xs text-gray-600">
                      {formatCurrency(formData.amount, selectedFromAccount!.currency)} ={' '}
                      {formatCurrency(convertedAmount, selectedToAccount!.currency)}
                    </p>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => handleChange('date', date)}
                  disabled={loading || success}
                  placeholder="Pilih tanggal transfer"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk transfer ini..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={loading || success}
                  rows={3}
                  className="text-gray-900"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/transfers')}
                  disabled={loading || success}
                  className="flex-1 md:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success || accounts.length < 2}
                  className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Transfer Sekarang
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Preview Card */}
        {formData.amount > 0 && selectedFromAccount && selectedToAccount && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Preview Transfer</CardTitle>
              <CardDescription>Ringkasan transfer yang akan dilakukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl bg-purple-50">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex-shrink-0">
                  <ArrowRightLeft className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{selectedFromAccount.name}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{selectedToAccount.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.date.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {formData.notes && (
                    <p className="text-xs text-gray-500 mt-1">{formData.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(formData.amount, selectedFromAccount.currency)}
                  </p>
                  {isMultiCurrency && (
                    <p className="text-xs text-gray-600">
                      → {formatCurrency(convertedAmount, selectedToAccount.currency)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
