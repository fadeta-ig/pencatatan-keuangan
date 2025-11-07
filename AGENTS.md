
# Dokumen Pengembangan

Sistem Pencatatan Keuangan Next.js  
Pemasukan, Pengeluaran, Transfer, Multi Rekening, dan Dashboard

## 1. Ringkasan Proyek

Aplikasi web untuk mencatat transaksi keuangan pribadi atau bisnis kecil. Mendukung banyak rekening, kategori transaksi, transfer antar rekening, serta dashboard ringkas. Dibangun dengan Next.js agar cepat, aman, dan mudah di-deploy.

## 2. Tujuan

-   Mencatat transaksi harian dengan cepat dan akurat.
    
-   Melihat ringkasan keuangan dalam satu layar.
    
-   Memantau saldo tiap rekening dan arus kas.
    
-   Mempermudah pencarian, filter, dan ekspor laporan.
    

## 3. Ruang Lingkup Fitur

-   Autentikasi pengguna dan manajemen profil.
    
-   Manajemen rekening.
    
-   Pemasukan, pengeluaran, dan transfer.
    
-   Kategori dan tag transaksi.
    
-   Dashboard keuangan.
    
-   Pencarian, filter, dan ekspor CSV.
    
-   Multi mata uang opsional.
    
-   Kontrol akses per peran opsional.
    

## 4. Arsitektur Aplikasi

-   Framework: Next.js App Router.
    
-   UI: komponen headless + utility CSS (mis. Tailwind).
    
-   State: kombinasi Server Components, Server Actions, dan cache bawaan Next.js untuk data read.
    
-   API: Route Handlers untuk operasi CRUD.
    
-   DB: ORM modern (mis. Prisma) dengan migrasi skema.
    
-   Auth: session-based atau token-based yang aman.
    
-   Observabilitas: logging terstruktur dan audit log transaksi.
    

Catatan: Tidak mencantumkan source code. Gunakan pilihan teknologi setara sesuai preferensi tim.

## 5. Model Data Tingkat Tinggi

-   User
    
    -   id, nama, email, preferensi, timezone, currency default.
        
-   Account
    
    -   id, userId, nama rekening, tipe, currency, saldo awal, status aktif.
        
-   Category
    
    -   id, userId, nama, tipe transaksi: income atau expense, warna.
        
-   Transaction
    
    -   id, userId, accountId, type: income|expense|transfer, amount, currency, date, categoryId, notes, tags, attachmentMeta, createdAt.
        
-   Transfer
    
    -   id, userId, fromAccountId, toAccountId, amount, currency, date, notes, createdAt.
        
-   Tag
    
    -   id, userId, nama.
        
-   TransactionTag
    
    -   transactionId, tagId.
        
-   AuditLog
    
    -   id, userId, action, entity, entityId, diff, timestamp.
        

Prinsip saldo:

-   Saldo akun = saldo awal + pemasukan − pengeluaran + net transfer (masuk minus keluar).
    

## 6. Alur Pengguna Utama

1.  Onboarding
    
    -   Buat akun. Pilih mata uang dan timezone. Tambah minimal satu rekening.
        
2.  Pencatatan cepat
    
    -   Klik tombol tambah. Pilih tipe transaksi. Isi jumlah, tanggal, kategori, catatan.
        
3.  Transfer
    
    -   Pilih rekening asal dan tujuan. Isi jumlah dan tanggal. Aplikasi otomatis membuat dua pergerakan saldo.
        
4.  Peninjauan
    
    -   Buka dashboard. Lihat saldo, arus kas, top kategori, tren bulanan.
        
5.  Pencarian dan ekspor
    
    -   Gunakan filter tanggal, akun, kategori, tag. Unduh CSV saat perlu.
        

## 7. Dashboard Keuangan

Elemen wajib:

-   Kartu saldo per rekening dan total bersih.
    
-   Ringkasan bulanan
    
    -   Total pemasukan, total pengeluaran, selisih.
        
-   Tren garis 30/90 hari.
    
-   Distribusi pengeluaran per kategori (chart).
    
-   Transaksi terbaru.
    
-   Filter global tanggal, akun, kategori.
    

Prinsip performa:

-   Query teragregasi per rentang tanggal.
    
-   Cache dan revalidasi periodik untuk grafik.
    
-   Memoisasi komponen visual.
    

## 8. Manajemen Rekening

-   Tambah, ubah, arsipkan rekening.
    
-   Field: nama, tipe, mata uang, saldo awal, keterangan.
    
