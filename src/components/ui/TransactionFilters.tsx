import React, { useState } from 'react';
import { Search, Calendar, DollarSign, MapPin, Smartphone, Filter } from 'lucide-react';

interface FilterState {
  search: string;
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  location: string;
  device: string;
  fraudStatus: 'all' | 'fraud' | 'legitimate';
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: {
      from: '',
      to: ''
    },
    amountRange: {
      min: '',
      max: ''
    },
    location: '',
    device: '',
    fraudStatus: 'all'
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      {/* Search Bar - Always visible */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full border-none focus:ring-0 text-sm"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 text-sm"
                value={filters.dateRange.from}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
              />
              <input
                type="date"
                className="w-full rounded-md border-gray-300 text-sm"
                value={filters.dateRange.to}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full rounded-md border-gray-300 text-sm"
                value={filters.amountRange.min}
                onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full rounded-md border-gray-300 text-sm"
                value={filters.amountRange.max}
                onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by location"
              className="w-full rounded-md border-gray-300 text-sm"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          {/* Device */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Device
            </label>
            <input
              type="text"
              placeholder="Filter by device"
              className="w-full rounded-md border-gray-300 text-sm"
              value={filters.device}
              onChange={(e) => handleFilterChange('device', e.target.value)}
            />
          </div>

          {/* Fraud Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fraud Status</label>
            <select
              className="w-full rounded-md border-gray-300 text-sm"
              value={filters.fraudStatus}
              onChange={(e) => handleFilterChange('fraudStatus', e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="fraud">Fraudulent</option>
              <option value="legitimate">Legitimate</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;