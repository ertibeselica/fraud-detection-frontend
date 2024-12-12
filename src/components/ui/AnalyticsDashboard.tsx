import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, Smartphone, MapPin } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  time: string;
  location: string;
  device: string;
  isFraud: boolean;
  anomalyScore: number;
}

interface AnalyticsDashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ transactions }) => {

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center p-6">
                <p>No transaction data available</p>
            </div>
        );
    }
    const stats = useMemo(() => {
        if (!transactions.length) {
            return {
                totalTransactions: 0,
                totalAmount: 0,
                fraudAmount: 0,
                fraudRate: 0,
                averageAmount: 0
            };
        }

        const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const fraudAmount = transactions
            .filter(t => t.isFraud)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const fraudCount = transactions.filter(t => t.isFraud).length;

        return {
            totalTransactions: transactions.length,
            totalAmount: totalAmount,
            fraudAmount: fraudAmount,
            fraudRate: transactions.length ? (fraudCount / transactions.length) * 100 : 0,
            averageAmount: transactions.length ? totalAmount / transactions.length : 0
        };
    }, [transactions]);

  // Location distribution data
  const locationData = useMemo(() => {
    const distribution = transactions.reduce((acc, t) => {
      acc[t.location] = (acc[t.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([location, count]) => ({
      name: location,
      value: count
    }));
  }, [transactions]);

  const getRiskScoreData = useMemo(() => {
    // Create score ranges/bins
    const scoreRanges: { [key: string]: number } = {
      'Very Low Risk (-1.0 to -0.6)': 0,
      'Low Risk (-0.6 to -0.2)': 0,
      'Medium Risk (-0.2 to 0.2)': 0,
      'High Risk (0.2 to 0.6)': 0,
      'Very High Risk (0.6 to 1.0)': 0
    };
  
    // Count transactions in each range
    transactions.forEach(t => {
      const score = t.anomalyScore;
      if (score <= -0.6) scoreRanges['Very Low Risk (-1.0 to -0.6)']++;
      else if (score <= -0.2) scoreRanges['Low Risk (-0.6 to -0.2)']++;
      else if (score <= 0.2) scoreRanges['Medium Risk (-0.2 to 0.2)']++;
      else if (score <= 0.6) scoreRanges['High Risk (0.2 to 0.6)']++;
      else scoreRanges['Very High Risk (0.6 to 1.0)']++;
    });
  
    // Convert to array format for the chart
    return Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count
    }));
  }, [transactions]);

  // Device distribution data
  const deviceData = useMemo(() => {
    const distribution = transactions.reduce((acc, t) => {
      acc[t.device] = (acc[t.device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([device, count]) => ({
      name: device,
      value: count
    }));
  }, [transactions]);

  // Daily transaction volume
  const dailyVolume = useMemo(() => {
    const volumes = transactions.reduce((acc, t) => {
      const date = new Date(t.time).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { total: 0, fraudulent: 0 };
      }
      acc[date].total++;
      if (t.isFraud) acc[date].fraudulent++;
      return acc;
    }, {} as Record<string, { total: number; fraudulent: number }>);

    return Object.entries(volumes).map(([date, data]) => ({
      date,
      total: data.total,
      fraudulent: data.fraudulent
    }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-gray-500">All processed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Total transaction volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fraudRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Of total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                  <Line type="monotone" dataKey="fraudulent" stroke="#ff0000" name="Fraudulent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions by Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score Distribution */}
              <Card>
                  <CardHeader>
                      <CardTitle>Risk Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getRiskScoreData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                      dataKey="range"
                                      angle={-45}
                                      textAnchor="end"
                                      height={80}
                                  />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#8884d8">
                                      {getRiskScoreData.map((entry, index) => (
                                          <Cell
                                              key={`cell-${index}`}
                                              fill={index > 2 ? '#ff0000' : '#00C49F'}
                                          />
                                      ))}
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </CardContent>
              </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;