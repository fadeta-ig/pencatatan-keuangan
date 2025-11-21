'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useTags } from '@/hooks';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  Tag,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TagsPage() {
  const { user } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { tags, loading, error, removeTag } = useTags({
    userId: user?.uid,
  });

  // Handle delete
  const handleDelete = useCallback(async (tagId: string, tagName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus tag "${tagName}"?`)) {
      return;
    }

    try {
      setDeleteError(null);
      await removeTag(tagId);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setDeleteError('Gagal menghapus tag. Silakan coba lagi.');
    }
  }, [removeTag]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola label untuk mengorganisir transaksi Anda
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
            <Link href="/tags/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tag
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

        {/* Summary Card */}
        <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-90">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />
          <div className="relative p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 mb-2">Total Tags</p>
                <p className="text-3xl font-black text-white drop-shadow-lg">{tags.length}</p>
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Hash className="h-7 w-7 text-white drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Daftar Tags</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Semua tag untuk mengorganisir transaksi Anda
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4 shadow-lg">
                  <Tag className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Tag</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                  Tambahkan tag untuk mengorganisir dan mengelompokkan transaksi Anda dengan lebih baik
                </p>
                <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  <Link href="/tags/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Tag Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 p-4">
                      {/* Tag Icon with Color */}
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                        style={{ backgroundColor: tag.color || '#6366F1' }}
                      >
                        <Hash className="h-6 w-6 text-white drop-shadow-sm" />
                      </div>

                      {/* Tag Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{tag.name}</h3>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 py-0 mt-1"
                              style={{
                                borderColor: tag.color || '#6366F1',
                                color: tag.color || '#6366F1',
                                backgroundColor: `${tag.color || '#6366F1'}10`,
                              }}
                            >
                              Tag
                            </Badge>
                          </div>
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
                                <Link href={`/tags/${tag.id}/edit`} className="cursor-pointer text-sm">
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer text-sm"
                                onClick={() => handleDelete(tag.id, tag.name)}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
