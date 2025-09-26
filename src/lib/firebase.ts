'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Calculation } from '@/types';

const firebaseConfig = {
  "projectId": "studio-7820799130-4a199",
  "appId": "1:525995542255:web:da83178b99ab81ca8afd1a",
  "apiKey": "AIzaSyBmy0iPgZsuwpGST8FeaGDLDvjUoE1-HMw",
  "authDomain": "studio-7820799130-4a199.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "525995542255"
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
export const signOutUser = () => signOut(auth);

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
