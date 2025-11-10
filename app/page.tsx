import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">💰 Pencatatan Keuangan</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Daftar Gratis
            </Link>
          </div>
        </nav>

        <main className="py-20">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
              Kelola Keuangan Anda
              <br />
              <span className="text-blue-600">Dengan Mudah</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Aplikasi pencatatan keuangan modern untuk pribadi dan bisnis kecil.
              Lacak pemasukan, pengeluaran, dan kelola berbagai rekening dalam satu tempat.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Sudah Punya Akun?
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi Rekening</h3>
              <p className="text-gray-600">
                Kelola berbagai jenis rekening seperti bank, cash, e-wallet, dan investasi.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Analitik</h3>
              <p className="text-gray-600">
                Visualisasi keuangan dengan grafik dan chart yang mudah dipahami.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pencarian & Filter</h3>
              <p className="text-gray-600">
                Temukan transaksi dengan mudah menggunakan filter tanggal, kategori, dan tag.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer Antar Akun</h3>
              <p className="text-gray-600">
                Catat perpindahan dana antar rekening dengan mudah dan akurat.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kategori & Tag</h3>
              <p className="text-gray-600">
                Organisasi transaksi yang fleksibel dengan kategori dan tag.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📤</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ekspor CSV</h3>
              <p className="text-gray-600">
                Export data keuangan untuk analisis lebih lanjut atau backup.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-lg shadow-xl p-8 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Siap Mengelola Keuangan Anda?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Daftar sekarang dan mulai mencatat keuangan Anda dengan lebih baik.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </main>

        <footer className="py-8 border-t border-gray-200 mt-20">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Pencatatan Keuangan. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
