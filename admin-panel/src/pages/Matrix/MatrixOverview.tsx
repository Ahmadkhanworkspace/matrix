import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Network, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Activity,
  Target,
  RotateCcw,
  Zap,
  Star,
  Crown,
  Award
} from 'lucide-react';
import { api } from '../../api';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixStats {
  totalMatrices: number;
  activeMatrices: number;
  totalPositions: number;
  filledPositions: number;
  pendingPositions: number;
  totalCycles: number;
  activeCycles: number;
  completedCycles: number;
  totalEarnings: number;
  averageCycleTime: number;
  spilloverCount: number;
  reentryCount: number;
}

interface MatrixLevel {
  id: number;
  name: string;
  positions: number;
  filled: number;
  pending: number;
  earnings: number;
  cycleCount: number;
}

const MatrixOverview: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [stats, setStats] = useState<MatrixStats>({
    totalMatrices: 0,
    activeMatrices: 0,
    totalPositions: 0,
    filledPositions: 0,
    pendingPositions: 0,
    totalCycles: 0,
    activeCycles: 0,
    completedCycles: 0,
    totalEarnings: 0,
    averageCycleTime: 0,
    spilloverCount: 0,
    reentryCount: 0
  });
  const [matrixLevels, setMatrixLevels] = useState<MatrixLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatrix, setSelectedMatrix] = useState<number | null>(null);

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      const [statsResponse, levelsResponse] = await Promise.all([
        api.matrix.getMatrixStats(1), // Default to matrix ID 1
        api.matrix.getLevelStats()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (levelsResponse.success) {
        setMatrixLevels(levelsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getFillPercentage = (filled: number, total: number) => {
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading matrix data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrix Overview</h1>
          <p className="text-gray-600">Monitor and manage matrix performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchMatrixData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Matrix
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Matrices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMatrices}</p>
                <p className="text-xs text-gray-500">of {stats.totalMatrices} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Filled Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.filledPositions}</p>
                <p className="text-xs text-gray-500">of {stats.totalPositions} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Cycles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCycles}</p>
                <p className="text-xs text-gray-500">{stats.completedCycles} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Matrix Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Fill Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {getFillPercentage(stats.filledPositions, stats.totalPositions)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatusColor(getFillPercentage(stats.filledPositions, stats.totalPositions))}`}
                  style={{ width: `${getFillPercentage(stats.filledPositions, stats.totalPositions)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cycle Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalCycles > 0 ? Math.round((stats.completedCycles / stats.totalCycles) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${stats.totalCycles > 0 ? (stats.completedCycles / stats.totalCycles) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Average Cycle Time</span>
                <span className="text-sm font-bold text-gray-900">{stats.averageCycleTime} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cycle Completed</p>
                    <p className="text-xs text-gray-500">Matrix 1 Level 3</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 min ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Position Filled</p>
                    <p className="text-xs text-gray-500">Matrix 2 Level 1</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">5 min ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Spillover Detected</p>
                    <p className="text-xs text-gray-500">Matrix 1 Level 2</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">10 min ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <RotateCcw className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Re-entry Processed</p>
                    <p className="text-xs text-gray-500">Matrix 3 Level 1</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">15 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrix Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Matrix Levels Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Positions</th>
                  <th className="text-left py-3 px-4">Filled</th>
                  <th className="text-left py-3 px-4">Pending</th>
                  <th className="text-left py-3 px-4">Fill Rate</th>
                  <th className="text-left py-3 px-4">Earnings</th>
                  <th className="text-left py-3 px-4">Cycles</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matrixLevels.map((level) => (
                  <tr key={level.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{level.id}</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{level.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{level.positions}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-green-600">{level.filled}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-yellow-600">{level.pending}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(getFillPercentage(level.filled, level.positions))}`}
                            style={{ width: `${getFillPercentage(level.filled, level.positions)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {getFillPercentage(level.filled, level.positions)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-green-600">
                        {formatCurrency(level.earnings)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <RotateCcw className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{level.cycleCount}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Process Spillover</h3>
              <p className="text-sm text-gray-500 mb-4">Handle pending spillover entries</p>
              <Button className="w-full">
                Process Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Process Re-entries</h3>
              <p className="text-sm text-gray-500 mb-4">Handle cycle completion re-entries</p>
              <Button className="w-full">
                Process Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Matrix Settings</h3>
              <p className="text-sm text-gray-500 mb-4">Configure matrix parameters</p>
              <Button className="w-full">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatrixOverview; 
