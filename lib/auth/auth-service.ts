// Authentication Service
// Handles user authentication operations

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUser, getUserByEmail, emailExists } from '@/lib/services/user.service';
import { FirestoreUserInput } from '@/types/firestore';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  timezone?: string;
  currency?: string;
  locale?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<UserCredential> {
  const { email, password, name, timezone = 'Asia/Jakarta', currency = 'IDR', locale = 'id-ID' } = data;

  // Check if email already exists in Firestore
  const exists = await emailExists(email);
  if (exists) {
    throw new Error('Email already registered');
  }

  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    // Update display name in Firebase Auth
    await updateProfile(userCredential.user, { displayName: name });

    // Create user document in Firestore
    const userData: FirestoreUserInput = {
      email,
      name,
      password, // Will be hashed by user service
      timezone,
      currency,
      locale,
    };

    await createUser(userData);

    return userCredential;
  } catch (error) {
    // If Firestore creation fails, delete the Auth user
    await userCredential.user.delete();
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function login(data: LoginData): Promise<UserCredential> {
  const { email, password } = data;

  // Sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  return userCredential;
}

/**
 * Sign out current user
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Update user password
 */
export async function changePassword(user: User, newPassword: string): Promise<void> {
  await updatePassword(user, newPassword);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}
