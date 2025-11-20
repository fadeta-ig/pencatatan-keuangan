/**
 * Authentication module
 * Re-export client-safe auth-related functions and components
 *
 * Note: Server-side API auth utilities (verifyAuth, errorResponse, successResponse)
 * should be imported directly from '@/lib/auth/api-auth' to avoid bundling
 * Firebase Admin SDK in client code.
 */

export * from './auth-service';
export * from './auth-context';
export { useAuth } from './auth-context';
