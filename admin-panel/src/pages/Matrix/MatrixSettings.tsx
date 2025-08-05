import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Network, 
  Users,
  DollarSign,
  RotateCcw,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixConfig {
  id: number;
  name: string;
  levels: number;
  width: number;
  fee: number;
  matrix_type: 'forced' | 'unilevel' | 'binary';
  payout_type: 'level' | 'cycle' | 'hybrid';
  spillover_enabled: boolean;
  reentry_enabled: boolean;
  email_notifications: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  total_positions: number;
  filled_positions: number;
  total_earnings: number;
  cycle_count: number;
}

const MatrixSettings: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [matrices, setMatrices] = useState<MatrixConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<MatrixConfig | null>(null);
  const [newMatrix, setNewMatrix] = useState({
    name: '',
    levels: 3,
    width: 3,
    fee: 100,
    matrix_type: 'forced' as const,
    payout_type: 'level' as const,
    spillover_enabled: true,
    reentry_enabled: true,
    email_notifications: true
  });

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      setLoading(true);
      // Fetch matrices from backend
      // const response = await api.matrix.getAllMatrixConfigs();
      // if (response.success) {
      //   setMatrices(response.data);
      // }
      
      // Mock data for now
      setMatrices([
        {
          id: 1,
          name: 'Matrix 1',
          levels: 3,
          width: 3,
          fee: 100,
          matrix_type: 'forced',
          payout_type: 'level',
          spillover_enabled: true,
          reentry_enabled: true,
          email_notifications: true,
          status: 'active',
          created_at: '2024-01-01',
          total_positions: 39,
          filled_positions: 25,
          total_earnings: 2500,
          cycle_count: 8
        },
        {
          id: 2,
          name: 'Matrix 2',
          levels: 4,
          width: 4,
          fee: 200,
          matrix_type: 'forced',
          payout_type: 'cycle',
          spillover_enabled: true,
          reentry_enabled: false,
          email_notifications: true,
          status: 'active',
          created_at: '2024-01-15',
          total_positions: 85,
          filled_positions: 45,
          total_earnings: 4500,
          cycle_count: 12
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch matrices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatrix = async () => {
    try {
      // Create matrix in backend
      // const response = await api.matrix.createMatrixConfig(newMatrix);
      // if (response.success) {
      //   fetchMatrices();
      //   setShowCreateModal(false);
      //   setNewMatrix({
      //     name: '',
      //     levels: 3,
      //     width: 3,
      //     fee: 100,
      //     matrix_type: 'forced',
      //     payout_type: 'level',
      //     spillover_enabled: true,
      //     reentry_enabled: true,
      //     email_notifications: true
      //   });
      // }
      
      // Mock creation
      const newMatrixConfig: MatrixConfig = {
        id: Date.now(),
        name: newMatrix.name,
        levels: newMatrix.levels,
        width: newMatrix.width,
        fee: newMatrix.fee,
        matrix_type: newMatrix.matrix_type,
        payout_type: newMatrix.payout_type,
        spillover_enabled: newMatrix.spillover_enabled,
        reentry_enabled: newMatrix.reentry_enabled,
        email_notifications: newMatrix.email_notifications,
        status: 'active',
        created_at: new Date().toISOString(),
        total_positions: Math.pow(newMatrix.width, newMatrix.levels),
        filled_positions: 0,
        total_earnings: 0,
        cycle_count: 0
      };
      
      setMatrices(prev => [...prev, newMatrixConfig]);
      setShowCreateModal(false);
      setNewMatrix({
        name: '',
        levels: 3,
        width: 3,
        fee: 100,
        matrix_type: 'forced',
        payout_type: 'level',
        spillover_enabled: true,
        reentry_enabled: true,
        email_notifications: true
      });
    } catch (error) {
      console.error('Failed to create matrix:', error);
    }
  };

  const handleUpdateMatrix = async (matrix: MatrixConfig) => {
    try {
      // Update matrix in backend
      // const response = await api.matrix.updateMatrixConfig(matrix.id, matrix);
      // if (response.success) {
      //   fetchMatrices();
      //   setEditingMatrix(null);
      // }
      
      // Mock update
      setMatrices(prev => prev.map(m => m.id === matrix.id ? matrix : m));
      setEditingMatrix(null);
    } catch (error) {
      console.error('Failed to update matrix:', error);
    }
  };

  const handleDeleteMatrix = async (matrixId: number) => {
    if (window.confirm('Are you sure you want to delete this matrix? This action cannot be undone.')) {
      try {
        // Delete matrix logic
        setMatrices(prev => prev.filter(m => m.id !== matrixId));
        alert('Matrix deleted successfully!');
      } catch (error) {
        console.error('Failed to delete matrix:', error);
        alert('Failed to delete matrix');
      }
    }
  };

  const getMatrixTypeBadge = (type: string) => {
    switch (type) {
      case 'forced':
        return <Badge className="bg-blue-100 text-blue-800">Forced</Badge>;
      case 'unilevel':
        return <Badge className="bg-green-100 text-green-800">Unilevel</Badge>;
      case 'binary':
        return <Badge className="bg-purple-100 text-purple-800">Binary</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getPayoutTypeBadge = (type: string) => {
    switch (type) {
      case 'level':
        return <Badge className="bg-yellow-100 text-yellow-800">Level</Badge>;
      case 'cycle':
        return <Badge className="bg-red-100 text-red-800">Cycle</Badge>;
      case 'hybrid':
        return <Badge className="bg-indigo-100 text-indigo-800">Hybrid</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFillPercentage = (filled: number, total: number) => {
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading matrices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrix Settings</h1>
          <p className="text-gray-600">Configure and manage matrix structures</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchMatrices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Matrix
          </Button>
        </div>
      </div>

      {/* Matrix Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Matrices</p>
                <p className="text-2xl font-bold text-gray-900">{matrices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {matrices.reduce((sum, m) => sum + m.total_positions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Filled Positions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {matrices.reduce((sum, m) => sum + m.filled_positions, 0)}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ${matrices.reduce((sum, m) => sum + m.total_earnings, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matrices List */}
      <Card>
        <CardHeader>
          <CardTitle>Matrix Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Matrix</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Payout</th>
                  <th className="text-left py-3 px-4">Fee</th>
                  <th className="text-left py-3 px-4">Positions</th>
                  <th className="text-left py-3 px-4">Fill Rate</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matrices.map((matrix) => (
                  <tr key={matrix.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{matrix.name}</div>
                        <div className="text-sm text-gray-500">
                          {matrix.levels} levels × {matrix.width} width
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getMatrixTypeBadge(matrix.matrix_type)}
                    </td>
                    <td className="py-3 px-4">
                      {getPayoutTypeBadge(matrix.payout_type)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">${matrix.fee.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>{matrix.filled_positions} / {matrix.total_positions}</div>
                        <div className="text-gray-500">{matrix.cycle_count} cycles</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${getFillPercentage(matrix.filled_positions, matrix.total_positions)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {getFillPercentage(matrix.filled_positions, matrix.total_positions)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(matrix.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingMatrix(matrix)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteMatrix(matrix.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Matrix Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Matrix</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Name</label>
                <Input
                  value={newMatrix.name}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter matrix name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Type</label>
                <select
                  value={newMatrix.matrix_type}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, matrix_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="forced">Forced Matrix</option>
                  <option value="unilevel">Unilevel</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Levels</label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={newMatrix.levels}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, levels: parseInt(e.target.value) }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={newMatrix.width}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Fee ({primaryCurrency})</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMatrix.fee}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, fee: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Type</label>
                <select
                  value={newMatrix.payout_type}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, payout_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="level">Level-based</option>
                  <option value="cycle">Cycle-based</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMatrix.spillover_enabled}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, spillover_enabled: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable Spillover</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMatrix.reentry_enabled}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, reentry_enabled: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable Re-entry</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMatrix.email_notifications}
                  onChange={(e) => setNewMatrix(prev => ({ ...prev, email_notifications: e.target.checked }))}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMatrix}>
                <Save className="h-4 w-4 mr-2" />
                Create Matrix
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Matrix Modal */}
      {editingMatrix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Matrix: {editingMatrix.name}</h2>
              <Button variant="outline" onClick={() => setEditingMatrix(null)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Name</label>
                <Input
                  value={editingMatrix.name}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter matrix name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Fee ({primaryCurrency})</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingMatrix.fee}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, fee: parseFloat(e.target.value) } : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingMatrix.status}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingMatrix.spillover_enabled}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, spillover_enabled: e.target.checked } : null)}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable Spillover</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingMatrix.reentry_enabled}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, reentry_enabled: e.target.checked } : null)}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable Re-entry</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingMatrix.email_notifications}
                  onChange={(e) => setEditingMatrix(prev => prev ? { ...prev, email_notifications: e.target.checked } : null)}
                  className="rounded border-gray-300 mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingMatrix(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingMatrix && handleUpdateMatrix(editingMatrix)}>
                <Save className="h-4 w-4 mr-2" />
                Update Matrix
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixSettings; 
