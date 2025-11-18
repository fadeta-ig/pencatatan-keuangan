import Link from 'next/link';
import { Wallet, TrendingUp, Shield, Smartphone, BarChart3, ArrowRightLeft, Tag, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const features = [
    {
      icon: Wallet,
      title: 'Multi Rekening',
      description: 'Kelola berbagai jenis rekening seperti bank, cash, e-wallet, dan investasi dalam satu dashboard.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analitik',
      description: 'Visualisasi keuangan dengan grafik interaktif dan chart yang mudah dipahami.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Pencarian & Filter',
      description: 'Temukan transaksi dengan cepat menggunakan filter tanggal, kategori, dan tag yang canggih.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: ArrowRightLeft,
      title: 'Transfer Antar Akun',
      description: 'Catat perpindahan dana antar rekening dengan mudah, cepat, dan akurat.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Tag,
      title: 'Kategori & Tag',
      description: 'Organisasi transaksi yang fleksibel dengan sistem kategori dan tag yang powerful.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Download,
      title: 'Ekspor CSV',
      description: 'Export data keuangan untuk analisis lebih lanjut atau backup kapan saja.',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const benefits = [
    'Gratis selamanya untuk penggunaan personal',
    'Data terenkripsi dengan standar keamanan tinggi',
    'Akses dari mana saja, kapan saja',
    'Support multi mata uang',
    'Interface yang mudah digunakan',
    'Update fitur berkala',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pencatatan Keuangan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  Daftar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Platform Terpercaya untuk Kelola Keuangan
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
              Kelola Keuangan Anda
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dengan Lebih Mudah
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Aplikasi pencatatan keuangan modern untuk pribadi dan bisnis kecil.
              Lacak pemasukan, pengeluaran, dan kelola berbagai rekening dalam satu tempat yang aman.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 text-base px-8 py-6">
                  Mulai Sekarang - Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-base px-8 py-6">
                  Sudah Punya Akun?
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>100% Aman & Terenkripsi</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>Responsive di Semua Device</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Gratis Selamanya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Kebutuhan Anda
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola keuangan dengan lebih baik dan efisien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih Platform Kami?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Kami berkomitmen memberikan pengalaman terbaik dalam mengelola keuangan Anda dengan fitur-fitur unggulan.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
              <Card className="relative shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-xl">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Mulai Gratis Hari Ini
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Tidak perlu kartu kredit. Daftar dalam hitungan detik dan mulai kelola keuangan Anda dengan lebih baik.
                    </p>
                    <Link href="/register">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 py-6">
                        Daftar Sekarang - 100% Gratis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Mengelola Keuangan dengan Lebih Baik?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan mengelola keuangan
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-200 px-8 py-6 text-base">
              Mulai Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Pencatatan Keuangan</span>
            </div>
            <p className="text-center text-gray-600 text-sm">
              © 2024 Pencatatan Keuangan. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
