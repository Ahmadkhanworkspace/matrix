import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { 
  DollarSign, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Wallet,
  Banknote,
  ExternalLink
} from 'lucide-react';

interface WithdrawalRequest {
  id: number;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method: string;
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  created_at: string;
  processed_at?: string;
  notes?: string;
  transaction_id?: string;
}

const Withdrawal: React.FC = () => {
  const { user } = useAuth();
  const { primaryCurrency } = useCurrency();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [newWithdrawal, setNewWithdrawal] = useState({
    amount: '',
    payment_method: 'bitcoin',
    wallet_address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: 1,
          amount: 500.00,
          fee: 12.50,
          net_amount: 487.50,
          payment_method: 'bitcoin',
          wallet_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          amount: 250.00,
          fee: 6.25,
          net_amount: 243.75,
          payment_method: 'ethereum',
          wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          status: 'approved',
          created_at: '2024-01-14T15:45:00Z',
          processed_at: '2024-01-15T09:20:00Z',
          transaction_id: '0x1234567890abcdef'
        },
        {
          id: 3,
          amount: 1000.00,
          fee: 25.00,
          net_amount: 975.00,
          payment_method: 'bank_transfer',
          wallet_address: '',
          status: 'processing',
          created_at: '2024-01-13T08:15:00Z',
          notes: 'Processing bank transfer'
        }
      ];
      
      setWithdrawals(mockWithdrawals);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amount = parseFloat(newWithdrawal.amount);
      const fee = amount * 0.025; // 2.5% fee
      const netAmount = amount - fee;

      const withdrawal: WithdrawalRequest = {
        id: Date.now(),
        amount,
        fee,
        net_amount: netAmount,
        payment_method: newWithdrawal.payment_method,
        wallet_address: newWithdrawal.wallet_address,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setWithdrawals(prev => [withdrawal, ...prev]);
      setNewWithdrawal({ amount: '', payment_method: 'bitcoin', wallet_address: '' });
      setShowWithdrawalForm(false);
    } catch (error) {
      console.error('Failed to submit withdrawal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    try {
      if (amount === null || amount === undefined) {
        return '0.00 USD';
      }
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) {
        return '0.00 USD';
      }
      return formatCurrencyUtil(numAmount, primaryCurrency || 'USD');
    } catch (error) {
      console.error('Currency formatting error:', error);
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
      return `${(numAmount || 0).toFixed(2)} ${primaryCurrency || 'USD'}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Processing</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
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

  const calculateStats = () => {
    const total = withdrawals.length;
    const pending = withdrawals.filter(w => w.status === 'pending').length;
    const approved = withdrawals.filter(w => w.status === 'approved').length;
    const totalAmount = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);
    const totalFees = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.fee, 0);

    return { total, pending, approved, totalAmount, totalFees };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-2 text-gray-400">Loading withdrawals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Withdrawal</h1>
          <p className="text-gray-400">Request withdrawals and track your payment history</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchWithdrawals}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
          <button
            onClick={() => setShowWithdrawalForm(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2 inline" />
            New Withdrawal
          </button>
        </div>
      </div>

      {/* Balance Info */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Available Balance</h3>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(user?.balance || 0)}
            </p>
            <p className="text-gray-400 text-sm mt-1">Ready for withdrawal</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Total Withdrawn</h3>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(stats.totalAmount)}
            </p>
            <p className="text-gray-400 text-sm mt-1">Successfully processed</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.pending}
            </p>
            <p className="text-gray-400 text-sm mt-1">Awaiting approval</p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form Modal */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">New Withdrawal Request</h2>
              <button
                onClick={() => setShowWithdrawalForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({primaryCurrency})
                </label>
                <input
                  type="number"
                  min="10"
                  max={user?.balance || 0}
                  step="0.01"
                  value={newWithdrawal.amount}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: {formatCurrency(user?.balance || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={newWithdrawal.payment_method}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="tron">Tron</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newWithdrawal.wallet_address}
                  onChange={(e) => setNewWithdrawal(prev => ({ ...prev, wallet_address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter wallet address"
                  required
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Withdrawal Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">{formatCurrency(parseFloat(newWithdrawal.amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee (2.5%):</span>
                    <span className="text-red-400">-{formatCurrency(Math.abs((parseFloat(newWithdrawal.amount) || 0) * 0.025))}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-300">Net Amount:</span>
                      <span className="text-green-400">
                        {formatCurrency((parseFloat(newWithdrawal.amount) || 0) * 0.975)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newWithdrawal.amount || parseFloat(newWithdrawal.amount) <= 0}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Submit Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Withdrawal History</h2>
          <p className="text-gray-400 text-sm mt-1">
            {withdrawals.length} withdrawal requests
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(withdrawal.payment_method)}
                      <span className="ml-2 text-sm text-gray-300">
                        {withdrawal.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(withdrawal.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-400">
                      -{formatCurrency(Math.abs(withdrawal.fee))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-400">
                      {formatCurrency(withdrawal.net_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(withdrawal.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {withdrawal.transaction_id && (
                        <button className="text-blue-400 hover:text-blue-300">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {withdrawals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CreditCard className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No withdrawal requests</h3>
            <p className="text-gray-500">Start by creating your first withdrawal request.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawal; 