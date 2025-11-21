'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getTagById, updateTag } from '@/lib/services/tag.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Save, Hash } from 'lucide-react';
import Link from 'next/link';

// Pilihan warna untuk tags
const COLOR_OPTIONS = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Ungu' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#EF4444', label: 'Merah' },
  { value: '#F97316', label: 'Orange' },
  { value: '#F59E0B', label: 'Kuning' },
  { value: '#10B981', label: 'Hijau' },
  { value: '#3B82F6', label: 'Biru' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#6B7280', label: 'Abu-abu' },
];

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const tagId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#6366F1',
  });

  // Load tag data
  useEffect(() => {
    async function loadTag() {
      if (!tagId) return;

      try {
        setLoading(true);
        const tag = await getTagById(tagId);

        if (!tag) {
          setError('Tag tidak ditemukan');
          return;
        }

        setFormData({
          name: tag.name,
          color: tag.color || '#6366F1',
        });
      } catch (err) {
        console.error('Error loading tag:', err);
        setError('Gagal memuat data tag');
      } finally {
        setLoading(false);
      }
    }

    loadTag();
  }, [tagId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    if (!formData.name.trim()) {
      setError('Nama tag harus diisi');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateTag(tagId, {
        name: formData.name.trim(),
        color: formData.color,
      });

      router.push('/tags');
    } catch (err) {
      console.error('Error updating tag:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengupdate tag');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tags">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tag</h1>
            <p className="mt-1 text-sm text-gray-600">
              Ubah informasi tag
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
            <CardTitle>Informasi Tag</CardTitle>
            <CardDescription>
              Ubah informasi tag yang ada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Tag */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">
                  Nama Tag <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: bisnis, liburan, darurat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-gray-900"
                />
              </div>

              {/* Warna */}
              <div className="space-y-2">
                <Label className="text-gray-900">Warna</Label>
                <div className="grid grid-cols-5 gap-2">
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
                      <div className="text-xs font-medium text-white drop-shadow-sm">
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
                      className="flex items-center justify-center w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: formData.color }}
                    >
                      <Hash className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formData.name || 'Nama Tag'}
                      </div>
                      <div
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                        style={{
                          backgroundColor: `${formData.color}20`,
                          color: formData.color,
                        }}
                      >
                        #{formData.name || 'tag'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tags')}
                  disabled={saving}
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
