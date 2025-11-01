import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { apiService } from '../api/api';
import { 
  Globe, 
  Heart, 
  TrendingUp, 
  Users,
  DollarSign,
  Award,
  Gift,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';

interface PIFContribution {
  id: string;
  username: string;
  amount: number;
  type: 'donation' | 'bonus' | 'reward';
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface PIFStats {
  totalContributions: number;
  totalAmount: number;
  activeUsers: number;
  thisMonthContributions: number;
  thisMonthAmount: number;
  topContributor: string;
  topAmount: number;
  averageContribution: number;
  goalAmount: number;
  goalProgress: number;
}

const GlobalPIF: React.FC = () => {
  const [stats, setStats] = useState<PIFStats>({
    totalContributions: 0,
    totalAmount: 0,
    activeUsers: 0,
    thisMonthContributions: 0,
    thisMonthAmount: 0,
    topContributor: '',
    topAmount: 0,
    averageContribution: 0,
    goalAmount: 100000,
    goalProgress: 0
  });
  const [contributions, setContributions] = useState<PIFContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPIFData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats and contributions in parallel
        const [statsResponse, contributionsResponse] = await Promise.all([
          apiService.getGlobalPIFStats(),
          apiService.getGlobalPIFContributions({ page: 1, limit: 50 })
        ]);
        
        if (statsResponse.success && statsResponse.data) {
          setStats({
            totalContributions: statsResponse.data.totalContributions || 0,
            totalAmount: statsResponse.data.totalAmount || 0,
            activeUsers: statsResponse.data.activeUsers || 0,
            thisMonthContributions: statsResponse.data.thisMonthContributions || 0,
            thisMonthAmount: statsResponse.data.thisMonthAmount || 0,
            topContributor: statsResponse.data.topContributor || '',
            topAmount: statsResponse.data.topAmount || 0,
            averageContribution: statsResponse.data.averageContribution || 0,
            goalAmount: statsResponse.data.goalAmount || 100000,
            goalProgress: statsResponse.data.goalProgress || 0
          });
        }
        
        if (contributionsResponse.success && contributionsResponse.data) {
          const apiContributions: PIFContribution[] = contributionsResponse.data.map((c: any) => ({
            id: c.id.toString(),
            username: c.username,
            amount: typeof c.amount === 'string' ? parseFloat(c.amount) : (c.amount || 0),
            type: 'donation', // Default type
            date: c.date || new Date().toISOString(),
            description: 'Global PIF contribution',
            status: c.status || 'completed'
          }));
          setContributions(apiContributions);
        }
      } catch (error) {
        console.error('Error fetching PIF data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPIFData();
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'donation':
        return <Badge className="bg-blue-100 text-blue-800">Donation</Badge>;
      case 'bonus':
        return <Badge className="bg-green-100 text-green-800">Bonus</Badge>;
      case 'reward':
        return <Badge className="bg-purple-100 text-purple-800">Reward</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Global PIF</h1>
          <p className="text-gray-600">Pay It Forward - Global Community Fund</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Heart className="h-4 w-4 mr-2" />
          Contribute Now
        </Button>
      </div>

      {/* Goal Progress */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Community Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</span>
              <span className="text-lg">of {formatCurrency(stats.goalAmount)}</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.goalProgress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold">{stats.goalProgress}% Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContributions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonthContributions} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.thisMonthAmount)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Community members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Contribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageContribution)}</div>
            <p className="text-xs text-muted-foreground">
              Per contribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Top Contributor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{stats.topContributor}</h3>
                <p className="text-sm text-gray-500">Top contributor this month</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.topAmount)}
              </div>
              <p className="text-sm text-gray-500">Total contributed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributions.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions yet</h3>
                <p className="text-gray-500">Be the first to contribute to the community fund!</p>
              </div>
            ) : (
              contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Gift className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {contribution.username}
                          </h3>
                          {getTypeBadge(contribution.type)}
                          {getStatusBadge(contribution.status)}
                        </div>
                        <p className="text-sm text-gray-500">{contribution.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(contribution.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(contribution.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contribution Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Contribution trends chart will be displayed here</p>
                <p className="text-sm">Monthly contribution patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Contribution types chart will be displayed here</p>
                <p className="text-sm">Distribution by contribution type</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How PIF Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Contribute</h3>
              <p className="text-sm text-gray-600">
                Members contribute to the global fund through donations, bonuses, or rewards
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Distribute</h3>
              <p className="text-sm text-gray-600">
                Funds are distributed to community members in need or for special projects
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Grow</h3>
              <p className="text-sm text-gray-600">
                The community grows stronger as members support each other
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalPIF; 