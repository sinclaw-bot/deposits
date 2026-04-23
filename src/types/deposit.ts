export type PaymentPeriod = 'monthly' | 'quarterly' | 'yearly' | 'end';
export type DepositStatus = 'active' | 'closed';

export interface Deposit {
  id: string;
  name: string;
  amount: number;
  interestRate: number; // годовая, %
  openDate: string; // ISO date string
  endDate?: string; // ISO date string, опционально
  paymentPeriod: PaymentPeriod;
  bank?: string;
  status: DepositStatus;
  color: string; // hex color for label
  capitalization: boolean; // сложный процент
}

export interface DepositsData {
  deposits: Deposit[];
}
