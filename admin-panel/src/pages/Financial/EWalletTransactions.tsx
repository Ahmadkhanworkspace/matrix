import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Plus,
  Eye,
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { adminApiService } from '../../api/adminApi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';

interface EWalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;
  status: string;
  balance: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface EWalletFilters {
  page: number;
  limit: number;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

const EWalletTransactions: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<EWalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EWalletFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: '',
    type: 'ADMIN_ADJUSTMENT',
    amount: '',
    currency: primaryCurrency,
    description: ''
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getTransactions({
        ...filters,
        type: 'ewallet'
      });
      
      setTransactions(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error fetching eWallet transactions:', error);
      toast.error('Failed to fetch eWallet transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (key: keyof EWalletFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      userId: searchTerm,
      page: 1
    }));
  };

  const handleCreateTransaction = async () => {
    try {
      if (!createForm.userId || !createForm.amount || !createForm.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      await adminApiService.createEWalletTransaction({
        userId: createForm.userId,
        type: createForm.type,
        amount: parseFloat(createForm.amount),
        currency: createForm.currency,
        description: createForm.description
      });

      toast.success('eWallet transaction created successfully');
      setShowCreateForm(false);
      setCreateForm({
        userId: '',
        type: 'ADMIN_ADJUSTMENT',
        amount: '',
        currency: primaryCurrency,
        description: ''
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating eWallet transaction:', error);
      toast.error('Failed to create eWallet transaction');
    }
  };

  const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { color: 'bg-green-100 text-green-800' },
      FAILED: { color: 'bg-red-100 text-red-800' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={config.color}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      DEPOSIT: { color: 'bg-green-100 text-green-800', icon: ArrowUpRight },
      WITHDRAWAL: { color: 'bg-red-100 text-red-800', icon: ArrowDownRight },
      ADMIN_ADJUSTMENT: { color: 'bg-blue-100 text-blue-800', icon: Wallet },
      REFERRAL_BONUS: { color: 'bg-purple-100 text-purple-800', icon: DollarSign },
      MATRIX_BONUS: { color: 'bg-orange-100 text-orange-800', icon: DollarSign },
      MATCHING_BONUS: { color: 'bg-pink-100 text-pink-800', icon: DollarSign },
      CYCLE_BONUS: { color: 'bg-indigo-100 text-indigo-800', icon: DollarSign }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.ADMIN_ADJUSTMENT;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-Wallet Transactions</h1>
          <p className="text-gray-600 mt-1">Manage internal wallet transactions and adjustments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchTransactions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Transaction
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create E-Wallet Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <Input
                  placeholder="Enter user ID"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, userId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN_ADJUSTMENT">Admin Adjustment</SelectItem>
                    <SelectItem value="REFERRAL_BONUS">Referral Bonus</SelectItem>
                    <SelectItem value="MATRIX_BONUS">Matrix Bonus</SelectItem>
                    <SelectItem value="MATCHING_BONUS">Matching Bonus</SelectItem>
                    <SelectItem value="CYCLE_BONUS">Cycle Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <Select value={createForm.currency} onValueChange={(value) => setCreateForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  placeholder="Enter transaction description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTransaction}>
                Create Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="ADMIN_ADJUSTMENT">Admin Adjustment</SelectItem>
                  <SelectItem value="REFERRAL_BONUS">Referral Bonus</SelectItem>
                  <SelectItem value="MATRIX_BONUS">Matrix Bonus</SelectItem>
                  <SelectItem value="MATCHING_BONUS">Matching Bonus</SelectItem>
                  <SelectItem value="CYCLE_BONUS">Cycle Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
              <div className="flex">
                <Input
                  placeholder="Username or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleSearch} variant="outline" className="ml-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>E-Wallet Transactions ({pagination.total})</span>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{transaction.user.username}</div>
                          <div className="text-sm text-gray-500">{transaction.user.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        {getTypeBadge(transaction.type)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-600 mr-1" />
                          <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{formatCurrency(transaction.balance, transaction.currency)}</span>
                      </td>
                      <td className="p-2">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-sm text-gray-600" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* View details */}}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No eWallet transactions found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => handleFilterChange('page', pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EWalletTransactions; 
