// Firebase Admin SDK Configuration
// This file initializes Firebase Admin for server-side operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

// Only initialize Firebase Admin if we have the necessary environment variables
// This prevents initialization errors during build time when env vars might not be available
const hasRequiredEnvVars = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return true;
  }
  return !!(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );
};

if (!getApps().length && hasRequiredEnvVars()) {
  try {
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

    // Initialize Firestore with settings
    adminDb = getFirestore(app);
    adminDb.settings({ ignoreUndefinedProperties: true });

    adminAuth = getAuth(app);
  } catch (error) {
    console.warn('Firebase Admin initialization skipped:', error instanceof Error ? error.message : 'Unknown error');
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
}

export { adminAuth, adminDb };
export default app;
