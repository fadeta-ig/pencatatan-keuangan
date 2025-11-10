# 🚀 Quick Start Guide - Pencatatan Keuangan

Panduan cepat untuk memulai development aplikasi Pencatatan Keuangan dengan Firebase.

---

## ✅ Prerequisites Checklist

Pastikan Anda sudah:
- [x] Punya Firebase project: **pencatatankeuangan-d108b**
- [x] Credentials Firebase sudah didapat
- [x] Node.js 18+ installed
- [x] Git installed

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

**Installed packages:**
- firebase (client SDK)
- firebase-admin (server SDK)
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Dan lainnya...

---

## 🔑 Step 2: Setup Environment Variables

File `.env` sudah dibuat dengan konfigurasi client Anda!

### ⚠️ Yang Masih Perlu Dilengkapi:

**Firebase Admin SDK Credentials** - Ikuti panduan di `FIREBASE_ADMIN_SETUP.md`

Singkatnya:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Project Settings > Service Accounts
3. Generate New Private Key
4. Download JSON file
5. Copy credentials ke `.env`:

```env
FIREBASE_ADMIN_PROJECT_ID=pencatatankeuangan-d108b
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pencatatankeuangan-d108b.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🔐 Step 3: Enable Firestore

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **pencatatankeuangan-d108b**
3. Klik **Firestore Database** di sidebar
4. Klik **Create Database**
5. Pilih mode: **Start in production mode**
6. Location: **asia-southeast2 (Jakarta)** (recommended untuk Indonesia)
7. Klik **Enable**

---

## 🛡️ Step 4: Deploy Security Rules

### Option A: Manual (Tercepat)

1. Firebase Console > Firestore > **Rules**
2. Copy isi file `firestore.rules`
3. Paste ke editor
4. Klik **Publish**

### Option B: Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

---

## 📊 Step 5: Deploy Indexes

### Option A: Firebase CLI (Recommended)

```bash
firebase deploy --only firestore:indexes
```

### Option B: Manual

Firebase Console > Firestore > Indexes > Create Index

Lihat `DEPLOY_FIRESTORE.md` untuk daftar 12 indexes yang perlu dibuat.

---

## 🔓 Step 6: Enable Authentication

1. Firebase Console > **Authentication**
2. Klik **Get Started**
3. Tab **Sign-in method**
4. Enable **Email/Password**
5. Klik **Save**

---

## 🏃 Step 7: Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

---

## ✅ Verify Everything Works

### Test 1: Check Environment

```bash
# Pastikan tidak ada error saat import Firebase
node -e "require('./lib/firebase.ts')"
```

### Test 2: Check Firestore Connection

Buat file test sederhana:

```javascript
// test-firebase.js
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testConnection() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    console.log('✅ Firestore connected!');
    console.log('Documents:', snapshot.size);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
```

---

## 🗂️ Project Structure

```
pencatatan-keuangan/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/                         # Core utilities
│   ├── firebase.ts              # Firebase client config ✅
│   ├── firebase-admin.ts        # Firebase admin config ✅
│   ├── firestore-helpers.ts     # CRUD operations ✅
│   └── services/                # Service layer ✅
│       ├── user.service.ts
│       ├── account.service.ts
│       ├── transaction.service.ts
│       ├── category.service.ts
│       ├── transfer.service.ts
│       ├── tag.service.ts
│       └── audit.service.ts
├── types/                       # TypeScript types
│   └── firestore.ts             # Firestore types ✅
├── firestore.rules              # Security rules ✅
├── firestore.indexes.json       # Indexes config ✅
└── .env                         # Environment variables ✅
```

---

## 🎯 Development Workflow

### 1. Membuat User Baru

```typescript
import { createUser } from '@/lib/services/user.service';

const userId = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
  password: 'password123', // Will be hashed automatically
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  locale: 'id-ID',
});
```

### 2. Membuat Account

```typescript
import { createAccount } from '@/lib/services/account.service';
import { AccountType } from '@/types/firestore';

