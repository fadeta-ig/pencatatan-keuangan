// User Service
// Handles all user-related Firestore operations

import { Timestamp } from 'firebase/firestore';
import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
} from '../firestore-helpers';
import { COLLECTIONS, FirestoreUser, FirestoreUserInput } from '@/types/firestore';
import * as bcrypt from 'bcryptjs';

// Create a new user
export async function createUser(data: FirestoreUserInput): Promise<string> {
  // Hash password before storing
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const userData = {
    ...data,
    password: hashedPassword,
  };

  return createDocument<FirestoreUserInput>(COLLECTIONS.USERS, userData);
}

// Get user by ID
export async function getUserById(
  userId: string
): Promise<(FirestoreUser & { id: string }) | null> {
  return getDocument<FirestoreUser>(COLLECTIONS.USERS, userId);
}

// Get user by email
export async function getUserByEmail(
  email: string
): Promise<(FirestoreUser & { id: string }) | null> {
  const users = await queryDocuments<FirestoreUser>(COLLECTIONS.USERS, {
    where: [{ field: 'email', operator: '==', value: email }],
    limit: 1,
  });

  return users.length > 0 ? users[0] : null;
}

// Update user
export async function updateUser(
  userId: string,
  data: Partial<FirestoreUserInput>
): Promise<void> {
  // If password is being updated, hash it
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return updateDocument(COLLECTIONS.USERS, userId, data);
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.USERS, userId);
}

// Verify user password
export async function verifyPassword(
  email: string,
  password: string
): Promise<FirestoreUser & { id: string } | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== null;
}
