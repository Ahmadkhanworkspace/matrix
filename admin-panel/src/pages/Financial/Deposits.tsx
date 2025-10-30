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
  CheckCircle2
} from 'lucide-react';
import { adminApiService } from '../../api/adminApi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { toast } from 'react-hot-toast';

interface Deposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  status: string;
  description: string;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  processedAt?: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  gatewayConfig: {
    name: string;
    gateway: string;
  };
}

interface DepositFilters {
  page: number;
  limit: number;
  status?: string;
  gateway?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

const DepositsManagement: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filters, setFilters] = useState<DepositFilters>({
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
  const [selectedDeposits, setSelectedDeposits] = useState<string[]>([]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getTransactions({
        ...filters,
        type: 'deposit'
      });
      
      setDeposits(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [filters]);

  const handleFilterChange = (key: keyof DepositFilters, value: any) => {
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

  const handleProcessDeposit = async (depositId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setProcessing(depositId);
      
      await adminApiService.updateTransaction(depositId, {
        status: action === 'approve' ? 'COMPLETED' : 'FAILED',
        notes
      });

      toast.success(`Deposit ${action}d successfully`);
      fetchDeposits();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error(`Failed to ${action} deposit`);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkProcess = async (action: 'approve' | 'reject') => {
    if (selectedDeposits.length === 0) {
      toast.error('Please select deposits to process');
      return;
    }

    try {
      setProcessing('bulk');
      
      await adminApiService.bulkActionUsers(selectedDeposits, action);
      
      toast.success(`${selectedDeposits.length} deposits ${action}d successfully`);
      setSelectedDeposits([]);
      fetchDeposits();
    } catch (error) {
      console.error('Error bulk processing deposits:', error);
      toast.error(`Failed to ${action} deposits`);
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

  const getGatewayBadge = (gateway: string) => {
    const gatewayColors = {
      COINPAYMENTS: 'bg-blue-100 text-blue-800',
      NOWPAYMENTS: 'bg-purple-100 text-purple-800',
      STRIPE: 'bg-indigo-100 text-indigo-800',
      PAYPAL: 'bg-yellow-100 text-yellow-800',
      BINANCE: 'bg-orange-100 text-orange-800',
      CRYPTO: 'bg-green-100 text-green-800',
      BANK_TRANSFER: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={gatewayColors[gateway as keyof typeof gatewayColors] || 'bg-gray-100 text-gray-800'}>
        {gateway.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deposits Management</h1>
          <p className="text-gray-600 mt-1">Manage and process user deposits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchDeposits} variant="outline" size="sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
              <Select value={filters.gateway || ''} onValueChange={(value) => handleFilterChange('gateway', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Gateways" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Gateways</SelectItem>
                  <SelectItem value="COINPAYMENTS">CoinPayments</SelectItem>
                  <SelectItem value="NOWPAYMENTS">NOWPayments</SelectItem>
                  <SelectItem value="STRIPE">Stripe</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="BINANCE">Binance</SelectItem>
                  <SelectItem value="CRYPTO">Crypto Direct</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
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
      {selectedDeposits.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedDeposits.length} deposit(s) selected
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

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Deposits ({pagination.total})</span>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading deposits...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <input
                        type="checkbox"
                        checked={selectedDeposits.length === deposits.length && deposits.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDeposits(deposits.map(d => d.id));
                          } else {
                            setSelectedDeposits([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Gateway</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedDeposits.includes(deposit.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeposits(prev => [...prev, deposit.id]);
                            } else {
                              setSelectedDeposits(prev => prev.filter(id => id !== deposit.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{deposit.user.username}</div>
                          <div className="text-sm text-gray-500">{deposit.user.email}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-medium">{formatCurrency(deposit.amount, deposit.currency)}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        {getGatewayBadge(deposit.paymentGateway)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(deposit.status)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(deposit.createdAt).toLocaleDateString()}
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
                          {deposit.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleProcessDeposit(deposit.id, 'approve')}
                                disabled={processing === deposit.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleProcessDeposit(deposit.id, 'reject')}
                                disabled={processing === deposit.id}
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {deposits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No deposits found</p>
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

export default DepositsManagement;