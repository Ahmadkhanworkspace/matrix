import React, { useState, useEffect } from 'react';
import {
  Target, Plus, Edit, Trash2, Eye, Search, Filter, Download, RefreshCw,
  Users, DollarSign, Network, Clock, CheckCircle, XCircle, AlertCircle,
  UserPlus, Move, Copy, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixPosition {
  id: string;
  level: number;
  position: number;
  memberId?: string;
  memberName?: string;
  memberEmail?: string;
  status: 'filled' | 'empty' | 'pending' | 'blocked';
  sponsorId?: string;
  sponsorName?: string;
  joinDate?: string;
  earnings: number;
  cycleCount: number;
  lastActivity: string;
  upline: string[];
  downline: string[];
  spilloverFrom?: string;
  spilloverTo?: string;
}

interface PositionStats {
  totalPositions: number;
  filledPositions: number;
  emptyPositions: number;
  pendingPositions: number;
  blockedPositions: number;
  totalEarnings: number;
  averageEarnings: number;
  totalMembers: number;
}

const MatrixPositions: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [positions, setPositions] = useState<MatrixPosition[]>([]);
  const [positionStats, setPositionStats] = useState<PositionStats>({
    totalPositions: 0,
    filledPositions: 0,
    emptyPositions: 0,
    pendingPositions: 0,
    blockedPositions: 0,
    totalEarnings: 0,
    averageEarnings: 0,
    totalMembers: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<MatrixPosition | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    loadPositions();
    loadPositionStats();
  }, []);

  const loadPositions = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const samplePositions: MatrixPosition[] = [
        {
          id: '1-1',
          level: 1,
          position: 1,
          memberId: 'M001',
          memberName: 'John Doe',
          memberEmail: 'john@example.com',
          status: 'filled',
          sponsorId: 'S001',
          sponsorName: 'Sponsor 1',
          joinDate: '2024-01-01',
          earnings: 500,
          cycleCount: 2,
          lastActivity: '2024-01-15',
          upline: ['Sponsor 1'],
          downline: ['Member 2', 'Member 3']
        },
        {
          id: '1-2',
          level: 1,
          position: 2,
          memberId: 'M002',
          memberName: 'Jane Smith',
          memberEmail: 'jane@example.com',
          status: 'filled',
          sponsorId: 'S001',
          sponsorName: 'Sponsor 1',
          joinDate: '2024-01-05',
          earnings: 450,
          cycleCount: 1,
          lastActivity: '2024-01-10',
          upline: ['Sponsor 1'],
          downline: ['Member 4', 'Member 5']
        },
        {
          id: '2-1',
          level: 2,
          position: 1,
          status: 'pending',
          sponsorId: 'S002',
          sponsorName: 'Sponsor 2',
          earnings: 0,
          cycleCount: 0,
          lastActivity: '2024-01-20',
          upline: ['Sponsor 2'],
          downline: []
        },
        {
          id: '2-2',
          level: 2,
          position: 2,
          status: 'empty',
          sponsorId: 'S002',
          sponsorName: 'Sponsor 2',
          earnings: 0,
          cycleCount: 0,
          lastActivity: '-',
          upline: ['Sponsor 2'],
          downline: []
        },
        {
          id: '3-1',
          level: 3,
          position: 1,
          memberId: 'M003',
          memberName: 'Bob Johnson',
          memberEmail: 'bob@example.com',
          status: 'filled',
          sponsorId: 'S003',
          sponsorName: 'Sponsor 3',
          joinDate: '2024-01-10',
          earnings: 300,
          cycleCount: 1,
          lastActivity: '2024-01-12',
          upline: ['Sponsor 3'],
          downline: [],
          spilloverFrom: '1-1'
        }
      ];
      setPositions(samplePositions);
      setLoading(false);
    }, 1000);
  };

  const loadPositionStats = () => {
    const stats: PositionStats = {
      totalPositions: positions.length,
      filledPositions: positions.filter(p => p.status === 'filled').length,
      emptyPositions: positions.filter(p => p.status === 'empty').length,
      pendingPositions: positions.filter(p => p.status === 'pending').length,
      blockedPositions: positions.filter(p => p.status === 'blocked').length,
      totalEarnings: positions.reduce((sum, p) => sum + p.earnings, 0),
      averageEarnings: positions.length > 0 ? positions.reduce((sum, p) => sum + p.earnings, 0) / positions.length : 0,
      totalMembers: positions.filter(p => p.status === 'filled').length
    };
    setPositionStats(stats);
  };

  const handleAssignMember = (positionId: string, memberData: { name: string; email: string }) => {
    setPositions(positions.map(p => 
      p.id === positionId ? {
        ...p,
        memberId: `M${Date.now()}`,
        memberName: memberData.name,
        memberEmail: memberData.email,
        status: 'filled',
        joinDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      } : p
    ));
    setShowAssignModal(false);
  };

  const handleMovePosition = (fromPositionId: string, toPositionId: string) => {
    // Implementation for moving position
    console.log('Move position from', fromPositionId, 'to', toPositionId);
    setShowMoveModal(false);
  };

  const handleDeletePosition = (positionId: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      setPositions(positions.filter(p => p.id !== positionId));
    }
  };

  const handleBlockPosition = (positionId: string) => {
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'blocked' } : p
    ));
  };

  const handleUnblockPosition = (positionId: string) => {
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'empty' } : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'empty': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'empty': return <XCircle className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredPositions = positions.filter(position => {
    const matchesSearch = !searchTerm || 
      position.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.memberEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || position.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || position.level.toString() === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Positions</h1>
          <p className="text-gray-600">Manage matrix positions and member assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPositions}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Position Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Positions</p>
              <p className="text-2xl font-bold text-gray-900">{positionStats.totalPositions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filled Positions</p>
              <p className="text-2xl font-bold text-gray-900">{positionStats.filledPositions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{primaryCurrency} {positionStats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Network className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empty Positions</p>
              <p className="text-2xl font-bold text-gray-900">{positionStats.emptyPositions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="filled">Filled</option>
            <option value="empty">Empty</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
            <option value="6">Level 6</option>
            <option value="7">Level 7</option>
            <option value="8">Level 8</option>
          </select>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Matrix Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">Level {position.level} - #{position.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(position.status)}`}>
                      {getStatusIcon(position.status)}
                      <span className="ml-1 capitalize">{position.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{position.memberName || '-'}</span>
                      {position.memberEmail && (
                        <p className="text-sm text-gray-500">{position.memberEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{position.sponsorName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{position.joinDate || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{primaryCurrency} {position.earnings.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{position.cycleCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPosition(position)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {position.status === 'empty' && (
                        <button
                          onClick={() => {
                            setSelectedPosition(position);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPosition(position);
                          setShowMoveModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                      {position.status === 'blocked' ? (
                        <button
                          onClick={() => handleUnblockPosition(position.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockPosition(position.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}
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

      {/* Assign Member Modal */}
      {showAssignModal && selectedPosition && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Assign Member to Position
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Level {selectedPosition.level} - Position #{selectedPosition.position}
                    </p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter member name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleAssignMember(selectedPosition.id, { name: 'New Member', email: 'new@example.com' })}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Assign Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixPositions; 
