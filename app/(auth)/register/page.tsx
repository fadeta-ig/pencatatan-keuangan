'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, Mail, Lock, User, AlertCircle, Globe, DollarSign } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    locale: 'id-ID',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Password tidak cocok');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Password minimal 6 karakter');
      return;
    }

    try {
      setIsLoading(true);
      setValidationError('');
      clearError();

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        timezone: formData.timezone,
        currency: formData.currency,
        locale: formData.locale,
      });

      router.push('/dashboard');
    } catch (err) {
      // Error is handled by auth context
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mulai Kelola Keuangan
          </h1>
          <p className="text-gray-600">
            Buat akun gratis dan mulai catat keuangan Anda
          </p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Daftar Akun</CardTitle>
            <CardDescription className="text-center">
              Isi data Anda untuk membuat akun baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10 h-11 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="nama@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10 h-11 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Min. 6 karakter"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pl-10 h-11 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Konfirmasi Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Ketik ulang"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pl-10 h-11 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Mata Uang
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                      <SelectItem value="MYR">MYR (Ringgit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Zona Waktu
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Pilih zona waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jakarta">WIB (Jakarta)</SelectItem>
                      <SelectItem value="Asia/Makassar">WITA (Makassar)</SelectItem>
                      <SelectItem value="Asia/Jayapura">WIT (Jayapura)</SelectItem>
                      <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Memproses...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Masuk di sini
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
}
