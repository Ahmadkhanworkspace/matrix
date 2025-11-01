import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { apiService } from '../api/api';
import {
  Grid,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';

interface MatrixPosition {
  id: string;
  matrixId: number;
  level: number;
  position: number;
  status: 'active' | 'pending' | 'completed' | 'expired';
  purchaseDate: string;
  completionDate?: string;
  earnings: number;
  sponsor: string;
  downline: number;
  maxDownline: number;
  progress: number;
}

const ManagePositions: React.FC = () => {
  const [positions, setPositions] = useState<MatrixPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const statusFilter = filter === 'all' ? undefined : filter;
        const response = await apiService.getMatrixPositions(statusFilter);
        
        if (response.success && response.data) {
          const apiPositions: MatrixPosition[] = response.data.map((p: any) => ({
            id: p.id.toString(),
            matrixId: p.matrixId || p.level,
            level: p.level,
            position: p.position || 0,
            status: p.status,
            purchaseDate: p.purchaseDate || p.createdAt,
            completionDate: p.completionDate,
            earnings: typeof p.earnings === 'string' ? parseFloat(p.earnings) : (p.earnings || 0),
            sponsor: p.sponsor,
            downline: p.downline || 0,
            maxDownline: p.maxDownline || 0,
            progress: p.progress || 0
          }));
          setPositions(apiPositions);
        } else {
          setPositions([]);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
      return formatCurrencyUtil(numAmount, 'USD');
    } catch (error) {
      console.error('Currency formatting error:', error);
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
      return `${(numAmount || 0).toFixed(2)} USD`;
    }
  };

  const filteredPositions = positions.filter(position => {
    if (filter === 'all') return true;
    return position.status === filter;
  });

  const totalEarnings = positions.reduce((sum, pos) => sum + pos.earnings, 0);
  const activePositions = positions.filter(pos => pos.status === 'active').length;
  const pendingPositions = positions.filter(pos => pos.status === 'pending').length;
  const completedPositions = positions.filter(pos => pos.status === 'completed').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Positions</h1>
          <p className="text-gray-600">View and manage your matrix positions</p>
        </div>
        <Button>
          <Grid className="h-4 w-4 mr-2" />
          Purchase New Position
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Grid className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">All positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePositions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">From all positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Cycles</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPositions}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({positions.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active ({activePositions})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingPositions})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedPositions})
        </Button>
      </div>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Matrix Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPositions.length === 0 ? (
              <div className="text-center py-8">
                <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
                <p className="text-gray-500">You haven't purchased any matrix positions yet.</p>
              </div>
            ) : (
              filteredPositions.map((position) => (
                <div
                  key={position.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Grid className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            Matrix {position.matrixId} - Level {position.level}
                          </h3>
                          {getStatusBadge(position.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Position {position.position} • Sponsor: {position.sponsor}
                        </div>
                        <div className="text-sm text-gray-500">
                          Purchased: {new Date(position.purchaseDate).toLocaleDateString()}
                          {position.completionDate && (
                            <span> • Completed: {new Date(position.completionDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(position.earnings)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {position.downline}/{position.maxDownline} downline
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{position.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          position.progress >= 90 ? 'bg-green-500' :
                          position.progress >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${position.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {position.status === 'active' && (
                      <Button size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Matrix
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Position distribution chart will be displayed here</p>
                <p className="text-sm">By matrix level and status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Earnings chart will be displayed here</p>
                <p className="text-sm">Earnings by position and time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagePositions; 