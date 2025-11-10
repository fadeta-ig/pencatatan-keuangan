/**
 * Simple Firebase Configuration Test
 * This tests if environment variables are loaded correctly
 *
 * Usage: npx tsx lib/test-firebase-simple.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔥 Firebase Configuration Test\n');
console.log('Environment Variables:');
console.log('='.repeat(50));

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask the API key for security
    const displayValue = varName.includes('API_KEY')
      ? value.substring(0, 10) + '...'
      : value;
    console.log(`✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('='.repeat(50));

if (allPresent) {
  console.log('\n✅ All required environment variables are set!');
  console.log('\nFirebase Configuration Object:');
  console.log({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
} else {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Please check your .env.local file');
  process.exit(1);
}
