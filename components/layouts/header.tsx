'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Menu, User, Settings, Wallet, Bell, X, PanelLeftClose, PanelLeft } from 'lucide-react';

export interface HeaderProps {
  onMenuClick?: () => void;
  onDesktopSidebarToggle?: () => void;
  desktopSidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, onDesktopSidebarToggle, desktopSidebarCollapsed }: HeaderProps) {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (userData?.name) {
      return userData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
      return 'Dashboard';
    }
    const pageName = pathSegments[pathSegments.length - 1];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex hover:bg-gray-100 transition-colors"
          onClick={onDesktopSidebarToggle}
          aria-label="Toggle sidebar"
        >
          {desktopSidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        {/* Logo & Title - Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Pencatatan Keuangan</h1>
            <p className="text-xs text-gray-500">{getPageTitle()}</p>
          </div>
        </div>

        {/* Page Title - Mobile */}
        <div className="lg:hidden">
          <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 rounded-full pl-2 pr-3 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {userData?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-gray-900 leading-none">
                      {userData?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 leading-none mt-1">
                      {user?.email}
                    </p>
                    <Badge className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                      {userData?.currency || 'IDR'}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="cursor-pointer py-2.5"
              >
                <User className="mr-3 h-4 w-4" />
                <span>Profil Saya</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="cursor-pointer py-2.5"
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5"
              >
                {isLoggingOut ? (
                  <>
                    <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    <span>Keluar...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Keluar</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
