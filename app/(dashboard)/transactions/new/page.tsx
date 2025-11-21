'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createTransaction } from '@/lib/services/transaction.service';
import { getUserAccounts } from '@/lib/services/account.service';
import { getUserCategories } from '@/lib/services/category.service';
import { getUserTags } from '@/lib/services/tag.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TransactionType, CategoryType, FirestoreAccount, FirestoreCategory, FirestoreTag } from '@/types/firestore';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Hash,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/forms/date-picker';
import { toTimestamp } from '@/lib/firestore-helpers';

// Transaction type options
const transactionTypeOptions = [
  { value: TransactionType.INCOME, label: 'Pemasukan', icon: ArrowUpCircle, color: 'from-green-500 to-emerald-500' },
  { value: TransactionType.EXPENSE, label: 'Pengeluaran', icon: ArrowDownCircle, color: 'from-red-500 to-rose-500' },
];

export default function NewTransactionPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [accounts, setAccounts] = useState<Array<FirestoreAccount & { id: string }>>([]);
  const [allCategories, setAllCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [filteredCategories, setFilteredCategories] = useState<Array<FirestoreCategory & { id: string }>>([]);
  const [allTags, setAllTags] = useState<Array<FirestoreTag & { id: string }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    type: TransactionType.EXPENSE,
    amount: 0,
    accountId: '',
    categoryId: '',
    date: new Date(),
    notes: '',
    tags: [] as string[],
  });

  // Load accounts, categories, and tags
  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;

      try {
        const [accountsData, categoriesData, tagsData] = await Promise.all([
          getUserAccounts(user.uid, true),
          getUserCategories(user.uid, true),
          getUserTags(user.uid),
        ]);

        setAccounts(accountsData);
        setAllCategories(categoriesData);
        setAllTags(tagsData);

        // Set default account if available
        if (accountsData.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: accountsData[0].id }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }

    loadData();
  }, [user?.uid]);

  // Filter categories based on transaction type
  useEffect(() => {
    const categoryType = formData.type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
    const filtered = allCategories.filter(cat => cat.type === categoryType);
    setFilteredCategories(filtered);

    // Reset category if current selection doesn't match type
    if (formData.categoryId) {
      const currentCategory = allCategories.find(cat => cat.id === formData.categoryId);
      if (!currentCategory || currentCategory.type !== categoryType) {
        setFormData(prev => ({ ...prev, categoryId: filtered.length > 0 ? filtered[0].id : '' }));
      }
    } else if (filtered.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: filtered[0].id }));
    }
  }, [formData.type, allCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError('Anda harus login untuk menambah transaksi');
      return;
    }

    // Validation
    if (formData.amount <= 0) {
      setError('Jumlah harus lebih besar dari 0');
      return;
    }

    if (!formData.accountId) {
      setError('Pilih rekening terlebih dahulu');
      return;
    }

    if (!formData.categoryId) {
      setError('Pilih kategori terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const account = accounts.find(acc => acc.id === formData.accountId);
      if (!account) {
        throw new Error('Rekening tidak ditemukan');
      }

      await createTransaction({
        userId: user.uid,
        accountId: formData.accountId,
        categoryId: formData.categoryId,
        type: formData.type,
        amount: formData.amount,
        currency: account.currency,
        date: toTimestamp(formData.date),
        notes: formData.notes.trim() || undefined,
        tags: formData.tags,
      });

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/transactions');
      }, 1500);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Gagal menambahkan transaksi. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | TransactionType | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const selectedType = transactionTypeOptions.find(opt => opt.value === formData.type);
  const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
  const selectedCategory = filteredCategories.find(cat => cat.id === formData.categoryId);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Tambah Transaksi Baru</h1>
            <p className="mt-1 text-sm text-gray-600">
              Catat pemasukan atau pengeluaran Anda
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Transaksi berhasil ditambahkan! Mengalihkan ke daftar transaksi...
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
              <CardTitle>Informasi Transaksi</CardTitle>
              <CardDescription>
                Masukkan detail transaksi yang ingin Anda catat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Type */}
              <div className="space-y-3">
                <Label>
                  Jenis Transaksi <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {transactionTypeOptions.map((option) => {
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

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Jumlah <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {selectedAccount?.currency || 'IDR'}
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
                    className="pl-16 text-lg font-semibold"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Masukkan jumlah {formData.type === TransactionType.INCOME ? 'pemasukan' : 'pengeluaran'}
                </p>
              </div>

              {/* Account and Category */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Account */}
                <div className="space-y-2">
                  <Label htmlFor="accountId">
                    Rekening <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => handleChange('accountId', value)}
                    disabled={loading || success || accounts.length === 0}
                  >
                    <SelectTrigger id="accountId">
                      <SelectValue placeholder="Pilih rekening" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {accounts.length === 0 && (
                    <p className="text-xs text-red-500">
                      Anda belum memiliki rekening. <Link href="/accounts/new" className="underline">Tambah rekening</Link>
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange('categoryId', value)}
                    disabled={loading || success || filteredCategories.length === 0}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredCategories.length === 0 && (
                    <p className="text-xs text-red-500">
                      Belum ada kategori untuk {formData.type === TransactionType.INCOME ? 'pemasukan' : 'pengeluaran'}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => handleChange('date', date)}
                  disabled={loading || success}
                  placeholder="Pilih tanggal transaksi"
                />
                <p className="text-xs text-gray-500">
                  Pilih tanggal transaksi dilakukan
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Catatan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk transaksi ini..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={loading || success}
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (Opsional)</Label>
                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tagId) => {
                      const tag = allTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <Badge
                          key={tagId}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            borderColor: tag.color,
                          }}
                        >
                          <Hash className="h-3 w-3" />
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              tags: prev.tags.filter(id => id !== tagId)
                            }))}
                            className="ml-1 hover:bg-black/10 rounded p-0.5"
                            disabled={loading || success}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {/* Available Tags */}
                {allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {allTags
                      .filter(tag => !formData.tags.includes(tag.id))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag.id]
                          }))}
                          disabled={loading || success}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border hover:scale-105 transition-transform disabled:opacity-50"
                          style={{
                            backgroundColor: `${tag.color}10`,
                            color: tag.color,
                            borderColor: `${tag.color}40`,
                          }}
                        >
                          <Hash className="h-3 w-3" />
                          {tag.name}
                        </button>
                      ))}
                    {allTags.filter(tag => !formData.tags.includes(tag.id)).length === 0 && (
                      <span className="text-xs text-gray-500">Semua tag sudah dipilih</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Belum ada tag. <Link href="/tags/new" className="text-indigo-600 hover:underline">Buat tag baru</Link>
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/transactions')}
                  disabled={loading || success}
                  className="flex-1 md:flex-none"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || success || accounts.length === 0 || filteredCategories.length === 0}
                  className="flex-1 md:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Transaksi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Preview Card */}
        {formData.amount > 0 && selectedAccount && selectedCategory && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                Begini tampilan transaksi Anda di daftar
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
                      <h3 className="font-semibold text-gray-900">{selectedCategory.name}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedAccount.name} • {formData.date.toLocaleDateString('id-ID')}
                      </p>
                      {formData.notes && (
                        <p className="text-xs text-gray-500 mt-1">{formData.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${formData.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.type === TransactionType.INCOME ? '+' : '-'} {selectedAccount.currency} {formData.amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
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
