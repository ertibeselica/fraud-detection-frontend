import React from 'react';
import { AlertCircle, CheckCircle, Clock, MapPin, Smartphone, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: number;
  amount: number;
  time: string;
  location: string;
  device: string;
  isFraud: boolean;
  anomalyScore: number;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  similarTransactions: Transaction[];
  isLoading: boolean;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  similarTransactions,
  isLoading
}) => {
  if (!isOpen || !transaction) return null;

  // Safe values with defaults
  const amount = transaction.amount ?? 0;
  const anomalyScore = transaction.anomalyScore ?? 0;
  const time = transaction.time ?? new Date().toISOString();
  const location = transaction.location ?? 'Unknown';
  const device = transaction.device ?? 'Unknown';

  const scoreToColor = (score: number = 0) => {
    if (score < -0.5) return "bg-red-500";
    if (score < 0) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Status and Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {transaction.isFraud ? (
                    <AlertCircle className="text-red-500 mr-2" />
                  ) : (
                    <CheckCircle className="text-green-500 mr-2" />
                  )}
                  <span className="font-semibold">
                    {transaction.isFraud ? 'Fraudulent' : 'Legitimate'}
                  </span>
                </div>
                <div className={`px-4 py-1 rounded-full text-white ${scoreToColor(anomalyScore)}`}>
                  Score: {anomalyScore.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center">
                <CreditCard className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-semibold">${amount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-semibold">
                    {new Date(time).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold">{location}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Smartphone className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Device</div>
                  <div className="font-semibold">{device}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Similar Transactions Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  Loading...
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={similarTransactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={(time) => new Date(time).toLocaleDateString()}
                      />
                      <YAxis dataKey="amount" />
                      <Tooltip 
                        formatter={(value: number) => [`$${value}`, 'Amount']}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8"
                        dot={{r: 4}}
                        activeDot={{r: 8}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Risk Factors */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Risk Factors</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Amount Deviation</span>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.abs(anomalyScore * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Location Risk</span>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Device Trust</span>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;