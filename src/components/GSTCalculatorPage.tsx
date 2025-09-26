'use client';

import { useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Calculation } from '@/types';
import { getHistoryAction } from '@/app/actions';

import Header from '@/components/Header';
import GstCalculator from '@/components/GstCalculator';
import CalculationHistory from '@/components/CalculationHistory';

export default function GSTCalculatorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toast } = useToast();

  const fetchHistory = useCallback(async (currentUserId: string) => {
    setHistoryLoading(true);
    const result = await getHistoryAction(currentUserId);
    if (result.data) {
      setCalculations(result.data);
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching history',
        description: result.error,
      });
    }
    setHistoryLoading(false);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchHistory(user.uid);
      } else {
        setCalculations([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchHistory]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Signed In',
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description: 'Could not sign in with Google. Please try again.',
      });
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: 'Signed Out',
        description: 'You have been signed out.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-out failed',
        description: 'Could not sign out. Please try again.',
      });
    }
  };

  const handleCalculationComplete = () => {
    if (user) {
      fetchHistory(user.uid);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        <Header user={user} loading={loading} onSignIn={handleSignIn} onSignOut={handleSignOut} />
        <GstCalculator userId={user?.uid} onCalculationComplete={handleCalculationComplete} />
        {user && <CalculationHistory calculations={calculations} loading={historyLoading} />}
      </div>
    </main>
  );
}
