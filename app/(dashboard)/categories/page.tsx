'use client';

import { useAuth } from '@/lib/auth';
import { useCategories } from '@/hooks';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryType } from '@/types/firestore';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  Folder,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useCallback, useMemo } from 'react';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | CategoryType>('all');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch categories berdasarkan tab aktif
  const filterType = activeTab === 'all' ? undefined : activeTab;
  const { categories, loading, error, removeCategory } = useCategories({
    userId: user?.uid,
    type: filterType,
    activeOnly: true,
  });

  // Statistik
  const stats = useMemo(() => {
    const incomeCount = categories.filter(c => c.type === CategoryType.INCOME).length;
    const expenseCount = categories.filter(c => c.type === CategoryType.EXPENSE).length;
    return {
      total: categories.length,
      income: incomeCount,
      expense: expenseCount,
    };
  }, [categories]);

  // Handle delete dengan error handling
  const handleDelete = useCallback(async (categoryId: string, categoryName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) {
      return;
    }

    try {
      setDeleteError(null);
      await removeCategory(categoryId);
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError('Gagal menghapus kategori. Silakan coba lagi.');
    }
  }, [removeCategory]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kategori</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola kategori pemasukan dan pengeluaran
            </p>
          </div>
          <Button asChild className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
            <Link href="/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Link>
          </Button>
        </div>

        {/* Error Alert */}
        {(error || deleteError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || deleteError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards - Glassmorphism */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Categories Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-600 opacity-90">
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Total Kategori
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {stats.total}
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Folder className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Income Categories Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-green-600 to-emerald-600 opacity-90">
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Kategori Pemasukan
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {stats.income}
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Expense Categories Card */}
          <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
            {/* Animated Liquid Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-red-600 to-rose-600 opacity-90">
              {/* Liquid orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Border gradient */}
            <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Kategori Pengeluaran
                  </p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {stats.expense}
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="h-7 w-7 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List - Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Daftar Kategori</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Semua kategori pemasukan dan pengeluaran Anda
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | CategoryType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/60 backdrop-blur-sm p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Semua
                </TabsTrigger>
                <TabsTrigger value={CategoryType.INCOME} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Pemasukan
                </TabsTrigger>
                <TabsTrigger value={CategoryType.EXPENSE} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Pengeluaran
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-lg">
                      <Folder className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Belum Ada Kategori
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-sm">
                      Tambahkan kategori untuk mengorganisir transaksi pemasukan dan pengeluaran Anda
                    </p>
                    <Button asChild className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                      <Link href="/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Kategori
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                      const isIncome = category.type === CategoryType.INCOME;
                      const categoryColor = category.color || (isIncome ? '#10B981' : '#EF4444');

                      return (
                        <div
                          key={category.id}
                          className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="flex items-start gap-3 p-4">
                            {/* Icon with Color */}
                            <div
                              className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor})`
                              }}
                            >
                              <span className="filter drop-shadow-sm">
                                {category.icon || (isIncome ? '💰' : '💸')}
                              </span>
                            </div>

                            {/* Category Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-sm">
                                  {category.name}
                                </h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/60"
                                    >
                                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/categories/${category.id}/edit`} className="cursor-pointer text-sm">
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 cursor-pointer text-sm"
                                      onClick={() => handleDelete(category.id, category.name)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0 mb-2 ${
                                  isIncome
                                    ? 'border-green-300 text-green-700 bg-green-50'
                                    : 'border-red-300 text-red-700 bg-red-50'
                                }`}
                              >
                                {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                              </Badge>

                              {category.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
