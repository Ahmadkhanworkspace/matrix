import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  DollarSign, 
  Clock,
  User,
  Calendar,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Banknote,
  ExternalLink
} from 'lucide-react';
import { api } from '../../api';

interface Withdrawal {
  id: number;
  user_id: number;
  username: string;
  email: string;
  amount: number;
  currency: string;
  payment_method: string;
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  created_at: string;
  processed_at?: string;
  notes?: string;
  transaction_id?: string;
  fee: number;
  net_amount: number;
}

const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<number[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    totalAmount: 0,
    totalFees: 0
  });

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    filterWithdrawals();
    calculateStats();
  }, [withdrawals, searchTerm, statusFilter, methodFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockWithdrawals: Withdrawal[] = [
        {
          id: 1,
          user_id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          amount: 500,
          currency: 'USD',
          payment_method: 'bitcoin',
          wallet_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z',
          fee: 12.50,
          net_amount: 487.50
        },
        {
          id: 2,
          user_id: 2,
          username: 'jane_smith',
          email: 'jane@example.com',
          amount: 250,
          currency: 'USD',
          payment_method: 'ethereum',
          wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          status: 'approved',
          created_at: '2024-01-14T15:45:00Z',
          processed_at: '2024-01-15T09:20:00Z',
          transaction_id: '0x1234567890abcdef',
          fee: 6.25,
          net_amount: 243.75
        },
        {
          id: 3,
          user_id: 3,
          username: 'bob_wilson',
          email: 'bob@example.com',
          amount: 1000,
          currency: 'USD',
          payment_method: 'bank_transfer',
          wallet_address: '',
          status: 'processing',
          created_at: '2024-01-13T08:15:00Z',
          notes: 'Processing bank transfer',
          fee: 25.00,
          net_amount: 975.00
        }
      ];
      
      setWithdrawals(mockWithdrawals);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWithdrawals = () => {
    let filtered = withdrawals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(withdrawal =>
        withdrawal.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(withdrawal => withdrawal.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(withdrawal => withdrawal.payment_method === methodFilter);
    }

    setFilteredWithdrawals(filtered);
  };

  const calculateStats = () => {
    const total = withdrawals.length;
    const pending = withdrawals.filter(w => w.status === 'pending').length;
    const approved = withdrawals.filter(w => w.status === 'approved').length;
    const rejected = withdrawals.filter(w => w.status === 'rejected').length;
    const processing = withdrawals.filter(w => w.status === 'processing').length;
    const totalAmount = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);
    const totalFees = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.fee, 0);

    setStats({ total, pending, approved, rejected, processing, totalAmount, totalFees });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleMethodFilter = (method: string) => {
    setMethodFilter(method);
  };

  const handleSelectWithdrawal = (withdrawalId: number) => {
    setSelectedWithdrawals(prev => 
      prev.includes(withdrawalId) 
        ? prev.filter(id => id !== withdrawalId)
        : [...prev, withdrawalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWithdrawals.length === filteredWithdrawals.length) {
      setSelectedWithdrawals([]);
    } else {
      setSelectedWithdrawals(filteredWithdrawals.map(withdrawal => withdrawal.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedWithdrawals.length === 0) return;

    try {
      switch (action) {
        case 'approve':
          await Promise.all(selectedWithdrawals.map(id => api.payment.approveWithdrawal(id)));
          break;
        case 'reject':
          await Promise.all(selectedWithdrawals.map(id => api.payment.rejectWithdrawal(id)));
          break;
      }
      fetchWithdrawals();
      setSelectedWithdrawals([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: number) => {
    try {
      // await api.payment.approveWithdrawal(withdrawalId);
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'approved', processed_at: new Date().toISOString() } : w
      ));
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: number) => {
    try {
      // await api.payment.rejectWithdrawal(withdrawalId);
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'rejected', processed_at: new Date().toISOString() } : w
      ));
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Username', 'Email', 'Amount', 'Currency', 'Method', 'Status', 'Date'],
      ...filteredWithdrawals.map(withdrawal => [
        withdrawal.id,
        withdrawal.username,
        withdrawal.email,
        withdrawal.amount.toString(),
        withdrawal.currency,
        withdrawal.payment_method,
        withdrawal.status,
        withdrawal.created_at
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'withdrawals.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bitcoin':
      case 'btc':
        return <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₿</div>;
      case 'ethereum':
      case 'eth':
        return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</div>;
      case 'tron':
      case 'trx':
        return <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>;
      case 'bank_transfer':
        return <Banknote className="h-6 w-6 text-gray-400" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-400" />;
    }
  };

  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading withdrawals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-600">Manage member withdrawal requests</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchWithdrawals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => handleMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="tron">Tron</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedWithdrawals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedWithdrawals.length} withdrawal(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('reject')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawals ({filteredWithdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedWithdrawals.length === filteredWithdrawals.length && filteredWithdrawals.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedWithdrawals.includes(withdrawal.id)}
                        onChange={() => handleSelectWithdrawal(withdrawal.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{withdrawal.username}</div>
                          <div className="text-sm text-gray-500">{withdrawal.email}</div>
                          {withdrawal.wallet_address && (
                            <div className="text-xs text-gray-400 truncate max-w-32">
                              {withdrawal.wallet_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-lg">${withdrawal.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        Fee: ${withdrawal.fee.toFixed(2)} | Net: ${withdrawal.net_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getMethodIcon(withdrawal.payment_method)}
                        <span className="ml-2 text-sm">{withdrawal.payment_method}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(withdrawal.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveWithdrawal(withdrawal.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectWithdrawal(withdrawal.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {withdrawal.transaction_id && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals; 
