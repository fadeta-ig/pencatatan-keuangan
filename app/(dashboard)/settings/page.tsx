'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transactionAlerts: true,
    weeklyReport: true,
    monthlyReport: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    showBalance: true,
    shareData: false,
    twoFactorAuth: false,
  });

  // Data Settings
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    retentionPeriod: '1year',
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // TODO: Implement save settings to Firestore
      // await updateUserSettings(user?.uid, { notifications, privacy, dataSettings });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setError(null);
      // TODO: Implement data export
      alert('Fitur ekspor data akan segera tersedia');
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Gagal mengekspor data');
    }
  };

  const handleImportData = async () => {
    try {
      setError(null);
      // TODO: Implement data import
      alert('Fitur impor data akan segera tersedia');
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Gagal mengimpor data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan dihapus permanen.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Ketik "HAPUS AKUN" untuk mengkonfirmasi penghapusan akun:'
    );

    if (doubleConfirm !== 'HAPUS AKUN') {
      alert('Konfirmasi tidak sesuai. Penghapusan akun dibatalkan.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement account deletion
      // await deleteUserAccount(user?.uid);

      alert('Akun akan segera dihapus');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Gagal menghapus akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola preferensi aplikasi dan pengaturan keamanan Anda
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Pengaturan berhasil disimpan!
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

        {/* Notification Settings */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              Notifikasi
            </h3>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="email-notif" className="text-gray-900 font-semibold cursor-pointer">
                    Notifikasi Email
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Terima notifikasi melalui email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="push-notif" className="text-gray-900 font-semibold cursor-pointer">
                    Notifikasi Push
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Terima notifikasi push di browser
                  </p>
                </div>
                <Switch
                  id="push-notif"
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              {/* Transaction Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="transaction-alerts" className="text-gray-900 font-semibold cursor-pointer">
                    Notifikasi Transaksi
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Terima notifikasi setiap ada transaksi baru
                  </p>
                </div>
                <Switch
                  id="transaction-alerts"
                  checked={notifications.transactionAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, transactionAlerts: checked })
                  }
                />
              </div>

              {/* Weekly Report */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="weekly-report" className="text-gray-900 font-semibold cursor-pointer">
                    Laporan Mingguan
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Terima ringkasan keuangan setiap minggu
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>

              {/* Monthly Report */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="monthly-report" className="text-gray-900 font-semibold cursor-pointer">
                    Laporan Bulanan
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Terima ringkasan keuangan setiap bulan
                  </p>
                </div>
                <Switch
                  id="monthly-report"
                  checked={notifications.monthlyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, monthlyReport: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security Settings */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Privasi & Keamanan
            </h3>

            <div className="space-y-6">
              {/* Show Balance */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="show-balance" className="text-gray-900 font-semibold cursor-pointer">
                    Tampilkan Saldo
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Tampilkan saldo rekening di dashboard
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {privacy.showBalance ? (
                    <Eye className="h-4 w-4 text-gray-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  )}
                  <Switch
                    id="show-balance"
                    checked={privacy.showBalance}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showBalance: checked })
                    }
                  />
                </div>
              </div>

              {/* Share Data */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="share-data" className="text-gray-900 font-semibold cursor-pointer">
                    Bagikan Data Analitik
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Bantu kami meningkatkan layanan dengan berbagi data anonim
                  </p>
                </div>
                <Switch
                  id="share-data"
                  checked={privacy.shareData}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, shareData: checked })
                  }
                />
              </div>

              {/* Two-Factor Auth */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="2fa" className="text-gray-900 font-semibold cursor-pointer">
                    Autentikasi Dua Faktor
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Tambahkan lapisan keamanan ekstra ke akun Anda
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={privacy.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPrivacy({ ...privacy, twoFactorAuth: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              Manajemen Data
            </h3>

            <div className="space-y-6">
              {/* Auto Backup */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <div className="flex-1">
                  <Label htmlFor="auto-backup" className="text-gray-900 font-semibold cursor-pointer">
                    Backup Otomatis
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Backup data Anda secara otomatis
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={dataSettings.autoBackup}
                  onCheckedChange={(checked) =>
                    setDataSettings({ ...dataSettings, autoBackup: checked })
                  }
                />
              </div>

              {/* Backup Frequency */}
              {dataSettings.autoBackup && (
                <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                  <Label htmlFor="backup-freq" className="text-gray-900 font-semibold">
                    Frekuensi Backup
                  </Label>
                  <p className="text-xs text-gray-600 mt-1 mb-3">
                    Seberapa sering data Anda akan dibackup
                  </p>
                  <Select
                    value={dataSettings.backupFrequency}
                    onValueChange={(value) =>
                      setDataSettings({ ...dataSettings, backupFrequency: value })
                    }
                  >
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Retention Period */}
              <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40">
                <Label htmlFor="retention" className="text-gray-900 font-semibold">
                  Periode Penyimpanan Data
                </Label>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  Berapa lama data transaksi akan disimpan
                </p>
                <Select
                  value={dataSettings.retentionPeriod}
                  onValueChange={(value) =>
                    setDataSettings({ ...dataSettings, retentionPeriod: value })
                  }
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Bulan</SelectItem>
                    <SelectItem value="1year">1 Tahun</SelectItem>
                    <SelectItem value="2years">2 Tahun</SelectItem>
                    <SelectItem value="forever">Selamanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export/Import Actions */}
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full bg-white/60 hover:bg-white/80"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ekspor Data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportData}
                  className="w-full bg-white/60 hover:bg-white/80"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Impor Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="relative overflow-hidden rounded-3xl bg-red-50/40 backdrop-blur-xl border border-red-200/50 shadow-2xl">
          <div className="p-8">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              Zona Berbahaya
            </h3>

            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-red-300/40">
              <Label className="text-red-900 font-semibold">Hapus Akun</Label>
              <p className="text-xs text-red-700 mt-1 mb-4">
                Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen dari sistem kami.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Akun Permanen
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg px-8"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
