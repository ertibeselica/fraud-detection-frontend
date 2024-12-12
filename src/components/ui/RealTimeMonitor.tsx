import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { AlertCircle, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

interface Transaction {
  id: number;
  amount: number;
  time: string;
  location: string;
  device: string;
  isFraud: boolean;
  anomalyScore: number;
}

interface RealTimeMonitorProps {
  onNewTransaction: (transaction: Transaction) => void;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ onNewTransaction }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Transaction[]>([]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('https://localhost:7284/transactionHub', {
                withCredentials: true // Ensures cookies or headers are passed
            })
            .withAutomaticReconnect()
            .configureLogging('debug') // Enable logging for debugging
            .build();

        setConnection(connection);
    }, []);

    useEffect(() => {
        if (connection) {
            console.log('Starting connection...'); // Debug log

            connection.start()
                .then(() => {
                    console.log('Connected to SignalR hub');

                    connection.on('ReceiveTransaction', (transaction: Transaction) => {
                        console.log('Received transaction:', transaction); // Debug log
                        setRecentTransactions(prev => [transaction, ...prev].slice(0, 10));
                        onNewTransaction(transaction);
                    });

                    connection.on('ReceiveFraudAlert', (transaction: Transaction) => {
                        console.log('Received fraud alert:', transaction); // Debug log
                        setAlerts(prev => [transaction, ...prev].slice(0, 5));
                    });
                })
                .catch(error => console.error('SignalR Connection Error: ', error));
        }
    }, [connection]);

  const showToast = (message: string, type: 'info' | 'error' = 'info') => {
    // You can use any toast library here (react-toastify, react-hot-toast, etc.)
    // For now, we'll just console.log
    console.log(`Toast (${type}):`, message);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Live Transaction Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Live Transaction Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {recentTransactions.map((transaction) => (
                          <div
                              key={transaction.id}
                              className={`p-3 rounded-lg border ${transaction.isFraud ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                  }`}
                          >
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-semibold">
                                          ${(transaction.amount ?? 0).toFixed(2)}  {/* Add null check */}
                                      </p>
                                      <p className="text-sm text-gray-600">{transaction.location}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                          {new Date(transaction.time).toLocaleTimeString()}
                                      </p>
                                      <p className="text-sm">{transaction.device}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
        </CardContent>
      </Card>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            Fraud Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {alerts.map((transaction) => (
                          <div
                              key={transaction.id}
                              className="p-3 rounded-lg bg-red-50 border border-red-200"
                          >
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-semibold text-red-600">
                                          Suspicious Transaction Detected
                                      </p>
                                      <p className="text-sm text-gray-600">
                                          Amount: ${(transaction.amount ?? 0).toFixed(2)}  {/* Add null check */}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                          Location: {transaction.location ?? 'Unknown'}  {/* Add null check */}
                                      </p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                          {transaction.time ? new Date(transaction.time).toLocaleTimeString() : ''}  {/* Add null check */}
                                      </p>
                                      <p className="text-sm">
                                          Risk Score: {(transaction.anomalyScore ?? 0).toFixed(3)}  {/* Add null check */}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMonitor;