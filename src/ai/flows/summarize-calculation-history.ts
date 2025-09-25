// Summarize the calculation history and provide insights into GST trends and spending habits.
'use server';

/**
 * @fileOverview Summarizes the user's calculation history to provide insights into GST trends and spending habits.
 *
 * - summarizeCalculationHistory - A function that summarizes the calculation history.
 * - SummarizeCalculationHistoryInput - The input type for the summarizeCalculationHistory function.
 * - SummarizeCalculationHistoryOutput - The return type for the summarizeCalculationHistory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeCalculationHistoryInputSchema = z.object({
  calculationHistory: z.array(
    z.object({
      amount: z.number(),
      gstRate: z.number(),
      gstAmount: z.number(),
      totalAmount: z.number(),
      timestamp: z.string(),
    })
  ).describe('An array of calculation history objects.'),
});
export type SummarizeCalculationHistoryInput = z.infer<typeof SummarizeCalculationHistoryInputSchema>;

const SummarizeCalculationHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the calculation history, including GST trends and spending habits.'),
});
export type SummarizeCalculationHistoryOutput = z.infer<typeof SummarizeCalculationHistoryOutputSchema>;

export async function summarizeCalculationHistory(input: SummarizeCalculationHistoryInput): Promise<SummarizeCalculationHistoryOutput> {
  return summarizeCalculationHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCalculationHistoryPrompt',
  input: {
    schema: SummarizeCalculationHistoryInputSchema,
  },
  output: {
    schema: SummarizeCalculationHistoryOutputSchema,
  },
  prompt: `You are an expert financial analyst.

You will receive a calculation history containing the original amount, GST rate, GST amount, total amount, and timestamp for each calculation.

Your task is to analyze this history and provide a summary of the user's GST trends and spending habits.

Calculation History:
{{#each calculationHistory}}
- Amount: {{amount}}, GST Rate: {{gstRate}}, GST Amount: {{gstAmount}}, Total Amount: {{totalAmount}}, Timestamp: {{timestamp}}
{{/each}}

Summary:`,
});

const summarizeCalculationHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeCalculationHistoryFlow',
    inputSchema: SummarizeCalculationHistoryInputSchema,
    outputSchema: SummarizeCalculationHistoryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
