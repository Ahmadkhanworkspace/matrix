import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import SocialProof from '../components/SocialProof';
import { useRealtime } from '../hooks/useRealtime';
import { apiService } from '../api/api';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BarChart3,
  CreditCard,
  ShoppingCart,
  Megaphone,
  ArrowRightLeft,
  Globe,
  HelpCircle,
  TrendingDown,
  RotateCcw,
  Star,
  Award,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  LayoutDashboard
} from 'lucide-react';

interface DashboardStats {
  totalEarnings: number;
  accountBalance: number;
  purchaseBalance: number;
  totalPaid: number;
  totalPositions: number;
  totalReferrals: number;
  activeCycles: number;
  completedCycles: number;
  pendingWithdrawals: number;
  recentActivity: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { primaryCurrency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    accountBalance: 0,
    purchaseBalance: 0,
    totalPaid: 0,
    totalPositions: 0,
    totalReferrals: 0,
    activeCycles: 0,
    completedCycles: 0,
    pendingWithdrawals: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user stats from API
        const statsResponse = await apiService.getUserStats();
        
        if (statsResponse.success && statsResponse.data) {
          const data = statsResponse.data;
          setStats({
            // Use API data or fallback to user context data
            accountBalance: data.availableBalance || data.balance || user.balance || 0,
            purchaseBalance: data.purchaseBalance || user.purchase_balance || 0,
            totalEarnings: data.totalEarnings || user.total_earnings || 0,
            totalPaid: data.totalPaid || data.totalWithdrawals || user.total_paid || 0,
            totalPositions: data.matrixPositions || data.totalPositions || user.total_positions || 0,
            totalReferrals: data.totalReferrals || data.activeReferrals || user.total_referrals || 0,
            activeCycles: data.activeCycles || data.pendingCycles || 0,
            completedCycles: data.completedCycles || 0,
            pendingWithdrawals: data.pendingWithdrawals || 0,
            recentActivity: data.recentActivity || []
          });
        } else {
          // Fallback to user context data if API fails
          setStats({
            accountBalance: user.balance || 0,
            purchaseBalance: user.purchase_balance || 0,
            totalEarnings: user.total_earnings || 0,
            totalPaid: user.total_paid || 0,
            totalPositions: user.total_positions || 0,
            totalReferrals: user.total_referrals || 0,
            activeCycles: 0,
            completedCycles: 0,
            pendingWithdrawals: 0,
            recentActivity: []
          });
        }

        // Try to fetch recent activity separately
        try {
          const transactionsResponse = await apiService.getTransactions({ limit: 5 });
          if (transactionsResponse.success && transactionsResponse.data) {
            const activities = (transactionsResponse.data.transactions || transactionsResponse.data || []).map((tx: any, index: number) => ({
              id: tx.id || index,
              type: tx.type?.toLowerCase() || 'transaction',
              amount: parseFloat(tx.amount || 0),
              description: tx.description || tx.type || 'Transaction',
              date: tx.createdAt || tx.date || new Date().toISOString(),
              status: tx.status?.toLowerCase() || 'completed'
            }));
            setStats(prev => ({
              ...prev,
              recentActivity: activities
            }));
          }
        } catch (error) {
          console.log('Could not fetch recent activity:', error);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to user context data
        setStats({
          accountBalance: user.balance || 0,
          purchaseBalance: user.purchase_balance || 0,
          totalEarnings: user.total_earnings || 0,
          totalPaid: user.total_paid || 0,
          totalPositions: user.total_positions || 0,
          totalReferrals: user.total_referrals || 0,
          activeCycles: 0,
          completedCycles: 0,
          pendingWithdrawals: 0,
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cycle_completion':
        return <RotateCcw className="h-5 w-5 text-green-500" />;
      case 'referral_bonus':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'withdrawal':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Listen for real-time updates
  useRealtime('settings_updated', () => {
    // Refresh dashboard data when settings are updated
    // This will automatically refresh user-specific data
    console.log('Settings updated - refreshing dashboard...');
  });

  useRealtime('profile_updated', (data: any) => {
    // Update user profile in real-time
    if (data && data.id === user?.id) {
      console.log('Profile updated - refreshing dashboard...');
    }
  });

  if (loading) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.status === 'pro' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {user?.status === 'pro' ? 'Pro Member' : 'Free Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Account Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.accountBalance)}
              </p>
              <p className="text-green-600 text-sm mt-1">Available for withdrawal</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Purchase Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.purchaseBalance)}
              </p>
              <p className="text-blue-600 text-sm mt-1">Ready for positions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="text-yellow-600 text-sm mt-1">Lifetime earnings</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalPaid)}
              </p>
              <p className="text-green-600 text-sm mt-1">Successfully withdrawn</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/purchase-position"
            style={{ textDecoration: 'none', display: 'block' }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 no-underline"
          >
            <ShoppingCart className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Purchase Position</h3>
            <p className="text-blue-200 text-sm">Join new matrix</p>
          </Link>

          <Link
            to="/withdrawal"
            style={{ textDecoration: 'none', display: 'block' }}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 no-underline"
          >
            <CreditCard className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Withdraw</h3>
            <p className="text-green-200 text-sm">Cash out earnings</p>
          </Link>

          <Link
            to="/promo-tools"
            style={{ textDecoration: 'none', display: 'block' }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 no-underline"
          >
            <Megaphone className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Promo Tools</h3>
            <p className="text-purple-200 text-sm">Marketing materials</p>
          </Link>

          <Link
            to="/transfer-funds"
            style={{ textDecoration: 'none', display: 'block' }}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 no-underline"
          >
            <ArrowRightLeft className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Transfer Funds</h3>
            <p className="text-orange-200 text-sm">Move between wallets</p>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700">Total Referrals</span>
              </div>
              <span className="text-gray-900 font-semibold">{stats.totalReferrals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">Total Positions</span>
              </div>
              <span className="text-gray-900 font-semibold">{stats.totalPositions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RotateCcw className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-700">Active Cycles</span>
              </div>
              <span className="text-gray-900 font-semibold">{stats.activeCycles}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-gray-700">Completed Cycles</span>
              </div>
              <span className="text-gray-900 font-semibold">{stats.completedCycles}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  {getActivityIcon(activity.type)}
                  <div className="ml-3">
                    <p className="text-gray-900 text-sm font-medium">{activity.description}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    activity.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount))}
                  </p>
                  <p className={`text-xs ${getStatusColor(activity.status).replace('text-green-500', 'text-green-600').replace('text-yellow-500', 'text-yellow-600').replace('text-red-500', 'text-red-600').replace('text-gray-500', 'text-gray-600')}`}>
                    {activity.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Proof Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Navigation Cards */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                to="/wallet"
                style={{ textDecoration: 'none', display: 'block' }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-center transition-all no-underline"
              >
                <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-medium text-sm">View Wallet</h3>
                <p className="text-gray-600 text-xs">Check statistics</p>
              </Link>

              <Link
                to="/manage-positions"
                style={{ textDecoration: 'none', display: 'block' }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl p-4 text-center transition-all no-underline"
              >
                <Settings className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-medium text-sm">Manage Positions</h3>
                <p className="text-gray-600 text-xs">Track performance</p>
              </Link>

              <Link
                to="/global-pif"
                style={{ textDecoration: 'none', display: 'block' }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-purple-300 rounded-xl p-4 text-center transition-all no-underline"
              >
                <Globe className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-medium text-sm">Global PIF</h3>
                <p className="text-gray-600 text-xs">Global fund</p>
              </Link>

              <Link
                to="/support"
                style={{ textDecoration: 'none', display: 'block' }}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-orange-300 rounded-xl p-4 text-center transition-all no-underline"
              >
                <HelpCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-medium text-sm">Support</h3>
                <p className="text-gray-600 text-xs">Get help</p>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <SocialProof />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 