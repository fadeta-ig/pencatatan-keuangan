'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  Tags,
  FolderTree,
  Settings,
  FileText,
  TrendingUp,
  ArrowRightLeft,
  User,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Rekening',
    href: '/accounts',
    icon: Wallet,
  },
  {
    name: 'Transaksi',
    href: '/transactions',
    icon: ArrowUpDown,
  },
  {
    name: 'Transfer',
    href: '/transfers',
    icon: ArrowRightLeft,
  },
  {
    name: 'Kategori',
    href: '/categories',
    icon: FolderTree,
  },
  {
    name: 'Tag',
    href: '/tags',
    icon: Tags,
  },
  {
    name: 'Laporan',
    href: '/reports',
    icon: TrendingUp,
  },
];

const secondaryNavigation = [
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Dokumentasi',
    href: '/docs',
    icon: FileText,
  },
];

export interface SidebarProps {
  className?: string;
  onClose?: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ className, onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-gray-200 bg-white shadow-xl lg:shadow-none transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-200",
        isCollapsed ? "justify-center px-2" : "gap-3 px-4"
      )}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">Pencatatan Keuangan</h2>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  'group flex items-center rounded-xl text-sm font-semibold transition-all duration-200',
                  isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        <div className="pt-6">
          {!isCollapsed && (
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Lainnya
            </div>
          )}
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    'group flex items-center rounded-xl text-sm font-semibold transition-all duration-200',
                    isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <p className="text-xs font-medium text-gray-900 mb-1">Butuh bantuan?</p>
            <p className="text-xs text-gray-600 mb-2">Lihat dokumentasi lengkap</p>
            <Link
              href="/docs"
              onClick={handleLinkClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
            >
              Buka Dokumentasi →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
