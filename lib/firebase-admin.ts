// Firebase Admin SDK Configuration
// This file initializes Firebase Admin for server-side operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;

if (!getApps().length) {
  // Initialize Firebase Admin with service account
  // You can either use service account JSON or individual environment variables

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Option 1: Using service account JSON (recommended for production)
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Option 2: Using individual environment variables (for development)
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
} else {
  app = getApps()[0];
}

// Initialize Firestore with settings
const adminDb: Firestore = getFirestore(app);
adminDb.settings({ ignoreUndefinedProperties: true });

export const adminAuth: Auth = getAuth(app);
export { adminDb };

export default app;
