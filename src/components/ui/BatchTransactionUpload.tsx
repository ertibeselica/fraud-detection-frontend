import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface BatchProcessingStatus {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  fraudulent: number;
}

const BatchTransactionUploader: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<BatchProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Read and parse CSV file
      const transactions = await parseCSVFile(file);
      
      // Process transactions in batches
      const batchSize = 50; // Adjust based on your needs
      const batches = chunkArray(transactions, batchSize);
      
      let processed = 0;
      let successful = 0;
      let failed = 0;
      let fraudulent = 0;

      for (const batch of batches) {
        const response = await fetch('/api/transactions/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactions: batch }),
        });

        const result = await response.json();
        processed += batch.length;
        successful += result.successful;
        failed += result.failed;
        fraudulent += result.fraudulent;

        // Update progress
        setStatus({
          total: transactions.length,
          processed,
          successful,
          failed,
          fraudulent
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                const transactions = lines.slice(1)
                    .filter(line => line.trim())
                    .map(line => {
                        const values = line.split(',');
                        // Map CSV fields to your Transaction model
                        return {
                            amount: parseFloat(values[0]),
                            time: new Date().toISOString(), // Or map from CSV date field
                            location: values[1],
                            device: values[2]
                            // Add other fields as needed
                        };
                    });

                resolve(transactions);
            } catch (err) {
                reject(new Error('Failed to parse CSV file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks = [] as T[][]; // Assert chunks as an array of T arrays
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size)); // Type inference works correctly
  }
  return chunks;
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Transaction Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center cursor-pointer ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">
                {isProcessing ? 'Processing...' : 'Upload CSV file'}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                (Format: amount, location, device, time)
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {status && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-lg font-semibold">{status.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Processed</div>
                    <div className="text-lg font-semibold">{status.processed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Successful</div>
                    <div className="text-lg font-semibold text-green-600">
                      {status.successful}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Failed</div>
                    <div className="text-lg font-semibold text-red-600">
                      {status.failed}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-600">
                      {Math.round((status.processed / status.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    style={{ width: `${(status.processed / status.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchTransactionUploader;