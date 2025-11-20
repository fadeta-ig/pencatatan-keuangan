'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createCategory } from '@/lib/services/category.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoryType } from '@/types/firestore';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

// Pilihan warna yang kontras dengan background putih
const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Merah', textColor: 'white' },
  { value: '#F97316', label: 'Orange', textColor: 'white' },
  { value: '#F59E0B', label: 'Kuning', textColor: 'white' },
  { value: '#10B981', label: 'Hijau', textColor: 'white' },
  { value: '#3B82F6', label: 'Biru', textColor: 'white' },
  { value: '#6366F1', label: 'Indigo', textColor: 'white' },
  { value: '#8B5CF6', label: 'Ungu', textColor: 'white' },
  { value: '#EC4899', label: 'Pink', textColor: 'white' },
  { value: '#6B7280', label: 'Abu-abu', textColor: 'white' },
];

// Pilihan icon emoji
const ICON_OPTIONS = [
  '💰', '💵', '💸', '💳', '🏦', '💼', '📊', '📈',
  '🛒', '🍔', '🚗', '🏠', '⚡', '💡', '🎓', '🏥',
  '✈️', '🎮', '📱', '👕', '🎬', '🎵', '🏋️', '🎁',
];

export default function NewCategoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: CategoryType.EXPENSE,
    color: '#3B82F6',
    icon: '📁',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    if (!formData.name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createCategory({
        userId: user.uid,
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        description: formData.description.trim() || undefined,
        isActive: true,
      });

      // Redirect ke halaman categories
      router.push('/categories');
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'Gagal membuat kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Kategori</h1>
            <p className="mt-1 text-sm text-gray-600">
              Buat kategori baru untuk mengorganisir transaksi Anda
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>Informasi Kategori</CardTitle>
            <CardDescription>
              Isi informasi kategori yang akan dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Kategori */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">
                  Nama Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Gaji, Makanan, Transport"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-gray-900"
                />
              </div>

              {/* Tipe Kategori */}
              <div className="space-y-2">
                <Label className="text-gray-900">
                  Tipe Kategori <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: CategoryType.INCOME })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.type === CategoryType.INCOME
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">💰</div>
                    <div className="font-semibold text-gray-900">Pemasukan</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Uang yang masuk
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: CategoryType.EXPENSE })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.type === CategoryType.EXPENSE
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">💸</div>
                    <div className="font-semibold text-gray-900">Pengeluaran</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Uang yang keluar
                    </div>
                  </button>
                </div>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label className="text-gray-900">Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl border-2 rounded-lg transition-all hover:scale-110 ${
                        formData.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Icon yang dipilih: <span className="text-xl">{formData.icon}</span>
                </p>
              </div>

              {/* Warna */}
              <div className="space-y-2">
                <Label className="text-gray-900">Warna</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.color === color.value
                          ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <div className="text-xs font-medium" style={{ color: color.textColor }}>
                        {color.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-gray-900">Preview</Label>
                <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-lg text-2xl shadow-sm"
                      style={{ backgroundColor: formData.color }}
                    >
                      <span className="filter drop-shadow-sm">{formData.icon}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formData.name || 'Nama Kategori'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formData.type === CategoryType.INCOME ? 'Pemasukan' : 'Pengeluaran'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-900">
                  Deskripsi (Opsional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="text-gray-900"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Kategori
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/categories')}
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
