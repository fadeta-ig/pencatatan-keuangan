# Firebase Admin SDK Setup - Langkah Demi Langkah

## 📋 Ringkasan

Anda sudah setup Firebase Client SDK ✅
Sekarang perlu setup **Firebase Admin SDK** untuk operasi server-side.

---

## 🔑 Cara Mendapatkan Service Account Key

### Langkah 1: Buka Firebase Console

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **pencatatankeuangan-d108b**

### Langkah 2: Buka Service Accounts

1. Klik **⚙️ Settings** (ikon gear) di kiri atas
2. Pilih **Project settings**
3. Klik tab **Service accounts**

### Langkah 3: Generate Private Key

1. Scroll ke bawah sampai menemukan section **"Firebase Admin SDK"**
2. Pastikan **Node.js** selected
3. Klik tombol **"Generate new private key"**
4. Klik **"Generate key"** pada dialog konfirmasi
5. File JSON akan otomatis terdownload

### Langkah 4: Buka File JSON

File yang terdownload bernama seperti:
```
pencatatankeuangan-d108b-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
```

Isinya seperti ini:
```json
{
  "type": "service_account",
  "project_id": "pencatatankeuangan-d108b",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@pencatatankeuangan-d108b.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40pencatatankeuangan-d108b.iam.gserviceaccount.com"
}
```

---

## ✏️ Update File .env

Buka file `.env` di project Anda dan update bagian Firebase Admin SDK:

### Option 1: Menggunakan Full JSON (Recommended untuk Production)

Copy seluruh isi file JSON, minify (hapus spasi & newline), lalu paste ke variable:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"pencatatankeuangan-d108b","private_key_id":"xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@pencatatankeuangan-d108b.iam.gserviceaccount.com",...}
```

**ATAU**

### Option 2: Menggunakan Field Individual (Recommended untuk Development)

Copy 3 field penting dari JSON file:

```env
FIREBASE_ADMIN_PROJECT_ID=pencatatankeuangan-d108b
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pencatatankeuangan-d108b.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**⚠️ PENTING:**
- Jangan hapus `\n` di dalam private key
- Private key harus dibungkus dengan double quotes `"..."`
- Pastikan ada `\n` di awal, tengah, dan akhir private key

---

## 📝 Contoh Lengkap File .env

Setelah selesai, file `.env` Anda akan terlihat seperti ini:

```env
# Firebase Client Configuration (sudah ada)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAWivLiC8nzgXJy_2BurMhdtNAm_aS3Skg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pencatatankeuangan-d108b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pencatatankeuangan-d108b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pencatatankeuangan-d108b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=188020555567
NEXT_PUBLIC_FIREBASE_APP_ID=1:188020555567:web:ed383c075d50d698c0ebda
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-3YXD3BRPVL

# Firebase Admin SDK Configuration (pilih salah satu option)
# Option 2: Individual Fields (Development - RECOMMENDED)
FIREBASE_ADMIN_PROJECT_ID=pencatatankeuangan-d108b
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pencatatankeuangan-d108b.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...(isi lengkap private key)...\n-----END PRIVATE KEY-----\n"

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Pencatatan Keuangan
```

---

## 🔒 Keamanan PENTING!

### ❌ JANGAN PERNAH:
- ❌ Commit file `.env` ke Git
- ❌ Commit file JSON service account ke Git
- ❌ Share private key di chat/email
- ❌ Upload ke GitHub/public repository
- ❌ Screenshot dan share online

### ✅ LAKUKAN:
- ✅ Simpan file JSON service account di tempat aman (password manager)
- ✅ Pastikan `.env` ada di `.gitignore`
- ✅ Untuk production, gunakan environment variables di hosting platform (Vercel, dll)
- ✅ Rotate (regenerate) key jika ter-expose

---

## 🧪 Test Connection

Setelah setup, test dengan:

```bash
npm run dev
```

Jika berhasil, aplikasi akan berjalan tanpa error di http://localhost:3000

---

## 🚀 Deploy ke Production

### Vercel

1. Push code ke GitHub (pastikan `.env` tidak ter-commit!)
2. Import project di [Vercel](https://vercel.com)
3. Go to **Project Settings > Environment Variables**
4. Add semua environment variables dari `.env` (kecuali NODE_ENV)
5. Deploy!

### Netlify / Other Platforms

Sama seperti Vercel, add environment variables di settings platform masing-masing.

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"

**Solusi:**
1. Pastikan Firestore sudah dienable di Firebase Console
2. Deploy security rules (lihat `firestore.rules`)
3. Pastikan user sudah authenticated

### Error: "Invalid service account"

**Solusi:**
1. Re-download service account JSON dari Firebase Console
2. Pastikan format private key benar (dengan `\n`)
3. Cek tidak ada typo di `.env`

### Error: "Cannot read property of undefined"

**Solusi:**
1. Pastikan semua environment variables sudah diisi
2. Restart development server: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`

---

## ✅ Checklist Setup

- [ ] Download service account JSON dari Firebase Console
- [ ] Update `.env` dengan credentials
- [ ] Pastikan `.env` ada di `.gitignore`
- [ ] Test dengan `npm run dev`
- [ ] Enable Firestore di Firebase Console
- [ ] Deploy security rules (langkah berikutnya)
- [ ] Deploy indexes (langkah berikutnya)

---

**Setelah selesai setup Admin SDK, lanjut ke deployment Security Rules dan Indexes!**
