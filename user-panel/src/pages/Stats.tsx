import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { apiService } from '../api/api';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';

interface StatsData {
  totalEarnings: number;
  totalWithdrawals: number;
  availableBalance: number;
  totalReferrals: number;
  activeReferrals: number;
  matrixPositions: number;
  completedCycles: number;
  pendingCycles: number;
  totalBonuses: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  earningsGrowth: number;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalEarnings: 0,
    totalWithdrawals: 0,
    availableBalance: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    matrixPositions: 0,
    completedCycles: 0,
    pendingCycles: 0,
    totalBonuses: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    earningsGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserStats();
        
        if (response.success && response.data) {
          setStats({
            totalEarnings: response.data.totalEarnings || 0,
            totalWithdrawals: response.data.totalWithdrawals || 0,
            availableBalance: response.data.availableBalance || 0,
            totalReferrals: response.data.totalReferrals || 0,
            activeReferrals: response.data.activeReferrals || 0,
            matrixPositions: response.data.matrixPositions || 0,
            completedCycles: response.data.completedCycles || 0,
            pendingCycles: response.data.pendingCycles || 0,
            totalBonuses: response.data.totalBonuses || 0,
            thisMonthEarnings: response.data.thisMonthEarnings || 0,
            lastMonthEarnings: response.data.lastMonthEarnings || 0,
            earningsGrowth: response.data.earningsGrowth || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number | string | null | undefined) => {
    try {
      if (amount === null || amount === undefined) {
        return '0.00 USD';
      }
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) {
        return '0.00 USD';
      }
      return formatCurrencyUtil(numAmount, 'USD');
    } catch (error) {
      console.error('Currency formatting error:', error);
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
      return `${(numAmount || 0).toFixed(2)} USD`;
    }
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600">Your comprehensive performance overview</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Activity className="h-4 w-4 mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{formatPercentage(stats.earningsGrowth)}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.availableBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalWithdrawals)}</div>
            <p className="text-xs text-muted-foreground">
              Total withdrawn amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral & Matrix Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeReferrals} active referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matrix Positions</CardTitle>
            <PieChart className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matrixPositions}</div>
            <p className="text-xs text-muted-foreground">
              Active positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Cycles</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCycles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCycles} pending cycles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBonuses)}</div>
            <p className="text-xs text-muted-foreground">
              All time bonuses earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Earnings chart will be displayed here</p>
                <p className="text-sm">Monthly earnings visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Referral chart will be displayed here</p>
                <p className="text-sm">Referral level distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((stats.activeReferrals / stats.totalReferrals) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Referral Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((stats.completedCycles / (stats.completedCycles + stats.pendingCycles)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Cycle Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalEarnings / Math.max(stats.totalReferrals, 1))}
              </div>
              <div className="text-sm text-gray-600">Average Earnings per Referral</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats; 