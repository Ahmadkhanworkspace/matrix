import React, { useState } from 'react';
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

  const matrixLevels: MatrixLevel[] = [
    {
      id: 1,
      name: 'Level 1',
      price: 100,
      maxPositions: 3,
      availablePositions: 2,
      description: 'Entry level matrix position with 3x3 structure',
      benefits: [
        '3x3 matrix structure',
        'Quick completion potential',
        'Immediate earnings start',
        'Low risk, high reward'
      ],
      estimatedEarnings: 300,
      completionTime: '2-4 weeks'
    },
    {
      id: 2,
      name: 'Level 2',
      price: 250,
      maxPositions: 9,
      availablePositions: 5,
      description: 'Advanced matrix position with 9x9 structure',
      benefits: [
        '9x9 matrix structure',
        'Higher earning potential',
        'Multiple completion cycles',
        'Leadership opportunities'
      ],
      estimatedEarnings: 750,
      completionTime: '4-8 weeks'
    },
    {
      id: 3,
      name: 'Level 3',
      price: 500,
      maxPositions: 27,
      availablePositions: 8,
      description: 'Premium matrix position with 27x27 structure',
      benefits: [
        '27x27 matrix structure',
        'Maximum earning potential',
        'Multiple completion cycles',
        'VIP member benefits'
      ],
      estimatedEarnings: 1500,
      completionTime: '8-12 weeks'
    }
  ];

  const matrices = [
    { id: 1, name: 'Matrix Alpha', description: 'Primary matrix system' },
    { id: 2, name: 'Matrix Beta', description: 'Secondary matrix system' },
    { id: 3, name: 'Matrix Gamma', description: 'Premium matrix system' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePurchase = async () => {
    if (!selectedLevel) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful purchase
      alert('Position purchased successfully!');
      setSelectedLevel(null);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
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
            <div className="text-2xl font-bold">{formatCurrency(2500.00)}</div>
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