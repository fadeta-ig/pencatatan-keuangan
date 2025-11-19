'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close sidebar when window is resized to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg animate-pulse">
            <Spinner size="lg" className="text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700">Memuat dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed at all times */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out',
          // Mobile show/hide
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop always visible and fixed
          'lg:translate-x-0'
        )}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          isCollapsed={desktopSidebarCollapsed}
        />
      </div>

      {/* Main content - With left margin to account for fixed sidebar */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          // Add left margin on desktop to account for sidebar width
          desktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onDesktopSidebarToggle={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
          desktopSidebarCollapsed={desktopSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto py-8 transition-all duration-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
