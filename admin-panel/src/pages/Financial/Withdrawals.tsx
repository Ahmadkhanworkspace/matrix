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
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  DollarSign,
  CreditCard,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { adminApiService } from '../../api/adminApi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  withdrawalMethod?: string;
  status: string;
  fee: number;
  netAmount: number;
  transactionId?: string;
  gatewayResponse?: any;
  metadata?: any;
  createdAt: string;
  processedAt?: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface WithdrawalFilters {
  page: number;
  limit: number;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

const WithdrawalsManagement: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filters, setFilters] = useState<WithdrawalFilters>({
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
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [transactionId, setTransactionId] = useState('');

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getTransactions({
        ...filters,
        type: 'withdrawal'
      });
      
      setWithdrawals(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filters]);

  const handleFilterChange = (key: keyof WithdrawalFilters, value: any) => {
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

  const handleProcessWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject' | 'complete', notes?: string) => {
    try {
      setProcessing(withdrawalId);
      
      const updateData: any = {
        status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'CANCELLED' : 'COMPLETED'
      };

      if (action === 'complete' && transactionId) {
        updateData.transactionId = transactionId;
      }

      if (notes) {
        updateData.notes = notes;
      }

      await adminApiService.updateTransaction(withdrawalId, updateData);

      toast.success(`Withdrawal ${action}d successfully`);
      setTransactionId('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error(`Failed to ${action} withdrawal`);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkProcess = async (action: 'approve' | 'reject') => {
    if (selectedWithdrawals.length === 0) {
      toast.error('Please select withdrawals to process');
      return;
    }

    try {
      setProcessing('bulk');
      
      await adminApiService.bulkActionUsers(selectedWithdrawals, action);
      
      toast.success(`${selectedWithdrawals.length} withdrawals ${action}d successfully`);
      setSelectedWithdrawals([]);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error bulk processing withdrawals:', error);
      toast.error(`Failed to ${action} withdrawals`);
    } finally {
      setProcessing(null);
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
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PROCESSING: { color: 'bg-purple-100 text-purple-800', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getWithdrawalMethodBadge = (method?: string) => {
    if (!method) return <Badge className="bg-gray-100 text-gray-800">Manual</Badge>;
    
    const methodColors = {
      CRYPTO: 'bg-orange-100 text-orange-800',
      BANK_TRANSFER: 'bg-blue-100 text-blue-800',
      PAYPAL: 'bg-yellow-100 text-yellow-800',
      STRIPE: 'bg-indigo-100 text-indigo-800'
    };

    return (
      <Badge className={methodColors[method as keyof typeof methodColors] || 'bg-gray-100 text-gray-800'}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdrawals Management</h1>
          <p className="text-gray-600 mt-1">Manage and process user withdrawal requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchWithdrawals} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

      {/* Bulk Actions */}
      {selectedWithdrawals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedWithdrawals.length} withdrawal(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleBulkProcess('approve')}
                  disabled={processing === 'bulk'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  onClick={() => handleBulkProcess('reject')}
                  disabled={processing === 'bulk'}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Withdrawals ({pagination.total})</span>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading withdrawals...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <input
                        type="checkbox"
                        checked={selectedWithdrawals.length === withdrawals.length && withdrawals.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWithdrawals(withdrawals.map(w => w.id));
                          } else {
                            setSelectedWithdrawals([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Fee</th>
                    <th className="text-left p-2">Net Amount</th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-left p-2">Wallet</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedWithdrawals.includes(withdrawal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWithdrawals(prev => [...prev, withdrawal.id]);
                            } else {
                              setSelectedWithdrawals(prev => prev.filter(id => id !== withdrawal.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{withdrawal.user.username}</div>
                          <div className="text-sm text-gray-500">{withdrawal.user.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-red-600 mr-1" />
                          <span className="font-medium">{formatCurrency(withdrawal.amount, withdrawal.currency)}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-600">{formatCurrency(withdrawal.fee, withdrawal.currency)}</span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-medium text-green-600">{formatCurrency(withdrawal.netAmount, withdrawal.currency)}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        {getWithdrawalMethodBadge(withdrawal.withdrawalMethod)}
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-sm text-gray-600" title={withdrawal.walletAddress}>
                          {withdrawal.walletAddress}
                        </div>
                      </td>
                      <td className="p-2">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* View details */}}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {withdrawal.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleProcessWithdrawal(withdrawal.id, 'approve')}
                                disabled={processing === withdrawal.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleProcessWithdrawal(withdrawal.id, 'reject')}
                                disabled={processing === withdrawal.id}
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const txId = prompt('Enter transaction ID:');
                                if (txId) {
                                  setTransactionId(txId);
                                  handleProcessWithdrawal(withdrawal.id, 'complete');
                                }
                              }}
                              disabled={processing === withdrawal.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {withdrawals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No withdrawals found</p>
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

export default WithdrawalsManagement;