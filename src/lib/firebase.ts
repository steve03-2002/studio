'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Calculation } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, onAuthStateChanged };
export type { User };

// Authentication functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const-signOut = () => signOut(auth);

// Firestore functions
const CALCULATIONS_COLLECTION = 'calculations';

export const addCalculationToFirestore = (userId: string, calculationData: Omit<Calculation, 'id' | 'userId' | 'timestamp'>) => {
  return addDoc(collection(db, CALCULATIONS_COLLECTION), {
    ...calculationData,
    userId,
    timestamp: serverTimestamp(),
  });
};

export const getCalculationHistoryFromFirestore = async (userId: string): Promise<Calculation[]> => {
  const q = query(
    collection(db, CALCULATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: (data.timestamp as Timestamp).toDate(),
    } as Calculation;
  });
};
