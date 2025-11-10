// Firebase Client Configuration
// This file initializes Firebase for client-side operations

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Helper function to clean environment variables
// Removes quotes and trailing commas that might be accidentally added
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return value;
  // Remove leading/trailing quotes and whitespace
  let cleaned = value.trim().replace(/^["']|["']$/g, '');
  // Remove trailing comma
  cleaned = cleaned.replace(/,\s*$/, '');
  return cleaned;
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Validate Firebase configuration
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Firebase Config Check:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
    authDomain: firebaseConfig.authDomain || 'missing',
    projectId: firebaseConfig.projectId || 'missing',
    storageBucket: firebaseConfig.storageBucket || 'missing',
    messagingSenderId: firebaseConfig.messagingSenderId || 'missing',
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'missing',
  });
}

// Warn if required config is missing
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
if (missingFields.length > 0) {
  console.error('Missing required Firebase configuration fields:', missingFields);
  console.error('Please ensure your .env.local file has all required NEXT_PUBLIC_FIREBASE_* variables');
}

// Initialize Firebase only if it hasn't been initialized yet
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
