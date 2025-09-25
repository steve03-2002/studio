export type Calculation = {
  id: string;
  userId: string;
  amount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  timestamp: Date;
};

export type CalculationResult = {
  gstAmount: number;
  totalAmount: number;
};
