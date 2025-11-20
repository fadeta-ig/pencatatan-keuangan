// API Authentication Helper
// Verifies Firebase ID tokens in API routes

import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
}

/**
 * Verify the Firebase ID token from request headers
 * Returns the authenticated user or throws an error
 */
export async function verifyAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth) {
      throw new Error('Firebase Admin is not initialized. Please check your environment variables.');
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new Error('Missing authentication token');
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    throw new Error('Unauthorized');
  }
}

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    { error: message },
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse(data: any, status: number = 200) {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
