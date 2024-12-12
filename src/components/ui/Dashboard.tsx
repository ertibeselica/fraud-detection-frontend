import React, { useState, useEffect } from 'react';
import TransactionDetailModal from './TransactionDetailModal';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import TransactionFilters from './TransactionFilters';
import { AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RealTimeMonitor from './RealTimeMonitor';
import BatchTransactionUploader from './BatchTransactionUpload';



import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: number;
  amount: number;
  time: string;
  location: string;
  device: string;
  isFraud: boolean;
  anomalyScore: number;
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    location: '',
    device: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarTransactions, setSimilarTransactions] = useState<Transaction[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    dateRange: { from: '', to: '' },
    amountRange: { min: '', max: '' },
    location: '',
    device: '',
    fraudStatus: 'all'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('api/transactions/all');
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
      setRefreshLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
      setRefreshLoading(false);
      toast.error('Failed to fetch transactions');
    }
  };

  const handleManualRefresh = () => {
    setRefreshLoading(true);
    fetchTransactions();
  };

  const handleNewTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    // Optionally update your analytics
    if (transaction.isFraud) {
      toast.error(`🚨 Suspicious transaction detected: $${transaction.amount}`);
    } else {
      toast.info(`New transaction: $${transaction.amount}`);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to your transactions
    const filteredTransactions = transactions.filter(transaction => {
      // Search filter
      if (newFilters.search && 
          !Object.values(transaction).some(value => 
            String(value).toLowerCase().includes(newFilters.search.toLowerCase())
          )) {
        return false;
      }
      
      // Date range filter
      if (newFilters.dateRange.from && new Date(transaction.time) < new Date(newFilters.dateRange.from)) {
        return false;
      }
      if (newFilters.dateRange.to && new Date(transaction.time) > new Date(newFilters.dateRange.to)) {
        return false;
      }
      
      // Amount range filter
      if (newFilters.amountRange.min && transaction.amount < Number(newFilters.amountRange.min)) {
        return false;
      }
      if (newFilters.amountRange.max && transaction.amount > Number(newFilters.amountRange.max)) {
        return false;
      }
      
      // Location filter
      if (newFilters.location && !transaction.location.toLowerCase().includes(newFilters.location.toLowerCase())) {
        return false;
      }
      
      // Device filter
      if (newFilters.device && !transaction.device.toLowerCase().includes(newFilters.device.toLowerCase())) {
        return false;
      }
      
      // Fraud status filter
      if (newFilters.fraudStatus !== 'all') {
        if (newFilters.fraudStatus === 'fraud' && !transaction.isFraud) {
          return false;
        }
        if (newFilters.fraudStatus === 'legitimate' && transaction.isFraud) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredTransactions(filteredTransactions);
  };

  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const handleTransactionClick = async (transaction: Transaction) => {
    try {
      console.log('Clicked transaction:', transaction);
      setSelectedTransaction(transaction);
      setIsModalOpen(true);
      setLoadingSimilar(true);
      
      const response = await fetch(`/api/transactions/similar/${transaction.id}`);
      console.log('API Response:', response);
      
      const data = await response.json();
      console.log('Similar transactions:', data);
      
      setSimilarTransactions(data);
    } catch (error) {
      console.error('Error:', error);
      setSimilarTransactions([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('api/transactions/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTransaction,
          time: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        // Instead of auto-fetching, just reset the form
        setNewTransaction({ amount: '', location: '', device: '' });
        toast.success('Transaction processed successfully');
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast.error('Failed to process transaction');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction Dashboard</h1>
        <button 
          onClick={handleManualRefresh} 
          disabled={refreshLoading}
          className="flex items-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCcw className={`mr-2 ${refreshLoading ? 'animate-spin' : ''}`} />
          Refresh Transactions
        </button>
      </div>
      <TransactionFilters onFilterChange={handleFilterChange} />
      <div className="mb-6">
    <BatchTransactionUploader />
  </div>
      <div className="mb-6">
        <AnalyticsDashboard transactions={transactions} />
      </div>
      <div className="mb-6">
        <RealTimeMonitor onNewTransaction={handleNewTransaction} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 border rounded"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-2 border rounded"
                  value={newTransaction.location}
                  onChange={(e) => setNewTransaction({...newTransaction, location: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Device"
                  className="w-full p-2 border rounded"
                  value={newTransaction.device}
                  onChange={(e) => setNewTransaction({...newTransaction, device: e.target.value})}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Process Transaction
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Transactions:</span>
                <span className="font-bold">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fraudulent Transactions:</span>
                <span className="font-bold text-red-500">
                  {transactions.filter(t => t.isFraud).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Legitimate Transactions:</span>
                <span className="font-bold text-green-500">
                  {transactions.filter(t => !t.isFraud).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactions.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={formatDate} />
                <YAxis dataKey="amount" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Device</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <td className="p-2">{formatDate(transaction.time)}</td>
                    <td className="p-2">${transaction.amount.toFixed(2)}</td>
                    <td className="p-2">{transaction.location}</td>
                    <td className="p-2">{transaction.device}</td>
                    <td className="p-2">
                      {transaction.isFraud ? (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Fraudulent
                        </div>
                      ) : (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Legitimate
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        similarTransactions={similarTransactions}
        isLoading={loadingSimilar}
      />
    </div>
  );
};

export default Dashboard;
