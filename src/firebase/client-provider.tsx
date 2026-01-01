'use client';
import {
  FirebaseProvider,
  type FirebaseContextValue,
} from '@/firebase/provider';
import { initializeFirebase } from '.';
import { ReactNode, memo } from 'react';

const firebaseApp = initializeFirebase();

export const FirebaseClientProvider = memo(function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FirebaseProvider value={firebaseApp as FirebaseContextValue}>
      {children}
    </FirebaseProvider>
  );
});
