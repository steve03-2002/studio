'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Landmark, Loader2, Percent, Calculator } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CalculationResult } from '@/types';
import { calculateGstAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  gstRate: z.coerce.number().min(0, { message: 'GST Rate cannot be negative.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface GstCalculatorProps {
  userId?: string;
  onCalculationComplete: () => void;
}

export default function GstCalculator({ userId, onCalculationComplete }: GstCalculatorProps) {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      gstRate: 5,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsCalculating(true);
    setResult(null);

    const response = await calculateGstAction({ ...values, userId });

    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Calculation Error',
        description: response.error,
      });
    } else if (response.data) {
      setResult(response.data);
      if (userId) {
        onCalculationComplete();
      }
    }
    form.reset(values);
    setIsCalculating(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator />
          GST Calculator
        </CardTitle>
        <CardDescription>Enter amount and GST rate to calculate.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Amount</FormLabel>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000" {...field} className="pl-9" step="0.01" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Rate</FormLabel>
                   <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} className="pl-9" step="0.1" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isCalculating} className="w-full">
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate'
              )}
            </Button>
            {result && (
              <Alert variant="default" className="bg-accent/30 animate-in fade-in-50" aria-live="polite">
                <AlertTitle className="font-semibold text-accent-foreground">Calculation Result</AlertTitle>
                <AlertDescription className="text-accent-foreground">
                  <div className="flex justify-between mt-2">
                    <span>GST Amount:</span>
                    <span className="font-mono font-medium">₹{result.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1 font-bold">
                    <span>Total Amount:</span>
                    <span className="font-mono">₹{result.totalAmount.toFixed(2)}</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
