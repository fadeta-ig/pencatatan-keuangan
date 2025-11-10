# Firebase Setup Guide

This guide will help you set up Firebase Firestore for the Pencatatan Keuangan application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Firebase Project](#create-firebase-project)
3. [Enable Firestore](#enable-firestore)
4. [Configure Authentication](#configure-authentication)
5. [Setup Environment Variables](#setup-environment-variables)
6. [Firestore Security Rules](#firestore-security-rules)
7. [Firestore Indexes](#firestore-indexes)
8. [Local Development](#local-development)

---

## Prerequisites

- A Google account
- Node.js installed on your system
- This project cloned locally

---

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., `pencatatan-keuangan`)
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

---

## Enable Firestore

1. In Firebase Console, select your project
2. Go to **"Build" > "Firestore Database"**
3. Click **"Create database"**
4. Choose **"Start in production mode"** (we'll add security rules later)
5. Select a Firestore location (choose closest to your users)
   - Recommended for Indonesia: `asia-southeast2 (Jakarta)`
6. Click **"Enable"**

---

## Configure Authentication

1. In Firebase Console, go to **"Build" > "Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. Click **"Save"**

---

## Setup Environment Variables

### Step 1: Get Firebase Client Configuration

1. In Firebase Console, go to **"Project Settings"** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register app with a nickname (e.g., `Pencatatan Keuangan Web`)
5. Copy the `firebaseConfig` object

### Step 2: Get Firebase Admin SDK Configuration

1. In Firebase Console, go to **"Project Settings" > "Service Accounts"**
2. Click **"Generate new private key"**
3. Click **"Generate key"** - a JSON file will be downloaded
4. **IMPORTANT**: Keep this file secure and NEVER commit it to Git

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase credentials:

#### Option A: Using Full Service Account JSON (Recommended for Production)

```env
# Client Config (from Step 1)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef

# Admin Config - Option 1: Full JSON (minify the JSON first)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

#### Option B: Using Individual Fields (Recommended for Development)

```env
# Client Config (from Step 1)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef

# Admin Config - Option 2: Individual Fields
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Note**: For `FIREBASE_ADMIN_PRIVATE_KEY`, keep the `\n` characters in the private key string.

---

## Firestore Security Rules

Protect your data with proper security rules. In Firebase Console:

1. Go to **"Firestore Database" > "Rules"**
2. Replace with the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(userId);
    }

    // Accounts collection
    match /accounts/{accountId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Categories collection
    match /categories/{categoryId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Transfers collection
    match /transfers/{transferId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Tags collection
    match /tags/{tagId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Audit Logs collection (read-only for users)
    match /auditLogs/{logId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only server can write
    }
  }
}
```

3. Click **"Publish"**

---

## Firestore Indexes

For optimal query performance, create these composite indexes:

### Method 1: Via Firebase Console

1. Go to **"Firestore Database" > "Indexes"**
2. Click **"Create Index"**
3. Add the following indexes:

#### Accounts Indexes
- Collection: `accounts`
  - Fields: `userId` (Ascending), `isActive` (Ascending)

#### Categories Indexes
- Collection: `categories`
  - Fields: `userId` (Ascending), `type` (Ascending), `isActive` (Ascending)

#### Transactions Indexes
- Collection: `transactions`
  - Fields: `userId` (Ascending), `date` (Descending)
  - Fields: `userId` (Ascending), `accountId` (Ascending), `date` (Descending)
  - Fields: `userId` (Ascending), `categoryId` (Ascending), `date` (Descending)
  - Fields: `userId` (Ascending), `type` (Ascending), `date` (Descending)

#### Transfers Indexes
- Collection: `transfers`
  - Fields: `userId` (Ascending), `date` (Descending)

#### Audit Logs Indexes
- Collection: `auditLogs`
  - Fields: `userId` (Ascending), `timestamp` (Descending)
  - Fields: `entity` (Ascending), `entityId` (Ascending), `timestamp` (Descending)

### Method 2: Via `firestore.indexes.json` (Automated)

Create a `firestore.indexes.json` file in your project root and deploy using Firebase CLI.

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Test Firebase Configuration

Before running the app, verify your Firebase setup:

```bash
npx tsx lib/test-firebase-simple.ts
```

This will check if all environment variables are loaded correctly.

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Using Firestore Emulator (Optional)

For local development without consuming Firebase quotas:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Firestore** and **Emulators**
   - Choose existing project
   - Accept default files
   - Select **Firestore Emulator**

4. Update your `.env.local` for emulator:
   ```env
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
   FIRESTORE_EMULATOR_HOST=localhost:8080
   ```

5. Start emulator:
   ```bash
   firebase emulators:start
   ```

6. Update `lib/firebase.ts` to connect to emulator (add this in development):
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

---

## Firestore Data Structure

### Collections

- **users**: User accounts and preferences
- **accounts**: Financial accounts (bank, cash, e-wallet, etc.)
- **categories**: Income and expense categories
- **transactions**: All financial transactions
- **transfers**: Money transfers between accounts
- **tags**: Flexible labels for transactions
- **auditLogs**: Activity logs for compliance

### Document Structure

See `types/firestore.ts` for complete type definitions.

---

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Make sure to set all environment variables from `.env.example` in your hosting platform's environment configuration.

---

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify userId matches in queries

### Error: "The query requires an index"
- Click the link in the error message
- It will auto-create the required index in Firebase Console

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check API key restrictions in Google Cloud Console

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"
- Check if Firebase Authentication is enabled
- Verify security rules are published
- Ensure user is logged in

---

## Security Best Practices

1. ✅ Never commit `.env` file or service account JSON
2. ✅ Use environment variables for all secrets
3. ✅ Implement proper Firestore security rules
4. ✅ Validate all user inputs
5. ✅ Use Firebase Admin SDK only on server-side
6. ✅ Enable App Check for production (prevents abuse)
7. ✅ Set up Firebase Security Rules Unit Testing
8. ✅ Monitor usage in Firebase Console
9. ✅ Set up billing alerts
10. ✅ Implement rate limiting for API routes

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Firebase Integration](https://nextjs.org/docs/app/building-your-application/authentication)

---

## Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Review security rules and indexes
3. Verify environment variables
4. Check browser console for client errors
5. Review server logs for admin SDK errors

---

**Happy coding! 🚀**
