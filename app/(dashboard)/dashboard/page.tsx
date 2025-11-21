'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserAccounts } from '@/lib/services/account.service';
import { getUserTransactions } from '@/lib/services/transaction.service';
import { getUserCategories } from '@/lib/services/category.service';
import { CategoryType } from '@/types/firestore';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [totalBalance, setTotalBalance] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load account and transaction data
  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load accounts
        const accountsData = await getUserAccounts(user.uid, true);
        const total = accountsData.reduce((sum, account) => sum + account.currentBalance, 0);
        setTotalBalance(total);
        setAccountCount(accountsData.length);
        setAccounts(accountsData);

        // Load transactions (last 90 days)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        const txns = await getUserTransactions(user.uid, {
          startDate,
          limit: 100,
        });
        setTransactions(txns);

        // Load categories
        const categoriesData = await getUserCategories(user.uid, true);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.uid]);

  // Calculate monthly income and expense
  const { monthlyIncome, monthlyExpense, previousMonthIncome, previousMonthExpense } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let income = 0;
    let expense = 0;
    let prevIncome = 0;
    let prevExpense = 0;

    transactions.forEach((txn) => {
      const txnDate = txn.date.toDate();
      const txnMonth = txnDate.getMonth();
      const txnYear = txnDate.getFullYear();

      // Current month
      if (txnMonth === currentMonth && txnYear === currentYear) {
        if (txn.type === CategoryType.INCOME) {
          income += txn.amount;
        } else if (txn.type === CategoryType.EXPENSE) {
          expense += txn.amount;
        }
      }

      // Previous month
      if (txnMonth === previousMonth && txnYear === previousYear) {
        if (txn.type === CategoryType.INCOME) {
          prevIncome += txn.amount;
        } else if (txn.type === CategoryType.EXPENSE) {
          prevExpense += txn.amount;
        }
      }
    });

    return {
      monthlyIncome: income,
      monthlyExpense: expense,
      previousMonthIncome: prevIncome,
      previousMonthExpense: prevExpense,
    };
  }, [transactions]);

  // Calculate percentage changes
  const incomeChange = previousMonthIncome > 0
    ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome * 100).toFixed(1)
    : monthlyIncome > 0 ? '+100' : '0';

  const expenseChange = previousMonthExpense > 0
    ? ((monthlyExpense - previousMonthExpense) / previousMonthExpense * 100).toFixed(1)
    : monthlyExpense > 0 ? '+100' : '0';

  const stats = [
    {
      title: 'Total Saldo',
      value: totalBalance,
      change: '+0%',
      changeType: 'neutral',
      icon: Wallet,
      gradient: 'from-blue-500 to-cyan-500',
      lightBg: 'bg-blue-50',
      description: `${accountCount} rekening aktif`,
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: monthlyIncome,
      change: `${incomeChange > 0 ? '+' : ''}${incomeChange}%`,
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      lightBg: 'bg-green-50',
      description: `${transactions.filter(t => t.type === CategoryType.INCOME && t.date.toDate().getMonth() === new Date().getMonth()).length} transaksi`,
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: monthlyExpense,
      change: `${expenseChange > 0 ? '+' : ''}${expenseChange}%`,
      changeType: 'negative',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-500',
      lightBg: 'bg-red-50',
      description: `${transactions.filter(t => t.type === CategoryType.EXPENSE && t.date.toDate().getMonth() === new Date().getMonth()).length} transaksi`,
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

  // Prepare chart data - Last 7 days trend
  const trendChartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(txn => {
        const txnDate = txn.date.toDate();
        txnDate.setHours(0, 0, 0, 0);
        return txnDate.getTime() === date.getTime();
      });

      const income = dayTransactions
        .filter(t => t.type === CategoryType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter(t => t.type === CategoryType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        Pemasukan: income,
        Pengeluaran: expense,
      };
    });
  }, [transactions]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())
      .slice(0, 5);
  }, [transactions]);

  // Prepare category data for both income and expense
  const { expenseCategoryData, incomeCategoryData } = useMemo(() => {
    // Create category lookup map
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.id, { name: cat.name, color: cat.color || '#94a3b8' });
    });

    // Calculate expense by category
    const expenseMap = new Map<string, { name: string; value: number; color: string }>();
    transactions
      .filter(t => t.type === CategoryType.EXPENSE)
      .forEach(txn => {
        const categoryId = txn.categoryId || 'uncategorized';
        const categoryInfo = categoryMap.get(categoryId);
        const categoryName = categoryInfo?.name || 'Tanpa Kategori';
        const categoryColor = categoryInfo?.color || '#94a3b8';

        if (expenseMap.has(categoryId)) {
          const existing = expenseMap.get(categoryId)!;
          expenseMap.set(categoryId, {
            ...existing,
            value: existing.value + txn.amount,
          });
        } else {
          expenseMap.set(categoryId, {
            name: categoryName,
            value: txn.amount,
            color: categoryColor,
          });
        }
      });

    // Calculate income by category
    const incomeMap = new Map<string, { name: string; value: number; color: string }>();
    transactions
      .filter(t => t.type === CategoryType.INCOME)
      .forEach(txn => {
        const categoryId = txn.categoryId || 'uncategorized';
        const categoryInfo = categoryMap.get(categoryId);
        const categoryName = categoryInfo?.name || 'Tanpa Kategori';
        const categoryColor = categoryInfo?.color || '#94a3b8';

        if (incomeMap.has(categoryId)) {
          const existing = incomeMap.get(categoryId)!;
          incomeMap.set(categoryId, {
            ...existing,
            value: existing.value + txn.amount,
          });
        } else {
          incomeMap.set(categoryId, {
            name: categoryName,
            value: txn.amount,
            color: categoryColor,
          });
        }
      });

    return {
      expenseCategoryData: Array.from(expenseMap.values()).sort((a, b) => b.value - a.value),
      incomeCategoryData: Array.from(incomeMap.values()).sort((a, b) => b.value - a.value),
    };
  }, [transactions, categories]);

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

        {/* Stats Grid - Glassmorphism & Liquid Gradient */}
        <div className="grid gap-6 md:grid-cols-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl p-6 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </>
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              const isBalance = index === 0;
              const isIncome = index === 1;
              const isExpense = index === 2;

              return (
                <div
                  key={stat.title}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02]"
                >
                  {/* Animated Liquid Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-90`}>
                    {/* Liquid orbs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse delay-100" />
                  </div>

                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

                  {/* Border gradient */}
                  <div className="absolute inset-0 rounded-3xl border border-white/30 shadow-2xl" />

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                          <Icon className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                        <span className="text-sm font-semibold text-white drop-shadow-md">
                          {stat.title}
                        </span>
                      </div>
                      {!isBalance && (
                        <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                          <span className="text-xs font-bold text-white drop-shadow-md">
                            {stat.change}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amount - Large Display */}
                    <div className="py-2">
                      <p className="text-4xl font-black text-white drop-shadow-lg tracking-tight">
                        {formatCurrency(stat.value, userData?.currency || 'IDR')}
                      </p>
                    </div>

                    {/* Description & Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-lg" />
                        <span className="text-sm text-white/90 drop-shadow-md">
                          {stat.description}
                        </span>
                      </div>

                      {/* Glassmorphic Progress Bar */}
                      {!isBalance && (
                        <div className="relative h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                          <div
                            className="absolute inset-y-0 left-0 bg-white/40 backdrop-blur-md rounded-full shadow-inner transition-all duration-700 ease-out"
                            style={{
                              width: `${stat.value > 0 ? Math.min((stat.value / (monthlyIncome + monthlyExpense)) * 100, 100) : 0}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/10" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </div>
              );
            })
          )}
        </div>


        {/* Charts Section - Minimalist Layout */}
        {!loading && transactions.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trend Chart - Minimalist */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Tren 7 Hari</h3>
                <Badge variant="outline" className="text-xs">Harian</Badge>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, userData?.currency || 'IDR')}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  />
                  <Bar dataKey="Pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution - Minimalist */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Kategori</h3>
                <Badge variant="outline" className="text-xs">Top 5</Badge>
              </div>
              {(expenseCategoryData.length > 0 || incomeCategoryData.length > 0) ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Expense */}
                  {expenseCategoryData.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs font-semibold text-red-600">Pengeluaran</span>
                      </div>
                      <ResponsiveContainer width="100%" height={140}>
                        <RePieChart>
                          <Pie
                            data={expenseCategoryData.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {expenseCategoryData.slice(0, 5).map((entry, index) => (
                              <Cell key={`expense-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value, userData?.currency || 'IDR')}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              fontSize: '11px',
                              padding: '6px 10px'
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1 mt-2">
                        {expenseCategoryData.slice(0, 3).map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-[10px] text-gray-600 truncate flex-1">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Income */}
                  {incomeCategoryData.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-semibold text-green-600">Pemasukan</span>
                      </div>
                      <ResponsiveContainer width="100%" height={140}>
                        <RePieChart>
                          <Pie
                            data={incomeCategoryData.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {incomeCategoryData.slice(0, 5).map((entry, index) => (
                              <Cell key={`income-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value, userData?.currency || 'IDR')}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              fontSize: '11px',
                              padding: '6px 10px'
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1 mt-2">
                        {incomeCategoryData.slice(0, 3).map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-[10px] text-gray-600 truncate flex-1">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PieChart className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">Belum ada data</p>
                </div>
              )}
            </div>

            {/* Monthly Summary - Minimalist */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Ringkasan</h3>
                <Badge variant="outline" className="text-xs">Bulan Ini</Badge>
              </div>
              <div className="grid gap-3 grid-cols-2">
                {/* Net Income */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-[10px] font-medium text-gray-600 mb-1">Net</p>
                  <p className={`text-xl font-bold ${monthlyIncome - monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(monthlyIncome - monthlyExpense, userData?.currency || 'IDR')}
                  </p>
                </div>

                {/* Pemasukan */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <p className="text-[10px] font-medium text-gray-600 mb-1">In</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(monthlyIncome, userData?.currency || 'IDR')}
                  </p>
                </div>

                {/* Pengeluaran */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
                  <p className="text-[10px] font-medium text-gray-600 mb-1">Out</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(monthlyExpense, userData?.currency || 'IDR')}
                  </p>
                </div>

                {/* Savings Rate */}
                {monthlyIncome > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                    <p className="text-[10px] font-medium text-gray-600 mb-1">Save</p>
                    <p className="text-xl font-bold text-purple-600">
                      {((monthlyIncome - monthlyExpense) / monthlyIncome * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accounts Overview - Professional Bank Cards */}
        {!loading && accounts.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rekening Saya</h2>
                <p className="text-sm text-gray-600 mt-1">Kelola dan pantau semua rekening Anda</p>
              </div>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg"
              >
                <Link href="/accounts">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account, index) => {
                // Dynamic gradient based on index
                const gradients = [
                  'from-slate-900 via-slate-800 to-slate-900',
                  'from-blue-900 via-blue-800 to-indigo-900',
                  'from-purple-900 via-purple-800 to-pink-900',
                  'from-emerald-900 via-teal-800 to-cyan-900',
                  'from-orange-900 via-red-800 to-rose-900',
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link key={account.id} href={`/accounts/${account.id}`}>
                    <div className="group relative aspect-[1.586/1] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:rotate-1">
                      {/* Bank Card Background - Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                        {/* Texture overlay */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Animated orbs for premium feel */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>

                      {/* Card shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Card Content */}
                      <div className="relative h-full p-6 flex flex-col justify-between">
                        {/* Top Section */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                              <Wallet className="w-3 h-3 text-white" />
                              <span className="text-xs font-medium text-white/90">{account.type}</span>
                            </div>
                          </div>
                          {/* Chip simulation */}
                          <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-lg opacity-80" />
                        </div>

                        {/* Middle Section - Account Number */}
                        {account.accountNumber && (
                          <div className="py-2">
                            <p className="text-white/60 text-xs font-mono tracking-widest">
                              {account.accountNumber.replace(/(.{4})/g, '$1 ').trim()}
                            </p>
                          </div>
                        )}

                        {/* Bottom Section */}
                        <div className="space-y-3">
                          {/* Account Name */}
                          <div>
                            <p className="text-sm text-white/60 mb-1">Account Name</p>
                            <h3 className="text-lg font-bold text-white drop-shadow-lg truncate">
                              {account.name}
                            </h3>
                          </div>

                          {/* Balance */}
                          <div>
                            <p className="text-xs text-white/60 mb-1">Current Balance</p>
                            <p className="text-2xl font-black text-white drop-shadow-lg">
                              {formatCurrency(account.currentBalance, account.currency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card border glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/20 shadow-2xl" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Transactions & Quick Info */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Recent Transactions - 3 columns */}
          <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-8 lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Transaksi Terbaru</h3>
                <p className="text-sm text-gray-600 mt-1">5 aktivitas keuangan terakhir</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-white/50">
                <Link href="/transactions">
                  Lihat Semua
                </Link>
              </Button>
            </div>
            <div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Transaksi
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 max-w-sm">
                    Mulai catat transaksi keuangan Anda
                  </p>
                  <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link href="/transactions">
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Transaksi
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((txn) => {
                    const isIncome = txn.type === CategoryType.INCOME;
                    return (
                      <div
                        key={txn.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                          {isIncome ? (
                            <ArrowUpRight className={`h-5 w-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                          ) : (
                            <ArrowDownRight className={`h-5 w-5 text-red-600`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {txn.description || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {txn.date.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="/transactions">
                        Lihat Semua Transaksi
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Account Info - Minimalist */}
          <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Aksi & Info</h3>
            </div>
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Aksi Cepat</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.slice(0, 6).map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.title} href={action.href} title={action.title}>
                        <div className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                          <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">
                            {action.title.split(' ')[0]}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200" />

              {/* Account Info - Minimalist */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Info Akun</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">User</span>
                    <span className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">
                      {userData?.name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Currency</span>
                    <Badge className="text-xs h-5 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                      {userData?.currency || 'IDR'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Accounts</span>
                    <span className="text-xs font-semibold text-gray-900">{accountCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Timezone</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {userData?.timezone || 'Asia/Jakarta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Link */}
              <Button variant="outline" size="sm" asChild className="w-full hover:bg-white/50">
                <Link href="/settings">
                  <Settings className="h-3 w-3 mr-1.5" />
                  Pengaturan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
