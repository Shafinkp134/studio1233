'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  memo,
} from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

interface FirebaseProviderProps {
  children: ReactNode;
  value: FirebaseContextValue;
}

export const FirebaseProvider = memo(function FirebaseProvider({
  children,
  value,
}: FirebaseProviderProps) {
  const memoizedValue = useMemo(() => value, [value]);

  return (
    <FirebaseContext.Provider value={memoizedValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
});

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}
