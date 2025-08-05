import React, { useState, useEffect } from 'react';
import { Network, Settings, Plus, Edit, Trash2, Save, X, Eye, BarChart3, Users, Target, ArrowDown, ArrowUp, Move } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixPosition {
  id: string;
  position: number;
  level: number;
  memberId: string;
  memberName: string;
  status: 'filled' | 'empty' | 'pending';
  joinDate: string;
  sponsorId: string;
  sponsorName: string;
  earnings: number;
  currency: string;
}

interface MatrixLevel {
  level: number;
  positions: number;
  filled: number;
  empty: number;
  pending: number;
}

interface MatrixStats {
  totalPositions: number;
  filledPositions: number;
  emptyPositions: number;
  pendingPositions: number;
  totalEarnings: number;
  averageEarnings: number;
  topEarner: string;
  topEarnings: number;
}

const MatrixPositionManager: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('positions');
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<MatrixPosition | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [positions, setPositions] = useState<MatrixPosition[]>([
    {
      id: '1',
      position: 1,
      level: 1,
      memberId: 'M001',
      memberName: 'John Smith',
      status: 'filled',
      joinDate: '2024-01-10',
      sponsorId: 'S001',
      sponsorName: 'Admin',
      earnings: 250,
      currency: primaryCurrency
    },
    {
      id: '2',
      position: 2,
      level: 1,
      memberId: 'M002',
      memberName: 'Sarah Johnson',
      status: 'filled',
      joinDate: '2024-01-12',
      sponsorId: 'S001',
      sponsorName: 'Admin',
      earnings: 180,
      currency: primaryCurrency
    },
    {
      id: '3',
      position: 3,
      level: 1,
      memberId: '',
      memberName: '',
      status: 'empty',
      joinDate: '',
      sponsorId: '',
      sponsorName: '',
      earnings: 0,
      currency: primaryCurrency
    },
    {
      id: '4',
      position: 4,
      level: 1,
      memberId: 'M003',
      memberName: 'Mike Davis',
      status: 'pending',
      joinDate: '2024-01-15',
      sponsorId: 'S001',
      sponsorName: 'Admin',
      earnings: 0,
      currency: primaryCurrency
    }
  ]);

  const [levels, setLevels] = useState<MatrixLevel[]>([
    { level: 1, positions: 3, filled: 2, empty: 1, pending: 0 },
    { level: 2, positions: 9, filled: 5, empty: 3, pending: 1 },
    { level: 3, positions: 27, filled: 12, empty: 12, pending: 3 },
    { level: 4, positions: 81, filled: 25, empty: 45, pending: 11 },
    { level: 5, positions: 243, filled: 45, empty: 180, pending: 18 },
    { level: 6, positions: 729, filled: 78, empty: 600, pending: 51 },
    { level: 7, positions: 2187, filled: 120, empty: 1950, pending: 117 },
    { level: 8, positions: 6561, filled: 180, empty: 6200, pending: 181 }
  ]);

  const [stats, setStats] = useState<MatrixStats>({
    totalPositions: 10080,
    filledPositions: 465,
    emptyPositions: 8991,
    pendingPositions: 624,
    totalEarnings: 125000,
    averageEarnings: 269,
    topEarner: 'John Smith',
    topEarnings: 2500
  });

  const [newPosition, setNewPosition] = useState<Partial<MatrixPosition>>({
    position: 0,
    level: 1,
    memberId: '',
    memberName: '',
    status: 'empty',
    joinDate: '',
    sponsorId: '',
    sponsorName: '',
    earnings: 0,
    currency: primaryCurrency
  });

  const handleSavePosition = () => {
    if (editingPosition) {
      setPositions(positions.map(pos => pos.id === editingPosition.id ? { ...editingPosition } : pos));
      setEditingPosition(null);
    } else {
      const position: MatrixPosition = {
        ...newPosition as MatrixPosition,
        id: Date.now().toString()
      };
      setPositions([...positions, position]);
      setNewPosition({
        position: 0,
        level: 1,
        memberId: '',
        memberName: '',
        status: 'empty',
        joinDate: '',
        sponsorId: '',
        sponsorName: '',
        earnings: 0,
        currency: primaryCurrency
      });
    }
    setShowModal(false);
  };

  const handleEditPosition = (position: MatrixPosition) => {
    setEditingPosition(position);
    setShowModal(true);
  };

  const handleDeletePosition = (id: string) => {
    setPositions(positions.filter(pos => pos.id !== id));
  };

  const handleMovePosition = (id: string, direction: 'up' | 'down') => {
    // Implementation for moving positions
    console.log(`Moving position ${id} ${direction}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'empty': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled': return <Users className="h-4 w-4" />;
      case 'empty': return <Target className="h-4 w-4" />;
      case 'pending': return <Eye className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const filteredPositions = positions.filter(pos => pos.level === selectedLevel);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Network className="h-8 w-8 text-blue-600" />
                Matrix Position Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Manage matrix positions, assignments, and spillover configurations
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Position
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Network className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPositions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filled Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.filledPositions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Target className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empty Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emptyPositions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPositions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Matrix Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {levels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => setSelectedLevel(level.level)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedLevel === level.level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Level {level.level}</div>
                    <div className="text-sm text-gray-600">{level.positions} positions</div>
                    <div className="text-xs text-gray-500">
                      {level.filled} filled, {level.empty} empty
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'positions', name: 'Positions', icon: Network },
                { id: 'spillover', name: 'Spillover', icon: ArrowDown },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Level {selectedLevel} Positions
                </h3>
                <div className="text-sm text-gray-600">
                  {filteredPositions.length} positions
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPositions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{position.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {position.memberName || 'Empty'}
                          </div>
                          {position.memberId && (
                            <div className="text-sm text-gray-500">{position.memberId}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(position.status)}`}>
                          {getStatusIcon(position.status)}
                          <span className="ml-1 capitalize">{position.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.joinDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {position.sponsorName || '-'}
                          </div>
                          {position.sponsorId && (
                            <div className="text-sm text-gray-500">{position.sponsorId}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {primaryCurrency} {position.earnings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPosition(position)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMovePosition(position.id, 'up')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMovePosition(position.id, 'down')}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePosition(position.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Spillover Tab */}
        {activeTab === 'spillover' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spillover Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Spillover Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Auto-spillover enabled</span>
                      <span className="text-green-600 text-sm">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Spillover direction</span>
                      <span className="text-gray-600 text-sm">Left to Right</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Max spillover per level</span>
                      <span className="text-gray-600 text-sm">3 positions</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Recent Spillovers</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Member A → Position 5</span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Member B → Position 8</span>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Member C → Position 12</span>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Performance</h3>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Network className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium">Level {level.level}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{level.filled}/{level.positions}</div>
                        <div className="text-xs text-gray-500">
                          {((level.filled / level.positions) * 100).toFixed(1)}% filled
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earners</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium">{stats.topEarner}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      {primaryCurrency} {stats.topEarnings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Sarah Johnson</span>
                    <span className="font-semibold">{primaryCurrency} 1,800</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Mike Davis</span>
                    <span className="font-semibold">{primaryCurrency} 1,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingPosition ? 'Edit Position' : 'Add New Position'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position Number</label>
                    <input
                      type="number"
                      value={editingPosition?.position || newPosition.position}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, position: parseInt(e.target.value) || 0})
                        : setNewPosition({...newPosition, position: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={editingPosition?.level || newPosition.level}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, level: parseInt(e.target.value) || 1})
                        : setNewPosition({...newPosition, level: parseInt(e.target.value) || 1})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Name</label>
                    <input
                      type="text"
                      value={editingPosition?.memberName || newPosition.memberName}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, memberName: e.target.value})
                        : setNewPosition({...newPosition, memberName: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
                    <input
                      type="text"
                      value={editingPosition?.memberId || newPosition.memberId}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, memberId: e.target.value})
                        : setNewPosition({...newPosition, memberId: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingPosition?.status || newPosition.status}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, status: e.target.value as any})
                        : setNewPosition({...newPosition, status: e.target.value as any})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="empty">Empty</option>
                      <option value="filled">Filled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <input
                      type="date"
                      value={editingPosition?.joinDate || newPosition.joinDate}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, joinDate: e.target.value})
                        : setNewPosition({...newPosition, joinDate: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Earnings</label>
                    <input
                      type="number"
                      value={editingPosition?.earnings || newPosition.earnings}
                      onChange={(e) => editingPosition 
                        ? setEditingPosition({...editingPosition, earnings: parseInt(e.target.value) || 0})
                        : setNewPosition({...newPosition, earnings: parseInt(e.target.value) || 0})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingPosition(null);
                      setNewPosition({
                        position: 0,
                        level: 1,
                        memberId: '',
                        memberName: '',
                        status: 'empty',
                        joinDate: '',
                        sponsorId: '',
                        sponsorName: '',
                        earnings: 0,
                        currency: primaryCurrency
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePosition}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingPosition ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixPositionManager; 
