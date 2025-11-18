'use client';

import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/format';
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, userData } = useAuth();

  const stats = [
    {
      title: 'Total Saldo',
      value: 0,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {userData?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Berikut adalah ringkasan keuangan Anda hari ini.
          </p>
        </div>

        {/* Phase 4 Completion Alert */}
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Phase 4 Berhasil Diimplementasikan!</AlertTitle>
          <AlertDescription>
            Core UI Components Library telah berhasil dibuat. Aplikasi sekarang menggunakan komponen-komponen reusable yang modern dan konsisten.
            <div className="mt-2 flex gap-2">
              <Badge className="border border-green-200 bg-green-50 text-green-700">Button</Badge>
              <Badge className="border border-green-200 bg-green-50 text-green-700">Input</Badge>
              <Badge className="border border-green-200 bg-green-50 text-green-700">Card</Badge>
              <Badge className="border border-green-200 bg-green-50 text-green-700">Dialog</Badge>
              <Badge className="border border-green-200 bg-green-50 text-green-700">Form</Badge>
              <Badge className="border border-green-200 bg-green-50 text-green-700">Layout</Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.value, userData?.currency || 'IDR')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>
              Detail profil dan preferensi Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                <p className="mt-1 text-sm text-gray-900">{userData?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mata Uang Default</p>
                <p className="mt-1 text-sm text-gray-900">
                  <Badge className="border border-gray-200 bg-transparent">{userData?.currency || 'IDR'}</Badge>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Zona Waktu</p>
                <p className="mt-1 text-sm text-gray-900">{userData?.timezone || 'Asia/Jakarta'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Mulai kelola keuangan Anda sekarang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Wallet className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Tambah Rekening</h3>
                <p className="text-xs text-gray-500 mt-1">Kelola rekening bank Anda</p>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <ArrowRightLeft className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Catat Transaksi</h3>
                <p className="text-xs text-gray-500 mt-1">Tambah pemasukan/pengeluaran</p>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Lihat Laporan</h3>
                <p className="text-xs text-gray-500 mt-1">Analisis keuangan Anda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