const accountId = await createAccount({
  userId: 'user123',
  name: 'Bank BCA',
  type: AccountType.BANK,
  currency: 'IDR',
  initialBalance: 1000000,
  isActive: true,
});
```

### 3. Membuat Transaksi

```typescript
import { createTransaction } from '@/lib/services/transaction.service';
import { TransactionType } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';

const transactionId = await createTransaction({
  userId: 'user123',
  accountId: 'acc123',
  categoryId: 'cat123',
  type: TransactionType.EXPENSE,
  amount: 50000,
  currency: 'IDR',
  date: Timestamp.now(),
  notes: 'Lunch',
  tags: ['food', 'daily'],
});

// Account balance will be automatically updated!
```

### 4. Query Transaksi

```typescript
import { getUserTransactions } from '@/lib/services/transaction.service';

const transactions = await getUserTransactions('user123', {
  type: TransactionType.EXPENSE,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 20,
});
```

---

## 📚 Dokumentasi Lengkap

- **FIREBASE_SETUP.md** - Setup Firebase lengkap (400+ lines)
- **FIREBASE_ADMIN_SETUP.md** - Setup Admin SDK
- **DEPLOY_FIRESTORE.md** - Deploy rules & indexes
- **DATABASE.md** - Database architecture
- **.env.example** - Environment variables template

---

## 🆘 Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"

**Solusi:**
- Deploy security rules (Step 4)
- Pastikan user authenticated
- Pastikan document punya field `userId`

### Issue 2: "The query requires an index"

**Solusi:**
- Klik link di error message (auto-create index)
- Atau deploy indexes manual (Step 5)

### Issue 3: "Cannot find module './lib/firebase'"

**Solusi:**
```bash
npm install
npm run dev
```

### Issue 4: Environment variables not loaded

**Solusi:**
- Pastikan file `.env` ada di root project
- Restart dev server
- Check typo di variable names

---

## 🚀 Next Steps

Setelah setup selesai:

1. ✅ Buat authentication UI (login/register)
2. ✅ Buat dashboard dengan summary balance
3. ✅ Buat CRUD untuk accounts
4. ✅ Buat CRUD untuk categories
5. ✅ Buat transaction management
6. ✅ Buat reports & analytics
7. ✅ Deploy ke Vercel/Netlify

---

## 💡 Development Tips

### 1. Use TypeScript

Semua types sudah didefinisikan di `types/firestore.ts`:

```typescript
import { FirestoreUser, FirestoreAccount } from '@/types/firestore';
```

### 2. Use Service Layer

Jangan akses Firestore langsung, gunakan service layer:

```typescript
// ❌ Bad
import { db } from '@/lib/firebase';
const snapshot = await db.collection('users').get();

// ✅ Good
import { getUserById } from '@/lib/services/user.service';
const user = await getUserById('user123');
```

### 3. Error Handling

```typescript
try {
  const transaction = await createTransaction(data);
  console.log('Transaction created:', transaction);
} catch (error) {
  console.error('Error creating transaction:', error);
  // Show error to user
}
```

### 4. Use Firebase Emulator untuk Development

```bash
firebase emulators:start
```

Lihat `FIREBASE_SETUP.md` untuk setup emulator.

---

## ✅ Setup Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Firebase Admin SDK credentials added
- [ ] Firestore enabled
- [ ] Security rules deployed
- [ ] Indexes deployed (atau akan auto-create saat error)
- [ ] Authentication enabled
- [ ] Development server running (`npm run dev`)
- [ ] Test connection berhasil

---

## 🎉 Ready to Code!

Setelah semua checklist ✅, Anda siap mulai development!

**Happy coding! 🚀**

---

## 📞 Support

Jika ada kendala:
1. Check dokumentasi di folder ini
2. Check Firebase Console untuk errors
3. Check browser console untuk client errors
4. Check terminal untuk server errors

**File Penting:**
- `FIREBASE_SETUP.md` - Setup lengkap
- `FIREBASE_ADMIN_SETUP.md` - Admin SDK
- `DEPLOY_FIRESTORE.md` - Deploy rules & indexes
- `DATABASE.md` - Database docs
