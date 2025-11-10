# Database Setup Guide

## Overview

This project uses **Firebase Firestore** as the database - a NoSQL cloud database with real-time synchronization capabilities.

> **Note**: This project was migrated from PostgreSQL + Prisma to Firebase Firestore. For detailed setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## Why Firebase Firestore?

- **Serverless** - No database server to maintain
- **Real-time** - Built-in real-time data synchronization
- **Scalable** - Automatically scales with your application
- **Offline support** - Works offline with automatic sync
- **Global CDN** - Fast access from anywhere
- **Generous free tier** - Great for development and small apps

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Google account
- Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your Firebase credentials (get these from Firebase Console):

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef

# Firebase Admin SDK Configuration
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Database Structure

### Collections

Firestore uses collections (similar to tables) to organize data:

- **users** - User accounts and preferences
- **accounts** - Financial accounts (Bank, Cash, E-Wallet, etc)
- **categories** - Income/Expense categories
- **transactions** - Income and expense records
- **transfers** - Money transfers between accounts
- **tags** - Flexible transaction labels
- **auditLogs** - Audit trail for data changes

### Document Structure

Each collection contains documents (similar to rows). See `types/firestore.ts` for complete TypeScript definitions.

#### Example: User Document

```typescript
{
  id: "user123",
  email: "user@example.com",
  name: "John Doe",
  password: "hashed_password",
  timezone: "Asia/Jakarta",
  currency: "IDR",
  locale: "id-ID",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Example: Transaction Document

```typescript
{
  id: "txn123",
  userId: "user123",
  accountId: "acc456",
  categoryId: "cat789",
  type: "EXPENSE",
  amount: 50000,
  currency: "IDR",
  date: Timestamp,
  notes: "Lunch",
  tags: ["food", "daily"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Key Features

### 1. Multi-currency Support

Each account can have its own currency. Transfers between different currencies support exchange rates.

```typescript
{
  fromAccountId: "usd_account",
  toAccountId: "idr_account",
  amount: 100, // USD
  currency: "USD",
  exchangeRate: 15500,
  convertedAmount: 1550000 // IDR
}
```

### 2. Soft Deletes

Categories and accounts use `isActive` flag instead of hard deletes:

```typescript
{
  isActive: false // Soft deleted
}
```

### 3. Real-time Updates

Firestore supports real-time listeners for live data:

```typescript
import { onSnapshot, collection } from 'firebase/firestore';

onSnapshot(collection(db, 'transactions'), (snapshot) => {
  // Automatically updates when data changes
  snapshot.forEach((doc) => {
    console.log(doc.data());
  });
});
```

### 4. Audit Logging

All critical operations are logged in `auditLogs` collection:

```typescript
{
  userId: "user123",
  action: "UPDATE",
  entity: "transaction",
  entityId: "txn123",
  oldData: {...},
  newData: {...},
  ipAddress: "192.168.1.1",
  timestamp: Timestamp
}
```

### 5. Automatic Balance Calculation

Account balances are automatically updated when transactions or transfers are created:

```typescript
// Creating a transaction
await createTransaction({
  accountId: "acc123",
  type: "EXPENSE",
  amount: 50000,
  // ... other fields
});
// Account balance is automatically deducted
```

## Helper Functions

### Firestore Operations

Located in `lib/firestore-helpers.ts`:

```typescript
// Create document
await createDocument('transactions', transactionData);

// Get document
await getDocument('transactions', transactionId);

// Update document
await updateDocument('transactions', transactionId, { amount: 60000 });

// Delete document
await deleteDocument('transactions', transactionId);

// Query documents
await queryDocuments('transactions', {
  where: [{ field: 'userId', operator: '==', value: userId }],
  orderBy: [{ field: 'date', direction: 'desc' }],
  limit: 20
});
```

### Service Layer

Domain-specific operations in `lib/services/`:

```typescript
// User service
import { createUser, getUserByEmail } from '@/lib/services/user.service';

// Account service
import { createAccount, getTotalBalance } from '@/lib/services/account.service';

// Transaction service
import { createTransaction, getUserTransactions } from '@/lib/services/transaction.service';

// And more...
```

## Security Rules

Firestore uses declarative security rules to protect your data. Rules are defined in Firebase Console.

### Example Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Audit logs are read-only for users
    match /auditLogs/{logId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
  }
}
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete security rules.

## Indexes

Firestore automatically creates indexes for simple queries. For complex queries, composite indexes are required.

### Required Composite Indexes

Create these in Firebase Console > Firestore > Indexes:

1. **Transactions by user and date**
   - Collection: `transactions`
   - Fields: `userId` (Ascending), `date` (Descending)

2. **Transactions by account**
   - Collection: `transactions`
   - Fields: `userId` (Ascending), `accountId` (Ascending), `date` (Descending)

3. **Active accounts**
   - Collection: `accounts`
   - Fields: `userId` (Ascending), `isActive` (Ascending)

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete index list.

## Local Development with Emulators (Optional)

Firebase provides local emulators for offline development:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed emulator setup.

## Production Deployment

### Environment Variables

Set environment variables in your hosting platform:

- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Environment Variables
- **Firebase Hosting**: Use `.env.production` or Cloud Functions config

### Security Checklist

- ✅ Firestore security rules published
- ✅ Composite indexes created
- ✅ Environment variables configured
- ✅ Service account key secured (never in Git)
- ✅ CORS configured if needed
- ✅ Rate limiting implemented
- ✅ Billing alerts set up

## Backup and Export

### Export Data

Firebase provides built-in export functionality:

```bash
# Install gcloud CLI
# Export Firestore data
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)
```

### Import Data

```bash
gcloud firestore import gs://your-bucket/backups/20240101
```

### Scheduled Backups

Set up automated backups using Cloud Scheduler in Google Cloud Console.

## Performance Optimization

### 1. Use Pagination

```typescript
const transactions = await queryDocuments('transactions', {
  where: [{ field: 'userId', operator: '==', value: userId }],
  limit: 20,
  startAfter: lastDoc // For next page
});
```

### 2. Cache Frequently Accessed Data

```typescript
// Use React Query or SWR for caching
const { data } = useQuery('accounts', () => getUserAccounts(userId));
```

### 3. Limit Document Size

- Keep documents under 1MB
- Use subcollections for large datasets
- Store large files in Cloud Storage, not Firestore

### 4. Batch Operations

```typescript
import { writeBatch } from 'firebase/firestore';

const batch = writeBatch(db);
batch.set(docRef1, data1);
batch.update(docRef2, data2);
await batch.commit(); // Atomic operation
```

### 5. Use Firebase Admin SDK for Server Operations

```typescript
// In API routes, use Admin SDK for better performance
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const snapshot = await adminDb
    .collection('transactions')
    .where('userId', '==', userId)
    .get();

  return Response.json(snapshot.docs.map(d => d.data()));
}
```

## Cost Optimization

### Free Tier Limits

- **Reads**: 50,000 per day
- **Writes**: 20,000 per day
- **Deletes**: 20,000 per day
- **Storage**: 1 GB

### Tips to Stay in Free Tier

1. Use local state management (reduce reads)
2. Implement client-side caching
3. Use pagination (don't fetch all data)
4. Clean up old data periodically
5. Use Firebase emulators for development

## Troubleshooting

### "Missing or insufficient permissions"

**Solution**: Check Firestore security rules and ensure user is authenticated.

### "The query requires an index"

**Solution**: Click the link in the error - it will auto-create the index in Firebase Console.

### "Firebase: Error (auth/invalid-api-key)"

**Solution**: Verify `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env` is correct.

### Slow queries

**Solution**:
1. Create appropriate indexes
2. Limit query results
3. Use pagination
4. Cache results client-side

### High costs

**Solution**:
1. Check Firebase Console > Usage
2. Review inefficient queries
3. Implement caching
4. Use Firebase emulators for development

## Migration from PostgreSQL

This project was migrated from PostgreSQL + Prisma. Key differences:

| PostgreSQL/Prisma | Firebase Firestore |
|-------------------|-------------------|
| Relational database | NoSQL document database |
| SQL queries | JavaScript SDK |
| Migrations | No migrations needed |
| Foreign keys | Manual relationship management |
| Joins | Denormalization or multiple queries |
| ACID transactions | Limited transactions (500 writes max) |

## Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Full Setup Guide](./FIREBASE_SETUP.md)

## Support

For detailed setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

For Firebase-specific issues, visit [Firebase Support](https://firebase.google.com/support)

---

**Happy coding! 🚀**
