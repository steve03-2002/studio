'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { History, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Calculation } from '@/types';
import { summarizeHistoryAction } from '@/app/actions';

interface CalculationHistoryProps {
  calculations: Calculation[];
  loading: boolean;
}

export default function CalculationHistory({ calculations, loading }: CalculationHistoryProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);

    const result = await summarizeHistoryAction(calculations);
    if (result.data) {
      setSummary(result.data);
    } else {
      setSummaryError(result.error || 'An unknown error occurred.');
    }
    setIsSummarizing(false);
  };
  
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSummary(null);
      setSummaryError(null);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History />
          Recent Calculations
        </CardTitle>
        <CardDescription>Your last 5 calculations are saved here.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : calculations.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead>GST(%)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map(calc => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium hidden md:table-cell">₹{calc.amount.toFixed(2)}</TableCell>
                    <TableCell>{calc.gstRate}%</TableCell>
                    <TableCell className="font-medium">₹{calc.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-muted-foreground text-xs">
                      {format(calc.timestamp, 'dd MMM, hh:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No calculation history found.
          </div>
        )}
        {calculations.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4" onClick={handleSummarize}>
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Analyze with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Spending Analysis</DialogTitle>
                <DialogDescription>
                  Here is an AI-generated summary of your recent spending habits based on your calculations.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isSummarizing && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing your data...</span>
                  </div>
                )}
                {summary && (
                  <div className="prose prose-sm dark:prose-invert text-foreground whitespace-pre-wrap">{summary}</div>
                )}
                {summaryError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{summaryError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
