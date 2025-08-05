import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  UserPlus, 
  Search, 
  Users, 
  Network, 
  Star, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  History
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import toast from 'react-hot-toast';
import { api } from '../../api';

interface MatrixConfig {
  id: number;
  name: string;
  fee: number;
  levels: number;
  forcedmatrix: number;
  active: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  status: 'pending' | 'active' | 'suspended';
  totalEarnings: number;
  matrixPositions: number;
}

interface Position {
  id: string;
  username: string;
  matrixId: number;
  level: number;
  position: number;
  sponsor: string;
  status: 'active' | 'pending' | 'completed';
  joinDate: string;
}

const AddMemberPosition: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatrix, setSelectedMatrix] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  
  // Real data from API
  const [matrixConfigs, setMatrixConfigs] = useState<MatrixConfig[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [sponsors, setSponsors] = useState<User[]>([]);
  const [loadingMatrices, setLoadingMatrices] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(true);

  // Load matrices
  useEffect(() => {
    const loadMatrices = async () => {
      try {
        setLoadingMatrices(true);
        const response = await api.matrix.getMatrixConfigs();
        if (response.success && response.data) {
          setMatrixConfigs(response.data);
          if (response.data.length > 0) {
            setSelectedMatrix(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading matrices:', error);
        toast.error('Failed to load matrices');
      } finally {
        setLoadingMatrices(false);
      }
    };

    loadMatrices();
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await api.user.getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Load positions
  useEffect(() => {
    const loadPositions = async () => {
      try {
        setLoadingPositions(true);
        const response = await api.matrix.getMatrixPositions(selectedMatrix);
        if (response.success && response.data) {
          setPositions(response.data);
        }
      } catch (error) {
        console.error('Error loading positions:', error);
        toast.error('Failed to load positions');
      } finally {
        setLoadingPositions(false);
      }
    };

    if (selectedMatrix) {
      loadPositions();
    }
  }, [selectedMatrix]);

  // Load sponsors
  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const response = await api.user.getAllUsers(undefined, undefined, 1); // status 1 = active
        if (response.success && response.data) {
          setSponsors(response.data);
        }
      } catch (error) {
        console.error('Error loading sponsors:', error);
      }
    };

    loadSponsors();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddPosition = async () => {
    if (!selectedUser || !selectedSponsor) {
      toast.error('Please select both user and sponsor');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.matrix.processMatrixEntry(
        selectedUser.username,
        selectedMatrix,
        selectedSponsor
      );

      if (response.success) {
        toast.success(`Position added successfully for ${selectedUser.username} in Matrix ${selectedMatrix}`);
        
        // Reset form
        setSelectedUser(null);
        setSelectedSponsor('');
        
        // Reload positions
        const positionsResponse = await api.matrix.getMatrixPositions(selectedMatrix);
        if (positionsResponse.success && positionsResponse.data) {
          setPositions(positionsResponse.data);
        }
      } else {
        toast.error(response.message || 'Failed to add position');
      }
      
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Failed to add position');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMatrixStats = (matrixId: number) => {
    const matrixPositions = positions.filter(p => p.matrixId === matrixId);
    const activePositions = matrixPositions.filter(p => p.status === 'active');
    const pendingPositions = matrixPositions.filter(p => p.status === 'pending');
    
    return {
      total: matrixPositions.length,
      active: activePositions.length,
      pending: pendingPositions.length
    };
  };

  if (loadingMatrices || loadingUsers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Member Position</h1>
            <p className="text-gray-600">Add members to matrix positions</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Member Position</h1>
          <p className="text-gray-600">Add members to matrix positions and manage assignments</p>
        </div>
        <Button onClick={handleAddPosition} disabled={loading || !selectedUser || !selectedSponsor}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
          Add Position
        </Button>
      </div>

      {/* Matrix Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Select Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matrixConfigs.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matrices Available</h3>
              <p className="text-gray-500">No matrix configurations found. Please create matrices first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matrixConfigs.map((matrix) => (
                <div
                  key={matrix.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMatrix === matrix.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMatrix(matrix.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{matrix.name}</h3>
                    <Badge variant={matrix.active ? 'default' : 'secondary'}>
                      {matrix.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Fee: {formatCurrency(matrix.fee)}</p>
                    <p>Levels: {matrix.levels}</p>
                    <p>Width: {matrix.forcedmatrix}</p>
                  </div>
                  {matrix.active && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{getMatrixStats(matrix.id).total}</p>
                          <p className="text-gray-500">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">{getMatrixStats(matrix.id).active}</p>
                          <p className="text-gray-500">Active</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-yellow-600">{getMatrixStats(matrix.id).pending}</p>
                          <p className="text-gray-500">Pending</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Select Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected User */}
            {selectedUser && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{selectedUser.username}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                      {selectedUser.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Earnings</p>
                    <p className="font-semibold">{formatCurrency(selectedUser.totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Matrix Positions</p>
                    <p className="font-semibold">{selectedUser.matrixPositions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* User List */}
            {!selectedUser && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-500">No users match your search criteria.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">{user.username}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Select Sponsor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected Sponsor */}
            {selectedSponsor && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{selectedSponsor}</h3>
                      <p className="text-sm text-gray-600">Sponsor</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSponsor('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sponsor Options */}
            {!selectedSponsor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSponsor('admin')}
                >
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">System Admin</h4>
                      <p className="text-sm text-gray-600">Default system sponsor</p>
                    </div>
                  </div>
                </div>
                {sponsors.slice(0, 4).map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSponsor(sponsor.username)}
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">{sponsor.username}</h4>
                        <p className="text-sm text-gray-600">Active member</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Position Summary */}
      {(selectedUser || selectedSponsor) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Position Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Matrix</h4>
                  <p className="text-lg font-semibold text-blue-600">
                    {matrixConfigs.find(m => m.id === selectedMatrix)?.name || 'Not selected'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Member</h4>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedUser?.username || 'Not selected'}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Sponsor</h4>
                  <p className="text-lg font-semibold text-yellow-600">
                    {selectedSponsor || 'Not selected'}
                  </p>
                </div>
              </div>
              
              {selectedUser && selectedSponsor && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Ready to Add Position</h4>
                      <p className="text-sm text-gray-600">
                        {selectedUser.username} will be added to {matrixConfigs.find(m => m.id === selectedMatrix)?.name} 
                        with {selectedSponsor} as sponsor
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Recent Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPositions ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mr-2" />
              <p className="text-gray-600">Loading positions...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Positions Found</h3>
              <p className="text-gray-500">No matrix positions have been created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.slice(0, 5).map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{position.username}</h4>
                      <p className="text-sm text-gray-600">
                        Matrix {position.matrixId} • Level {position.level} • Position {position.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                      {position.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{position.joinDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMemberPosition; 
