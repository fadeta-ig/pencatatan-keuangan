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

// Helper function to validate if a value is a valid configuration (not placeholder)
const isValidConfigValue = (value: string | undefined, fieldName: string): boolean => {
  if (!value) return false;

  // Check for placeholder values
  const placeholders = [
    'your_api_key_here',
    'your_project',
    'your_project_id',
    'your_messaging_sender_id',
    'your_app_id',
    'your_measurement_id',
  ];

  const lowerValue = value.toLowerCase();
  return !placeholders.some(placeholder => lowerValue.includes(placeholder));
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

// Validate required fields and check for placeholder values
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
const invalidFields = requiredFields.filter(field =>
  firebaseConfig[field] && !isValidConfigValue(firebaseConfig[field], field)
);

// Export configuration status for error handling
export const firebaseConfigError = missingFields.length > 0 || invalidFields.length > 0
  ? {
      hasError: true,
      missingFields,
      invalidFields,
      message: [
        'Firebase configuration is missing or invalid.',
        missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : null,
        invalidFields.length > 0 ? `Invalid/placeholder values: ${invalidFields.join(', ')}` : null,
      ].filter(Boolean).join(' '),
      helpText: [
        'To fix this:',
        '1. Copy .env.example to .env.local',
        '2. Get credentials from Firebase Console (Project Settings)',
        '3. Update .env.local with your actual Firebase credentials',
        '',
        'See FIREBASE_SETUP.md for detailed instructions.',
      ].join('\n'),
    }
  : { hasError: false };

if (firebaseConfigError.hasError) {
  console.error('🔥 Firebase Configuration Error:');
  console.error(firebaseConfigError.message);
  console.error(firebaseConfigError.helpText);
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
