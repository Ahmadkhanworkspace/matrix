import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiService } from '../api/api';
import toast from 'react-hot-toast';
import {
  Layers,
  ArrowLeftRight,
  Shield,
  Copy,
  BarChart3,
  TrendingUp,
  DollarSign,
  Zap,
  Filter
} from 'lucide-react';

interface MatrixType {
  id: string;
  name: string;
  structure: any;
  description: string;
}

interface Position {
  id: string;
  level: number;
  position: number;
  status: string;
  totalEarned: number;
  cycleCount: number;
}

interface Analytics {
  summary: {
    totalPositions: number;
    activePositions: number;
    completedPositions: number;
    totalEarnings: number;
    averageCycleTime: number;
  };
  levelDistribution: { [key: number]: number };
  fillRateByLevel: { [key: number]: number };
  recentPositions: Position[];
}

const AdvancedMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [matrixTypes, setMatrixTypes] = useState<MatrixType[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [swapOptions, setSwapOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesResponse, analyticsResponse] = await Promise.all([
        apiService.getMatrixTypes(),
        apiService.getAdvancedMatrixAnalytics()
      ]);

      if (typesResponse.success) {
        setMatrixTypes(typesResponse.data || []);
      }
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSwapOptions = async (positionId: string) => {
    try {
      const response = await apiService.getSwapOptions(positionId);
      if (response.success) {
        setSwapOptions(response.data.swapOptions || []);
        setSelectedPosition(response.data.currentPosition);
        setActiveTab('swap');
      }
    } catch (error) {
      toast.error('Failed to load swap options');
    }
  };

  const handleSwapPositions = async (targetPositionId: string) => {
    if (!selectedPosition) return;
    
    if (!window.confirm('Are you sure you want to swap these positions? This action cannot be undone.')) return;

    try {
      const response = await apiService.swapPositions(selectedPosition.id, targetPositionId);
      if (response.success) {
        toast.success('Positions swapped successfully');
        setSelectedPosition(null);
        setSwapOptions([]);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to swap positions');
    }
  };

  const handlePurchaseInsurance = async (positionId: string) => {
    const premium = prompt('Enter insurance premium amount:');
    const coverage = prompt('Enter coverage amount:');
    
    if (!premium || !coverage) return;

    try {
      const response = await apiService.purchaseInsurance(positionId, {
        premium: parseFloat(premium),
        coverage: parseFloat(coverage),
        expiryDays: 365
      });
      if (response.success) {
        toast.success('Insurance purchased successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to purchase insurance');
    }
  };

  const handleClonePosition = async (positionId: string) => {
    if (!window.confirm('Clone this position? A new position will be created.')) return;

    try {
      const response = await apiService.clonePosition(positionId);
      if (response.success) {
        toast.success('Position cloned successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to clone position');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Matrix</h1>
          <p className="text-gray-600">Advanced matrix features and analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="swap">Position Swap</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Matrix Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matrixTypes.length === 0 ? (
                  <p className="text-gray-500">No matrix types available</p>
                ) : (
                  <div className="space-y-2">
                    {matrixTypes.map((type) => (
                      <div key={type.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{type.name}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                          <Badge variant="outline">{type.id}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setActiveTab('swap')}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Swap Positions
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setActiveTab('insurance')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Purchase Insurance
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Position Swap Tab */}
        <TabsContent value="swap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Swapping</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPosition ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Current Position</h3>
                    <div className="text-sm text-gray-600">
                      <p>Level: {selectedPosition.level}</p>
                      <p>Status: {selectedPosition.status}</p>
                    </div>
                  </div>
                  {swapOptions.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Available Positions for Swap</h3>
                      <div className="space-y-2">
                        {swapOptions.map((option) => (
                          <div
                            key={option.id}
                            className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{option.user?.username || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">Level {option.level} • Status: {option.status}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSwapPositions(option.id)}
                            >
                              Swap
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No swap options available. Select a position first.</p>
                  )}
                  <Button variant="outline" onClick={() => { setSelectedPosition(null); setSwapOptions([]); }}>
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowLeftRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Select a position to view swap options</p>
                  <p className="text-sm text-gray-400">
                    Go to Manage Positions to select a position for swapping
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Position Insurance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">💡 Insurance Protection</h3>
                  <p className="text-sm text-gray-700">
                    Protect your matrix positions with insurance. If your position fails or is lost, 
                    insurance coverage will compensate you according to your coverage plan.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">How It Works</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Select a position from your positions list</li>
                    <li>Choose premium and coverage amount</li>
                    <li>Insurance is valid for 365 days</li>
                    <li>Claim compensation if position is lost</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    const positionId = prompt('Enter position ID to insure:');
                    if (positionId) handlePurchaseInsurance(positionId);
                  }}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Purchase Insurance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
                    <Layers className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.totalPositions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                    <Zap className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.activePositions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${analytics.summary.totalEarnings.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Cycle Time</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.summary.averageCycleTime.toFixed(1)} days
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.levelDistribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-gray-600">Level {level}</span>
                        <div className="flex items-center space-x-2 flex-1 mx-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count as number / analytics.summary.totalPositions) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="font-medium w-12 text-right">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {analytics.recentPositions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.recentPositions.map((position) => (
                        <div
                          key={position.id}
                          className="border rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">Level {position.level}</p>
                            <p className="text-sm text-gray-600">
                              {position.cycleCount} cycles • ${parseFloat(position.totalEarned.toString()).toFixed(2)} earned
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGetSwapOptions(position.id)}
                            >
                              Swap
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClonePosition(position.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No analytics data available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMatrix;

