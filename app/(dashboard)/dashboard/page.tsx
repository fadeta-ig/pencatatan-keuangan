'use client';

import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userData } = useAuth();

  const stats = [
    {
      title: 'Total Saldo',
      value: 0,
      change: '+0%',
      changeType: 'neutral',
      icon: Wallet,
      gradient: 'from-blue-500 to-cyan-500',
      lightBg: 'bg-blue-50',
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: 0,
      change: '+0%',
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      lightBg: 'bg-green-50',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: 0,
      change: '+0%',
      changeType: 'negative',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-500',
      lightBg: 'bg-red-50',
    },
  ];

  const quickActions = [
    {
      title: 'Tambah Rekening',
      description: 'Kelola rekening bank Anda',
      icon: Wallet,
      href: '/accounts',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Catat Pemasukan',
      description: 'Tambah pemasukan baru',
      icon: ArrowUpRight,
      href: '/transactions?type=income',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Catat Pengeluaran',
      description: 'Tambah pengeluaran baru',
      icon: ArrowDownRight,
      href: '/transactions?type=expense',
      gradient: 'from-red-500 to-rose-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Transfer Antar Akun',
      description: 'Transfer dana antar rekening',
      icon: ArrowRightLeft,
      href: '/transactions?type=transfer',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Lihat Laporan',
      description: 'Analisis keuangan Anda',
      icon: BarChart3,
      href: '/reports',
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Kelola Kategori',
      description: 'Atur kategori transaksi',
      icon: PieChart,
      href: '/categories',
      gradient: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Dashboard Keuangan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Selamat Datang, {userData?.name?.split(' ')[0] || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Berikut adalah ringkasan keuangan Anda untuk bulan {currentMonth}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm">
                <DollarSign className="w-3 h-3 mr-1" />
                {userData?.currency || 'IDR'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(stat.value, userData?.currency || 'IDR')}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <span className={`font-medium ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : stat.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-gray-500">dari bulan lalu</span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Aksi Cepat</CardTitle>
                <CardDescription>
                  Mulai kelola keuangan Anda sekarang
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/transactions">
                  Lihat Semua
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href}>
                    <div className="group flex items-start gap-4 rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Akun</CardTitle>
              <CardDescription>
                Detail profil dan preferensi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{userData?.name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mata Uang Default</p>
                    <Badge className="mt-1 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                      {userData?.currency || 'IDR'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Zona Waktu</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{userData?.timezone || 'Asia/Jakarta'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State - Recent Transactions */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
                  <CardDescription>
                    Aktivitas keuangan terakhir Anda
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/transactions">
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum Ada Transaksi
                </h3>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">
                  Mulai catat transaksi keuangan Anda untuk melihat ringkasan dan analisis di sini
                </p>
                <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link href="/transactions">
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Transaksi
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
