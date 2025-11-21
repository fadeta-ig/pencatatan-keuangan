'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { updateUser } from '@/lib/services/user.service';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Globe,
  DollarSign,
  Clock,
  Save,
  AlertCircle,
  CheckCircle2,
  Edit3,
  X,
} from 'lucide-react';

const CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah (IDR)', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar (USD)', symbol: '$' },
  { code: 'EUR', name: 'Euro (EUR)', symbol: '€' },
  { code: 'GBP', name: 'British Pound (GBP)', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen (JPY)', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar (SGD)', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit (MYR)', symbol: 'RM' },
];

const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB, GMT+7)' },
  { value: 'Asia/Makassar', label: 'Makassar (WITA, GMT+8)' },
  { value: 'Asia/Jayapura', label: 'Jayapura (WIT, GMT+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'America/New_York', label: 'New York (EST, GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST, GMT-8)' },
];

const LOCALES = [
  { value: 'id-ID', label: 'Indonesia' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
];

export default function ProfilePage() {
  const { user, userData, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    locale: 'id-ID',
  });

  // Load user data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        timezone: userData.timezone || 'Asia/Jakarta',
        currency: userData.currency || 'IDR',
        locale: userData.locale || 'id-ID',
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    if (!formData.name.trim()) {
      setError('Nama harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await updateUser(user.uid, {
        name: formData.name.trim(),
        timezone: formData.timezone,
        currency: formData.currency,
        locale: formData.locale,
      });

      // Refresh user data
      await refreshUser();

      setSuccess(true);
      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengupdate profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        timezone: userData.timezone || 'Asia/Jakarta',
        currency: userData.currency || 'IDR',
        locale: userData.locale || 'id-ID',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola informasi profil dan preferensi akun Anda
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
          )}
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profil berhasil diperbarui!
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

        {/* Profile Form - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Informasi Pribadi
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-900">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing || loading}
                      required
                      className="bg-white/60 backdrop-blur-sm border-white/40 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                  </div>
                </div>
              </div>

              {/* Regional Settings Section */}
              <div className="pt-6 border-t border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  Pengaturan Regional
                </h3>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Mata Uang Utama
                    </Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      disabled={!isEditing || loading}
                    >
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40 disabled:bg-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Zona Waktu
                    </Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                      disabled={!isEditing || loading}
                    >
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40 disabled:bg-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Locale */}
                  <div className="space-y-2">
                    <Label htmlFor="locale" className="text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Bahasa
                    </Label>
                    <Select
                      value={formData.locale}
                      onValueChange={(value) => setFormData({ ...formData, locale: value })}
                      disabled={!isEditing || loading}
                    >
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40 disabled:bg-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCALES.map((locale) => (
                          <SelectItem key={locale.value} value={locale.value}>
                            {locale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-gray-200/50">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    {loading ? (
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
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Informasi Akun</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <p className="text-xs text-gray-600 mb-1">Tanggal Bergabung</p>
                <p className="text-sm font-semibold text-gray-900">
                  {userData?.createdAt?.toDate().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <p className="text-xs text-gray-600 mb-1">Terakhir Diperbarui</p>
                <p className="text-sm font-semibold text-gray-900">
                  {userData?.updatedAt?.toDate().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
