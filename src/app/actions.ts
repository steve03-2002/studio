'use server';

import { z } from 'zod';
import { addCalculationToFirestore, getCalculationHistoryFromFirestore } from '@/lib/firebase';
import { summarizeCalculationHistory } from '@/ai/flows/summarize-calculation-history';
import type { Calculation } from '@/types';

const calculationSchema = z.object({
  amount: z.number().positive(),
  gstRate: z.number().min(0),
  userId: z.string().optional(),
});

export async function calculateGstAction(data: { amount: number; gstRate: number; userId?: string }) {
  const validatedData = calculationSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: 'Invalid input data.' };
  }

  const { amount, gstRate, userId } = validatedData.data;

  const gstAmount = (amount * gstRate) / 100;
  const totalAmount = amount + gstAmount;

  const result = {
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };

  if (userId) {
    try {
      await addCalculationToFirestore(userId, {
        amount,
        gstRate,
        ...result,
      });
    } catch (e) {
      console.error('Firestore write error:', e);
      // Non-fatal error, we can still return the calculation result
    }
  }

  return { data: result };
}

export async function getHistoryAction(userId: string) {
  if (!userId) {
    return { error: 'User not authenticated.' };
  }
  try {
    const history = await getCalculationHistoryFromFirestore(userId);
    return { data: history };
  } catch (e) {
    console.error('Firestore read error:', e);
    return { error: 'Failed to fetch calculation history.' };
  }
}

export async function summarizeHistoryAction(history: Calculation[]) {
  if (!history || history.length === 0) {
    return { error: 'No history available to summarize.' };
  }
  const flowInput = {
    calculationHistory: history.map(h => ({
      amount: h.amount,
      gstRate: h.gstRate,
      gstAmount: h.gstAmount,
      totalAmount: h.totalAmount,
      timestamp: h.timestamp.toISOString(),
    })),
  };

  try {
    const result = await summarizeCalculationHistory(flowInput);
    return { data: result.summary };
  } catch (e) {
    console.error('AI summary error:', e);
    return { error: 'Failed to generate AI summary.' };
  }
}
