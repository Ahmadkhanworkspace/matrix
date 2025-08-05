import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Bitcoin,
  Banknote,
  Coins,
  Calendar,
  User,
  Hash,
  Activity,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected';
  gateway: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  fee: number;
  netAmount: number;
  walletAddress: string;
  ipAddress: string;
  userAgent: string;
  adminNotes?: string;
  processingTime?: number;
}

interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const WithdrawalsList: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadWithdrawals();
  }, [currentPage, searchTerm, statusFilter, gatewayFilter, sortBy, sortOrder]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTransactions({
        page: currentPage,
        limit: 20,
        type: 'withdrawal',
        status: statusFilter === 'all' ? undefined : statusFilter,
      }) as any;
      
      if (response.success && response.data) {
        setWithdrawals(response.data);
        setTotalPages(Math.ceil(response.data.length / 20));
        setTotalWithdrawals(response.data.length);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'gateway') {
      setGatewayFilter(value);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectWithdrawal = (withdrawalId: string) => {
    setSelectedWithdrawals(prev => 
      prev.includes(withdrawalId) 
        ? prev.filter(id => id !== withdrawalId)
        : [...prev, withdrawalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWithdrawals.length === withdrawals.length) {
      setSelectedWithdrawals([]);
    } else {
      setSelectedWithdrawals(withdrawals.map(w => w.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedWithdrawals.length === 0) {
      toast.error('Please select withdrawals to perform this action');
      return;
    }

    try {
      setLoading(true);
      await adminService.bulkActionTransactions(selectedWithdrawals, action);
      toast.success(`Bulk ${action} completed successfully`);
      setSelectedWithdrawals([]);
      loadWithdrawals();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      toast.error(`Bulk ${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'coinpayments':
        return Bitcoin;
      case 'nowpayments':
        return Coins;
      case 'stripe':
        return CreditCard;
      case 'paypal':
        return Banknote;
      default:
        return DollarSign;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProcessingTime = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return null;
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffMs = completed.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals Management</h1>
          <p className="text-gray-600">Manage all withdrawal transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            onClick={loadWithdrawals}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Withdrawal
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by username, transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gateway</label>
              <select
                value={gatewayFilter}
                onChange={(e) => handleFilterChange('gateway', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Gateways</option>
                <option value="coinpayments">CoinPayments</option>
                <option value="nowpayments">NOWPayments</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setGatewayFilter('all');
                }}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedWithdrawals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedWithdrawals.length} withdrawal(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Withdrawals</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Total: {totalWithdrawals}</span>
              <span>•</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedWithdrawals.length === withdrawals.length && withdrawals.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 text-gray-400 mr-2" />
                      Loading withdrawals...
                    </div>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => {
                  const GatewayIcon = getGatewayIcon(withdrawal.gateway);
                  const processingTime = getProcessingTime(withdrawal.createdAt, withdrawal.completedAt);
                  return (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedWithdrawals.includes(withdrawal.id)}
                          onChange={() => handleSelectWithdrawal(withdrawal.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{withdrawal.username}</div>
                            <div className="text-sm text-gray-500">ID: {withdrawal.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(withdrawal.amount, withdrawal.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Fee: {formatAmount(withdrawal.fee, withdrawal.currency)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Net: {formatAmount(withdrawal.netAmount, withdrawal.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <GatewayIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">{withdrawal.gateway}</span>
                        </div>
                        <div className="text-sm text-gray-500">ID: {withdrawal.transactionId}</div>
                        <div className="text-xs text-gray-400 truncate max-w-32">
                          {withdrawal.walletAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                        {processingTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Processed in {processingTime}
                          </div>
                        )}
                        {withdrawal.status === 'rejected' && withdrawal.rejectedReason && (
                          <div className="text-xs text-red-500 mt-1 truncate max-w-32">
                            {withdrawal.rejectedReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(withdrawal.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          {withdrawal.status === 'pending' && (
                            <>
                              <button className="text-green-600 hover:text-green-900">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalWithdrawals)} of {totalWithdrawals} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalsList; 
