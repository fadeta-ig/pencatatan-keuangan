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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kategori</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola kategori pemasukan dan pengeluaran
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Kategori
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                  <Folder className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Kategori Pemasukan
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.income}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Kategori Pengeluaran
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.expense}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories List dengan Tabs */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>Daftar Kategori</CardTitle>
            <CardDescription>
              Semua kategori pemasukan dan pengeluaran Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | CategoryType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value={CategoryType.INCOME}>Pemasukan</TabsTrigger>
                <TabsTrigger value={CategoryType.EXPENSE}>Pengeluaran</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Folder className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Belum Ada Kategori
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-sm">
                      Tambahkan kategori untuk mengorganisir transaksi pemasukan dan pengeluaran Anda
                    </p>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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

                      return (
                        <div
                          key={category.id}
                          className="group flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          {/* Icon */}
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg text-2xl flex-shrink-0 shadow-sm"
                            style={{
                              backgroundColor: category.color || (isIncome ? '#10B981' : '#EF4444'),
                            }}
                          >
                            <span className="filter drop-shadow-sm">
                              {category.icon || (isIncome ? '💰' : '💸')}
                            </span>
                          </div>

                          {/* Category Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {category.name}
                              </h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-3 w-3 text-gray-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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
                              className={`text-xs mb-1 ${
                                isIncome
                                  ? 'border-green-300 text-green-700 bg-green-50'
                                  : 'border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                            </Badge>

                            {category.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
