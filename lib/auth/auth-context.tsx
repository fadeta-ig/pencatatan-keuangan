'use client';

// Authentication Context
// Provides authentication state and methods throughout the app

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseConfigError } from '@/lib/firebase';
import { login as authLogin, logout as authLogout, register as authRegister, RegisterData, LoginData } from './auth-service';
import { getUserByEmail } from '@/lib/services/user.service';
import { FirestoreUser } from '@/types/firestore';

export interface AuthContextType {
  user: User | null;
  userData: (FirestoreUser & { id: string }) | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<(FirestoreUser & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const firestoreUser = await getUserByEmail(firebaseUser.email!);
          setUserData(firestoreUser);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (data: LoginData) => {
    // Check Firebase configuration before attempting login
    if (firebaseConfigError.hasError) {
      const errorMessage = `${firebaseConfigError.message}\n\n${firebaseConfigError.helpText}`;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      setLoading(true);
      await authLogin(data);
      // User state will be updated by onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.message || 'Failed to login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    // Check Firebase configuration before attempting registration
    if (firebaseConfigError.hasError) {
      const errorMessage = `${firebaseConfigError.message}\n\n${firebaseConfigError.helpText}`;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      setLoading(true);
      await authRegister(data);
      // User state will be updated by onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : err.message || 'Failed to register';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authLogout();
      setUser(null);
      setUserData(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to logout';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
