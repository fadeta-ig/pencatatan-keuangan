# Deploy Firestore Security Rules & Indexes

Panduan lengkap untuk deploy Security Rules dan Indexes ke Firebase Firestore.

---

## 📋 Ringkasan

Anda sudah punya 2 file penting:
- ✅ `firestore.rules` - Security rules untuk proteksi data
- ✅ `firestore.indexes.json` - Composite indexes untuk optimasi query

Sekarang perlu deploy ke Firebase!

---

## 🔐 Deploy Security Rules

Security rules melindungi data Anda agar hanya user yang berhak yang bisa akses.

### Method 1: Manual via Firebase Console (Tercepat)

#### Langkah 1: Buka Firestore Rules

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **pencatatankeuangan-d108b**
3. Klik **Firestore Database** di sidebar kiri
4. Klik tab **Rules** di bagian atas

#### Langkah 2: Copy Rules

1. Buka file `firestore.rules` di project Anda
2. Copy seluruh isinya
3. Paste ke editor di Firebase Console (replace semua yang ada)

#### Langkah 3: Publish

1. Klik tombol **Publish** di kanan atas
2. Tunggu beberapa detik
3. ✅ Rules sudah aktif!

**Preview rules yang akan di-deploy:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isCreatingOwnDocument() {
      return isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update, delete: if isOwner(userId);
    }

    // Accounts, Categories, Transactions, Transfers, Tags
    match /accounts/{accountId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwnDocument();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /categories/{categoryId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwnDocument();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwnDocument();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /transfers/{transferId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwnDocument();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /tags/{tagId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwnDocument();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Audit Logs (read-only for users)
    match /auditLogs/{logId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only server (Admin SDK) can write
    }
  }
}
```

---

### Method 2: Deploy via Firebase CLI (Advanced)

#### Langkah 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Langkah 2: Login

```bash
firebase login
```

Browser akan terbuka, login dengan Google account Anda.

#### Langkah 3: Initialize Firebase

```bash
firebase init
```

Pilih:
- ✅ Firestore: Configure security rules and indexes
- Select existing project: **pencatatankeuangan-d108b**
- Use existing `firestore.rules`
- Use existing `firestore.indexes.json`

#### Langkah 4: Deploy Rules

```bash
firebase deploy --only firestore:rules
```

✅ Done!

---

## 📊 Deploy Firestore Indexes

Indexes diperlukan untuk query yang kompleks. Tanpa indexes, beberapa query akan error.

### Method 1: Manual via Firebase Console

#### Langkah 1: Buka Indexes

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **pencatatankeuangan-d108b**
3. Klik **Firestore Database** di sidebar kiri
4. Klik tab **Indexes** di bagian atas

#### Langkah 2: Create Indexes Satu Per Satu

Klik **Create Index** untuk setiap index berikut:

##### Index 1: Accounts by User & Active Status
- Collection ID: `accounts`
- Fields:
  - `userId` - Ascending
  - `isActive` - Ascending
- Query scope: Collection
- Status: Akan build otomatis (tunggu ~1 menit)

##### Index 2: Categories by User, Type & Active
- Collection ID: `categories`
- Fields:
  - `userId` - Ascending
  - `type` - Ascending
  - `isActive` - Ascending

##### Index 3: Categories by User & Name
- Collection ID: `categories`
- Fields:
  - `userId` - Ascending
  - `name` - Ascending

##### Index 4: Transactions by User & Date
- Collection ID: `transactions`
- Fields:
  - `userId` - Ascending
  - `date` - **Descending**

##### Index 5: Transactions by User, Account & Date
- Collection ID: `transactions`
- Fields:
  - `userId` - Ascending
  - `accountId` - Ascending
  - `date` - **Descending**

##### Index 6: Transactions by User, Category & Date
- Collection ID: `transactions`
- Fields:
  - `userId` - Ascending
  - `categoryId` - Ascending
  - `date` - **Descending**

##### Index 7: Transactions by User, Type & Date
- Collection ID: `transactions`
- Fields:
  - `userId` - Ascending
  - `type` - Ascending
  - `date` - **Descending**

##### Index 8: Transfers by User & Date
- Collection ID: `transfers`
- Fields:
  - `userId` - Ascending
  - `date` - **Descending**

##### Index 9: Transfers by User, From Account & Date
- Collection ID: `transfers`
- Fields:
  - `userId` - Ascending
  - `fromAccountId` - Ascending
  - `date` - **Descending**

##### Index 10: Transfers by User, To Account & Date
- Collection ID: `transfers`
- Fields:
  - `userId` - Ascending
  - `toAccountId` - Ascending
  - `date` - **Descending**

##### Index 11: Audit Logs by User & Timestamp
- Collection ID: `auditLogs`
- Fields:
  - `userId` - Ascending
  - `timestamp` - **Descending**

##### Index 12: Audit Logs by Entity, ID & Timestamp
- Collection ID: `auditLogs`
- Fields:
  - `entity` - Ascending
  - `entityId` - Ascending
  - `timestamp` - **Descending**

**Total: 12 Composite Indexes**

⏳ Tunggu beberapa menit sampai semua indexes selesai building.

---

### Method 2: Deploy via Firebase CLI (Recommended - Otomatis!)

Lebih cepat dan mudah:

```bash
firebase deploy --only firestore:indexes
```

CLI akan membaca file `firestore.indexes.json` dan membuat semua 12 indexes sekaligus!

---

## 🎯 Deploy Semuanya Sekaligus

```bash
firebase deploy --only firestore
```

Ini akan deploy:
- ✅ Security Rules
- ✅ Indexes

---

## ✅ Verify Deployment

### Check Security Rules

1. Buka Firebase Console > Firestore > Rules
2. Pastikan ada rules yang melindungi collections
3. Cek last publish time

### Check Indexes

1. Buka Firebase Console > Firestore > Indexes
2. Pastikan semua 12 indexes ada
3. Status harus **"Enabled"** (hijau)
4. Jika masih **"Building"** (kuning), tunggu beberapa menit

---

## 🧪 Test Security Rules

Buat test user dan coba akses data:

```javascript
// Test di browser console atau React component
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Seharusnya error jika belum login
const snapshot = await getDocs(collection(db, 'transactions'));
// Error: Missing or insufficient permissions

// Setelah login, akan berhasil
// (hanya akan return transactions milik user yang login)
```

---

## 🆘 Troubleshooting

### Error: "The query requires an index"

**Solusi:**
- Klik link di error message
- Firebase akan auto-create index yang diperlukan
- Tunggu build selesai (~1-2 menit)

### Error: "Missing or insufficient permissions"

**Solusi:**
1. Pastikan security rules sudah di-publish
2. Pastikan user sudah authenticated
3. Pastikan document punya field `userId` yang match dengan user login

### Index Stuck in "Building"

**Solusi:**
- Normal untuk index pertama kali (bisa 5-10 menit)
- Jika lebih dari 30 menit, hapus dan create ulang
- Check Firebase Console untuk error messages

### Error: "Firebase CLI not found"

**Solusi:**
```bash
npm install -g firebase-tools
```

---

## 📝 Checklist Deployment

- [ ] Enable Firestore di Firebase Console
- [ ] Deploy security rules (manual atau CLI)
- [ ] Deploy indexes (manual atau CLI)
- [ ] Verify rules published
- [ ] Verify all 12 indexes enabled
- [ ] Test connection dengan `npm run dev`
- [ ] Test authentication & data access

---

## 🚀 Next Steps

Setelah security rules & indexes deployed:

1. ✅ Setup Firebase Admin SDK (lihat `FIREBASE_ADMIN_SETUP.md`)
2. ✅ Enable Authentication di Firebase Console
3. ✅ Run development server: `npm run dev`
4. ✅ Mulai develop aplikasi!

---

## 📚 Resources

- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Best Practices](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)

---

**Happy developing! 🎉**
