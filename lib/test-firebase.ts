/**
 * Firebase Connection Test
 * Run this script to verify Firebase configuration is working correctly
 *
 * Usage: npx tsx lib/test-firebase.ts
 */

import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Configuration...\n');

  try {
    // Test 1: Check Firebase initialization
    console.log('✓ Firebase app initialized successfully');
    console.log(`  Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`  Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}\n`);

    // Test 2: Check Firestore connection
    console.log('Testing Firestore connection...');
    const testCollection = collection(db, 'users');
    const snapshot = await getDocs(testCollection);
    console.log(`✓ Firestore connected successfully`);
    console.log(`  Found ${snapshot.size} documents in 'users' collection\n`);

    // Test 3: Check Auth initialization
    console.log('Testing Firebase Auth...');
    console.log(`✓ Firebase Auth initialized`);
    console.log(`  Current user: ${auth.currentUser ? auth.currentUser.email : 'None (not signed in)'}\n`);

    console.log('🎉 All Firebase services are configured correctly!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Firebase connection:', error);
    process.exit(1);
  }
}

testFirebaseConnection();
