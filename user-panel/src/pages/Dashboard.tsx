import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
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
    totalEarnings: 5000.00,
    accountBalance: 1250.50,
    purchaseBalance: 500.00,
    totalPaid: 2500.00,
    totalPositions: 8,
    totalReferrals: 12,
    activeCycles: 3,
    completedCycles: 15,
    pendingWithdrawals: 750.00,
    recentActivity: [
      {
        id: 1,
        type: 'cycle_completion',
        amount: 250.00,
        description: 'Matrix 1 Level 3 cycle completed',
        date: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 2,
        type: 'referral_bonus',
        amount: 50.00,
        description: 'Referral bonus from new member',
        date: '2024-01-14T15:45:00Z',
        status: 'completed'
      },
      {
        id: 3,
        type: 'withdrawal',
        amount: -500.00,
        description: 'Withdrawal request submitted',
        date: '2024-01-13T08:15:00Z',
        status: 'pending'
      }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.status === 'pro' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' 
                : 'bg-gray-600 text-white'
            }`}>
              {user?.status === 'pro' ? 'Pro Member' : 'Free Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Account Balance</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.accountBalance)}
              </p>
              <p className="text-green-400 text-sm mt-1">Available for withdrawal</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Purchase Balance</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.purchaseBalance)}
              </p>
              <p className="text-blue-400 text-sm mt-1">Ready for positions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="text-yellow-400 text-sm mt-1">Lifetime earnings</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.totalPaid)}
              </p>
              <p className="text-green-400 text-sm mt-1">Successfully withdrawn</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/purchase-position"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105"
          >
            <ShoppingCart className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Purchase Position</h3>
            <p className="text-blue-200 text-sm">Join new matrix</p>
          </Link>

          <Link
            to="/withdrawal"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105"
          >
            <CreditCard className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Withdraw</h3>
            <p className="text-green-200 text-sm">Cash out earnings</p>
          </Link>

          <Link
            to="/promo-tools"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105"
          >
            <Megaphone className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Promo Tools</h3>
            <p className="text-purple-200 text-sm">Marketing materials</p>
          </Link>

          <Link
            to="/transfer-funds"
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRightLeft className="h-8 w-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold">Transfer Funds</h3>
            <p className="text-orange-200 text-sm">Move between wallets</p>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Account Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Total Referrals</span>
              </div>
              <span className="text-white font-semibold">{stats.totalReferrals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-green-400 mr-3" />
                <span className="text-gray-300">Total Positions</span>
              </div>
              <span className="text-white font-semibold">{stats.totalPositions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RotateCcw className="h-5 w-5 text-purple-400 mr-3" />
                <span className="text-gray-300">Active Cycles</span>
              </div>
              <span className="text-white font-semibold">{stats.activeCycles}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Completed Cycles</span>
              </div>
              <span className="text-white font-semibold">{stats.completedCycles}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  {getActivityIcon(activity.type)}
                  <div className="ml-3">
                    <p className="text-white text-sm font-medium">{activity.description}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    activity.amount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.amount >= 0 ? '+' : ''}{formatCurrency(activity.amount)}
                  </p>
                  <p className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Dashboard Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            to="/wallet"
            className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">View Wallet</h3>
            <p className="text-gray-400 text-xs">Check statistics</p>
          </Link>

          <Link
            to="/manage-positions"
            className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center transition-colors"
          >
            <Settings className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">Manage Positions</h3>
            <p className="text-gray-400 text-xs">Track performance</p>
          </Link>

          <Link
            to="/global-pif"
            className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center transition-colors"
          >
            <Globe className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">Global PIF</h3>
            <p className="text-gray-400 text-xs">Global fund</p>
          </Link>

          <Link
            to="/support"
            className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center transition-colors"
          >
            <HelpCircle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">Support</h3>
            <p className="text-gray-400 text-xs">Get help</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 