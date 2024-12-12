export interface Transaction {
    id: number;
    amount: number;
    time: string;
    location: string;
    device: string;
    isFraud: boolean;
    anomalyScore: number;
  }