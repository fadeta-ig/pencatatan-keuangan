# Quick Start Guide - Pencatatan Keuangan

## Setup Firebase (Required)

Aplikasi ini memerlukan konfigurasi Firebase untuk authentication dan database. Ikuti langkah berikut:

### 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Create a project"** atau **"Add project"**
3. Masukkan nama project (contoh: `pencatatan-keuangan`)
4. Ikuti langkah-langkah hingga project dibuat

### 2. Enable Authentication

1. Di Firebase Console, pilih project Anda
2. Klik menu **"Build" > "Authentication"**
3. Klik **"Get started"**
4. Pilih tab **"Sign-in method"**
5. Enable **"Email/Password"**
6. Klik **"Save"**

### 3. Enable Firestore Database

1. Di Firebase Console, klik menu **"Build" > "Firestore Database"**
2. Klik **"Create database"**
3. Pilih **"Start in production mode"**
4. Pilih lokasi server (recommended: `asia-southeast2 (Jakarta)`)
5. Klik **"Enable"**

### 4. Dapatkan Firebase Credentials

#### A. Client Configuration (Web App)

1. Di Firebase Console, klik ikon **gear** (Project Settings)
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **Web** (`</>`)
4. Daftarkan app dengan nickname (contoh: `Web App`)
5. **COPY semua nilai dari `firebaseConfig`**

#### B. Admin SDK Configuration (Service Account)

1. Di Project Settings, klik tab **"Service Accounts"**
2. Klik **"Generate new private key"**
3. Klik **"Generate key"** - file JSON akan terdownload
4. **Buka file JSON tersebut**

### 5. Update .env.local

Buka file `.env.local` di root project dan isi dengan credentials dari langkah 4:

```env
# Dari firebaseConfig (langkah 4A):
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey dari firebaseConfig>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain dari firebaseConfig>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId dari firebaseConfig>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket dari firebaseConfig>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId dari firebaseConfig>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId dari firebaseConfig>

# Dari Service Account JSON (langkah 4B):
FIREBASE_ADMIN_PROJECT_ID=<project_id dari JSON>
FIREBASE_ADMIN_CLIENT_EMAIL=<client_email dari JSON>
FIREBASE_ADMIN_PRIVATE_KEY="<private_key dari JSON - dengan \n nya>"
```

**PENTING**:
- Pastikan `FIREBASE_ADMIN_PRIVATE_KEY` tetap memiliki `\n` di dalam string
- Jangan commit file `.env.local` ke Git!

### 6. Setup Firestore Security Rules

1. Di Firestore Database, klik tab **"Rules"**
2. Copy rules dari file `FIREBASE_SETUP.md` bagian "Firestore Security Rules"
3. Klik **"Publish"**

### 7. Install Dependencies & Run

```bash
npm install
npm run dev
```

Buka browser di `http://localhost:3000`

## Troubleshooting

### Error: "Firebase configuration is missing or invalid"

Pastikan semua environment variables di `.env.local` sudah terisi dengan benar.

### Error: "Missing or insufficient permissions"

1. Pastikan Firestore Security Rules sudah di-publish
2. Pastikan Authentication Email/Password sudah di-enable

### Error saat Register/Login

1. Buka browser console (F12) untuk melihat error detail
2. Pastikan Firebase credentials benar
3. Cek Firebase Console > Authentication untuk melihat apakah user terdaftar

## Panduan Lengkap

Untuk panduan lebih detail, lihat [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

**Selamat mencoba! 🚀**