-   Aturan:
    
    -   Tidak boleh hapus rekening yang memiliki transaksi. Gunakan arsip.
        
    -   Konversi mata uang opsional. Jika aktif, tampilkan kurs referensi dan nilai terkonversi.
        

## 9. Pencatatan Transaksi

Pemasukan dan Pengeluaran

-   Field wajib: akun, jumlah, tanggal, kategori.
    
-   Field opsional: catatan, tag, lampiran.
    
-   Validasi:
    
    -   Jumlah positif.
        
    -   Tanggal tidak melebihi hari ini kecuali diizinkan backdate/future date.
        
-   UX cepat:
    
    -   Shortcut keyboard tambah transaksi.
        
    -   Default ke akun terakhir dipakai.
        
    -   Saran kategori berdasarkan riwayat.
        

Transfer

-   Field wajib: akun asal, akun tujuan, jumlah, tanggal.
    
-   Validasi:
    
    -   Akun asal dan tujuan berbeda.
        
    -   Mata uang
        
        -   Jika beda, sediakan kurs dan nominal terkonversi.
            
-   Dampak saldo:
    
    -   Kurangi saldo akun asal, tambahkan saldo akun tujuan.
        

## 10. Kategori dan Tag

-   Kategori punya tipe: income atau expense. Menghindari mismatch pada ringkasan.
    
-   Tag fleksibel untuk analisis lintas kategori. Bisa multi tag.
    

## 11. Pencarian dan Filter

-   Rentang tanggal cepat: hari ini, minggu ini, bulan ini, kustom.
    
-   Filter akun, kategori, tag, tipe transaksi.
    
-   Pencarian full-text pada catatan.
    
-   Simpan filter favorit.
    

## 12. Ekspor dan Impor

-   Ekspor CSV untuk transaksi dan saldo akhir per periode.
    
-   Impor CSV opsional
    
    -   Pemetaan kolom dan validasi sebelum commit.
        
    -   Preview hasil sebelum menyimpan.
        

## 13. Praktik Terbaik UI

Gaya visual

-   Simple, modern, clean, dan konsisten.
    
-   Gunakan 1–2 keluarga font. Ukuran tipeografis yang jelas.
    
-   Warna netral dengan aksen terbatas untuk status dan CTA.
    
-   Spasi lapang. Hindari kerumitan visual.
    
-   Gunakan kartu untuk ringkasan. Tabel untuk daftar.
    
-   Gunakan icon secukupnya dengan label teks.
    

Hierarki informasi

-   Dashboard menyajikan 4 pertanyaan utama:
    
    -   Berapa saldo saat ini.
        
    -   Berapa pemasukan vs pengeluaran periode ini.
        
    -   Ke mana pengeluaran terbesar.
        
    -   Tren naik atau turun.
        
-   Detail grafik selalu memiliki angka ringkas dan tooltip.
    

Komponen prioritas

-   Global date picker yang mudah.
    
-   Quick add floating button.
    
-   Kartu saldo per rekening dapat diurut dan disembunyikan.
    
-   Tabel transaksi dengan kolom kunci
    
    -   Tanggal, akun, kategori, keterangan, jumlah, aksi.
        
-   Empty state informatif dan CTA jelas.
    

Responsif

-   Mobile
    
    -   Navigasi bawah 3–5 item maksimal.
        
    -   Quick add selalu terlihat.
        
    -   Kartu “saldo” horizontal scroll.
        
-   Tablet
    
    -   Dua kolom ringkasan.
        
-   Desktop
    
    -   Sidebar kiri untuk navigasi. Konten dua kolom pada dashboard.
        

Aksesibilitas

-   Kontras warna mencukupi.
    
-   Fokus ring terlihat.
    
-   Label form jelas. Error message spesifik.
    
-   Navigasi keyboard dan pembaca layar didukung.
    

Micro-interactions

-   Feedback sukses dan error yang singkat.
    
-   Skeleton loading pada grafik dan tabel.
    
-   Optimistic UI saat menambah transaksi, lalu konfirmasi server.
    

## 14. Praktik Terbaik UX

-   Satu tindakan utama per layar.
    
-   Kurangi field wajib. Auto-suggest kategori dan akun.
    
-   Ingat pilihan terakhir pengguna.
    
-   Undo untuk hapus dalam beberapa detik.
    
-   Konfirmasi hanya untuk tindakan berdampak besar.
    
-   Mode “Pencatatan Cepat” yang bisa dipanggil dari mana saja.
    
-   Jelaskan logika transfer dan kurs bila multi mata uang aktif.
    

