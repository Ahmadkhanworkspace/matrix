import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Grid,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { apiService } from '../api/api';
import { toast } from 'react-hot-toast';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';

interface MatrixLevel {
  id: number;
  name: string;
  price: number;
  maxPositions: number;
  availablePositions: number;
  description: string;
  benefits: string[];
  estimatedEarnings: number;
  completionTime: string;
}

const PurchasePosition: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [matrixLevels, setMatrixLevels] = useState<MatrixLevel[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    loadMatrixLevels();
    loadUserBalance();
  }, []);

  const loadMatrixLevels = async () => {
    try {
      setLoadingLevels(true);
      const response = await apiService.getMatrixLevels();
      if (response.success) {
        const levels = response.data?.levels || response.data || [];
        setMatrixLevels(levels.map((level: any) => ({
          id: level.level || level.id,
          name: level.name || `Level ${level.level}`,
          price: level.price || 0,
          maxPositions: Math.pow(level.matrixWidth || 2, level.matrixDepth || 8),
          availablePositions: Math.pow(level.matrixWidth || 2, level.matrixDepth || 8) - (level.positionsFilled || 0),
          description: level.description || `Matrix level ${level.level} with ${level.matrixWidth}x${level.matrixDepth} structure`,
          benefits: [
            `${level.matrixWidth || 2}x${level.matrixDepth || 8} matrix structure`,
            `${level.referralBonus || 0}% referral bonus`,
            `${level.matrixBonus || 0}% matrix bonus`,
            'Multiple completion cycles'
          ],
          estimatedEarnings: (level.price || 0) * 3,
          completionTime: '4-8 weeks'
        })));
      }
    } catch (error: any) {
      console.error('Failed to load matrix levels:', error);
      // Fallback to default levels
      setMatrixLevels([
        {
          id: 1,
          name: 'Level 1',
          price: 100,
          maxPositions: 3,
          availablePositions: 2,
          description: 'Entry level matrix position',
          benefits: ['3x3 matrix structure', 'Quick completion', 'Immediate earnings'],
          estimatedEarnings: 300,
          completionTime: '2-4 weeks'
        }
      ]);
    } finally {
      setLoadingLevels(false);
    }
  };

  const loadUserBalance = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success) {
        const user = response.data?.user || response.data;
        setBalance(user?.totalEarnings || user?.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const matrices = [
    { id: 1, name: 'Matrix Alpha', description: 'Primary matrix system' },
    { id: 2, name: 'Matrix Beta', description: 'Secondary matrix system' },
    { id: 3, name: 'Matrix Gamma', description: 'Premium matrix system' }
  ];

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

  const handlePurchase = async () => {
    if (!selectedLevel) {
      toast.error('Please select a matrix level');
      return;
    }

    const selectedLevelData = matrixLevels.find(level => level.id === selectedLevel);
    if (!selectedLevelData) {
      toast.error('Invalid matrix level selected');
      return;
    }

    if (balance < selectedLevelData.price) {
      toast.error('Insufficient balance. Please deposit funds first.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.purchasePosition({
        matrixLevel: selectedLevel,
        entryType: 1
      });

      if (response.success) {
        toast.success('Matrix position purchase initiated! Your position will be processed shortly.');
        setSelectedLevel(null);
        loadUserBalance(); // Refresh balance
      } else {
        toast.error(response.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedLevelData = selectedLevel ? matrixLevels.find(level => level.id === selectedLevel) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Position</h1>
          <p className="text-gray-600">Buy new matrix positions to grow your earnings</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">Ready for purchase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Positions</CardTitle>
            <Grid className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(1250.00)}</div>
            <p className="text-xs text-muted-foreground">From positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matrix Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matrices.map((matrix) => (
                <div
                  key={matrix.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedMatrix === matrix.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMatrix(matrix.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{matrix.name}</h3>
                      <p className="text-sm text-gray-500">{matrix.description}</p>
                    </div>
                    {selectedMatrix === matrix.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Level Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Level</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLevels ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading matrix levels...</p>
              </div>
            ) : matrixLevels.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No matrix levels available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matrixLevels.map((level) => (
                <div
                  key={level.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedLevel === level.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{level.name}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatCurrency(level.price)}</div>
                      <div className="text-sm text-gray-500">{level.availablePositions} available</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Est. Earnings:</span>
                    <span className="font-medium text-green-600">{formatCurrency(level.estimatedEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Completion:</span>
                    <span className="font-medium text-blue-600">{level.completionTime}</span>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLevelData ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Position</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Matrix:</span>
                      <span>{matrices.find(m => m.id === selectedMatrix)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span>{selectedLevelData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">{formatCurrency(selectedLevelData.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Benefits</h4>
                  {selectedLevelData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(selectedLevelData.price)}</span>
                  </div>
                  <Button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Purchase Position
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Level</h3>
                <p className="text-gray-500">Choose a matrix level to see purchase details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Matrix Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Matrix Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">How It Works</h3>
              <p className="text-sm text-gray-600">
                Matrix positions fill up automatically as new members join. When a level is complete, you earn bonuses and can cycle to the next level.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Earning Potential</h3>
              <p className="text-sm text-gray-600">
                Each completed matrix level provides earnings based on the level structure. Higher levels offer greater earning potential.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Team Building</h3>
              <p className="text-sm text-gray-600">
                Matrix positions help you build a team and earn from your downline's activities and matrix completions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <AlertCircle className="h-5 w-5 mr-2" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <div>• Matrix positions are non-refundable once purchased</div>
            <div>• Positions fill automatically as new members join</div>
            <div>• Completion time varies based on member activity</div>
            <div>• Earnings are paid upon matrix completion</div>
            <div>• You can purchase multiple positions in different levels</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasePosition; 