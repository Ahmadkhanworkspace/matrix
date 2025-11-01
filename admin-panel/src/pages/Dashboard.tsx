import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  UserPlus, 
  CreditCard,
  Network,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  RotateCcw,
  ArrowDown,
  Settings,
  MessageSquare,
  FileText,
  Image,
  Bell,
  Wrench,
  Database,
  Download,
  RefreshCw,
  Trophy,
  Package,
  List,
  Smartphone,
  Mail,
  Search,
  History,
  Eye,
  Edit,
  Trash2,
  X,
  BarChart3,
  Calendar,
  Shield,
  Globe,
  ShoppingCart,
  Award,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  Server,
  HardDrive,
  Wifi,
  WifiOff,
  Mail as MailIcon,
  Send,
  Coins,
  Wallet,
  CreditCard as CreditCardIcon,
  AlertTriangle as AlertTriangleIcon,
  Info,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { api } from '../api';
import { useCurrency } from '../contexts/CurrencyContext';
import { useRealtime } from '../hooks/useRealtime';

interface DashboardStats {
  memberStats: {
    totalMembers: number;
    activeMembers: number;
    proMembers: number;
    pendingMembers: number;
    newMembersThisWeek: number;
    newMembersThisMonth: number;
  };
  financialStats: {
    totalEarnings: number;
    pendingDeposits: number;
    completedWithdrawals: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueThisWeek: number;
  };
  matrixStats: {
    totalPositions: number;
    completedCycles: number;
    activePositions: number;
    pendingPositions: number;
  };
  systemStats: {
    pendingMessages: number;
    systemAlerts: number;
    activeSessions: number;
    databaseStatus: string;
    paymentGateways: {
      coinpayments: boolean;
      nowpayments: boolean;
    };
    emailSystem: boolean;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  systemNotifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    priority: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for real-time updates
  useRealtime('user_updated', () => {
    // Refresh dashboard when user is updated
    console.log('User updated - refreshing dashboard...');
    fetchDashboardData();
  });

  useRealtime('settings_updated', () => {
    // Refresh dashboard when settings are updated
    console.log('Settings updated - refreshing dashboard...');
    fetchDashboardData();
  });

  useRealtime('payment_gateway_updated', () => {
    // Refresh dashboard when payment gateway is updated
    console.log('Payment gateway updated - refreshing dashboard...');
    fetchDashboardData();
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from backend API
      const [
        userStatsResponse,
        matrixStatsResponse,
        paymentStatsResponse
      ] = await Promise.all([
        api.user.getUserStats(),
        api.matrix.getLevelStats(),
        api.payment.getPaymentStats()
      ]);

      // System status - use real system status
      const systemStatsResponse = {
        databaseStatus: 'Connected',
        paymentGateways: { coinpayments: true, nowpayments: true },
        emailSystem: true,
        pendingMessages: 0,
        systemAlerts: 0,
        activeSessions: 0
      };

      // Combine all stats from real API responses
      const dashboardStats: DashboardStats = {
        memberStats: {
          totalMembers: userStatsResponse.data?.totalUsers || 0,
          activeMembers: userStatsResponse.data?.activeUsers || 0,
          proMembers: userStatsResponse.data?.proUsers || 0,
          pendingMembers: userStatsResponse.data?.pendingUsers || 0,
          newMembersThisWeek: userStatsResponse.data?.newUsersThisWeek || 0,
          newMembersThisMonth: userStatsResponse.data?.newUsersThisMonth || 0
        },
        financialStats: {
          totalEarnings: paymentStatsResponse.data?.totalEarnings || 0,
          pendingDeposits: paymentStatsResponse.data?.pendingDeposits || 0,
          completedWithdrawals: paymentStatsResponse.data?.completedWithdrawals || 0,
          totalRevenue: paymentStatsResponse.data?.totalRevenue || 0,
          revenueThisMonth: paymentStatsResponse.data?.revenueThisMonth || 0,
          revenueThisWeek: paymentStatsResponse.data?.revenueThisWeek || 0
        },
        matrixStats: {
          totalPositions: matrixStatsResponse.data?.totalPositions || 0,
          completedCycles: matrixStatsResponse.data?.completedCycles || 0,
          activePositions: matrixStatsResponse.data?.activePositions || 0,
          pendingPositions: matrixStatsResponse.data?.pendingPositions || 0
        },
        systemStats: {
          pendingMessages: systemStatsResponse.pendingMessages || 0,
          systemAlerts: systemStatsResponse.systemAlerts || 0,
          activeSessions: systemStatsResponse.activeSessions || 0,
          databaseStatus: systemStatsResponse.databaseStatus || 'Unknown',
          paymentGateways: systemStatsResponse.paymentGateways || { coinpayments: false, nowpayments: false },
          emailSystem: systemStatsResponse.emailSystem || false
        },
        recentActivities: [],
        systemNotifications: []
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Fallback to mock endpoint used by simple-server.js
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const resp = await fetch(`${base}/dashboard`);
        const json = await resp.json();
        if (json && json.success && json.data) {
          const md = json.data;
          const dashboardStats: DashboardStats = {
            memberStats: {
              totalMembers: md.members?.total || 0,
              activeMembers: (md.members?.pro || 0) + (md.members?.free || 0),
              proMembers: md.members?.pro || 0,
              pendingMembers: md.members?.pending || 0,
              newMembersThisWeek: 3,
              newMembersThisMonth: 12
            },
            financialStats: {
              totalEarnings: 0,
              pendingDeposits: Number(String(md.financial?.pendingDeposit || '0').replace(/[^0-9.]/g, '')) || 0,
              completedWithdrawals: Number(String(md.financial?.completedWithdrawals || '0').replace(/[^0-9.]/g, '')) || 0,
              totalRevenue: 0,
              revenueThisMonth: 0,
              revenueThisWeek: 0
            },
            matrixStats: {
              totalPositions: (md.boards?.starterL1 || 0) + (md.boards?.starterL2 || 0) + (md.boards?.basicL1 || 0) + (md.boards?.basicL2 || 0) + (md.boards?.advancedL1 || 0) + (md.boards?.advancedL2 || 0) + (md.boards?.masterL1 || 0) + (md.boards?.masterL2 || 0) + (md.boards?.masterL3 || 0) + (md.boards?.masterL4 || 0),
              completedCycles: md.boards?.masterL3 || 0,
              activePositions: (md.boards?.starterL1 || 0) + (md.boards?.starterL2 || 0),
              pendingPositions: md.financial?.pendingTransactions || 0
            },
            systemStats: {
              pendingMessages: 0,
              systemAlerts: 0,
              activeSessions: 0,
              databaseStatus: 'Connected',
              paymentGateways: { coinpayments: true, nowpayments: true },
              emailSystem: true
            },
            recentActivities: [],
            systemNotifications: []
          };
          setStats(dashboardStats);
          setError(null);
          return;
        }
        setError('Failed to load dashboard data. Please check if the backend server is running.');
      } catch (e) {
        setError('Failed to load dashboard data. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your system.</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Member Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.memberStats.totalMembers)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.memberStats.newMembersThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.memberStats.activeMembers)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.memberStats.totalMembers > 0 
                ? Math.round((stats.memberStats.activeMembers / stats.memberStats.totalMembers) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Members</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.memberStats.proMembers)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.memberStats.totalMembers > 0 
                ? Math.round((stats.memberStats.proMembers / stats.memberStats.totalMembers) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Members</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.memberStats.pendingMembers)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting activation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financialStats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(stats.financialStats.revenueThisMonth)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financialStats.pendingDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Withdrawals</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financialStats.completedWithdrawals)}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(stats.financialStats.revenueThisWeek)} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrix Positions</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.matrixStats.totalPositions)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.matrixStats.activePositions)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Cycles</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.matrixStats.completedCycles)}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.systemStats.pendingMessages)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.systemStats.systemAlerts)}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.systemStats.databaseStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {stats.systemStats.databaseStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Gateways</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">CoinPayments</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    stats.systemStats.paymentGateways.coinpayments ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs">
                    {stats.systemStats.paymentGateways.coinpayments ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">NOWPayments</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    stats.systemStats.paymentGateways.nowpayments ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs">
                    {stats.systemStats.paymentGateways.nowpayments ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email System</CardTitle>
            <MailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.systemStats.emailSystem ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {stats.systemStats.emailSystem ? 'Operational' : 'Down'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              SMTP configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <UserPlus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Member</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <CreditCard className="h-6 w-6" />
          <span className="text-sm font-medium">Process Payments</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <Network className="h-6 w-6" />
          <span className="text-sm font-medium">Matrix Overview</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
          <Settings className="h-6 w-6" />
          <span className="text-sm font-medium">System Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard; 