## 15. Navigasi Informasi

Struktur menu yang disarankan

-   Dashboard
    
-   Transaksi
    
    -   Semua
        
    -   Pemasukan
        
    -   Pengeluaran
        
    -   Transfer
        
-   Rekening
    
-   Kategori dan Tag
    
-   Laporan
    
-   Pengaturan
    

Breadcrumb pada halaman dalam. Global search untuk transaksi.

## 16. Keamanan dan Kepatuhan

-   Penguncian sesi dan rotasi token.
    
-   Validasi input ketat. Sanitasi catatan dan tag.
    
-   Pembatasan ukuran lampiran.
    
-   Enkripsi at-rest dan in-transit.
    
-   Audit log untuk create, update, delete.
    
-   Backup dan rencana pemulihan.
    

## 17. Kinerja

-   Query ter-indeks pada tanggal, akun, kategori.
    
-   Paginasi dan infinite scroll pada transaksi.
    
-   ISR atau revalidate untuk grafik dan ringkasan.
    
-   Debounce pada pencarian dan filter.
    
-   Batasi jumlah chart di layar awal pada perangkat mobile.
    

## 18. Pengujian dan Kualitas

-   Unit test untuk perhitungan saldo dan agregasi.
    
-   Integration test untuk alur tambah transaksi dan transfer.
    
-   E2E test skenario utama pengguna.
    
-   UAT checklist sebelum rilis.
    
-   Monitoring error sisi klien dan server.
    

## 19. Analitik Produk

-   Event penting
    
    -   Tambah transaksi, transfer, ekspor, impor, filter dipakai.
        
-   Funnel
    
    -   Onboarding hingga catat transaksi pertama.
        
-   Retensi
    
    -   Frekuensi pencatatan mingguan dan bulanan.
        

## 20. Internasionalisasi dan Formatting

-   Dukungan format angka dan tanggal berdasarkan locale.
    
-   Mata uang
    
    -   Simpan amount dalam minor unit. Tampilkan sesuai locale.
        
-   Timezone
    
    -   Simpan UTC. Render sesuai timezone pengguna.
        

## 21. Rencana Rilis Bertahap

-   v1.0
    
    -   Auth, rekening, pemasukan, pengeluaran, transfer, dashboard dasar, ekspor CSV.
        
-   v1.1
    
    -   Tag, impor CSV, filter lanjutan, grafik tren 90 hari.
        
-   v1.2
    
    -   Multi mata uang, kurs manual, laporan bulanan PDF.
        
-   v1.3
    
    -   Berbagi akses per peran dan audit log lengkap.
        

## 22. Kriteria Penerimaan Utama

-   Dapat menambah, mengubah, menghapus transaksi dengan validasi lengkap.
    
-   Transfer mengurangi saldo akun asal dan menambah saldo akun tujuan secara konsisten.
    
-   Dashboard menampilkan saldo akun, total pemasukan, total pengeluaran, selisih, dan tren.
    
-   Filter tanggal bekerja di seluruh daftar dan ringkasan.
    
-   Ekspor CSV sesuai filter yang aktif.
    
-   Semua layar responsif dan dapat diakses.
    

## 23. Risiko dan Mitigasi

-   Inkonsistensi saldo
    
    -   Gunakan transaksi DB atomik dan recalculation rutin terjadwal.
        
-   Performa grafik pada data besar
    
    -   Agregasi harian/bulanan dan cache.
        
-   Kesalahan impor
    
    -   Preview, validasi, dan rollback.
        
-   Kebingungan multi mata uang
    
    -   Penjelasan kurs dan indikator konversi yang jelas.
        

## 24. Dokumentasi Pengguna Singkat

-   Tambah rekening dahulu.
    
-   Catat pemasukan dan pengeluaran lewat tombol tambah.
    
-   Gunakan transfer untuk perpindahan dana antar rekening.
    
-   Lihat ringkasan di dashboard. Atur tanggal di filter global.
    
-   Gunakan kategori dan tag untuk analisis.
    
-   Ekspor CSV untuk akuntan atau arsip.
    

## 25. Glosarium

-   Rekening: wadah saldo seperti bank, e-wallet, kas.
    
-   Pemasukan: transaksi yang menambah saldo.
    
-   Pengeluaran: transaksi yang mengurangi saldo.
    
-   Transfer: perpindahan saldo antar rekening.
    
-   Kategori: pengelompokkan transaksi.
    
-   Tag: label fleksibel untuk analisis tambahan.
