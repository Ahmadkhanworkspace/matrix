import React, { useState, useEffect } from 'react';
import {
  RotateCcw, Plus, Edit, Trash2, Eye, Search, Filter, Download, RefreshCw,
  TrendingUp, TrendingDown, Activity, Zap, Award, Clock, CheckCircle, XCircle,
  AlertCircle, Users, DollarSign, Target, Network
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface MatrixCycle {
  id: string;
  level: number;
  cycleNumber: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'pending';
  totalPositions: number;
  filledPositions: number;
  completionRate: number;
  totalEarnings: number;
  cycleBonus: number;
  members: string[];
  sponsorId: string;
  sponsorName: string;
  completionTime?: string;
}

interface CycleStats {
  totalCycles: number;
  activeCycles: number;
  completedCycles: number;
  pendingCycles: number;
  totalEarnings: number;
  averageCompletionTime: string;
  averageCycleBonus: number;
  totalMembers: number;
}

const MatrixCycles: React.FC = () => {
  const { primaryCurrency } = useCurrency();
  const [cycles, setCycles] = useState<MatrixCycle[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats>({
    totalCycles: 0,
    activeCycles: 0,
    completedCycles: 0,
    pendingCycles: 0,
    totalEarnings: 0,
    averageCompletionTime: '0 days',
    averageCycleBonus: 0,
    totalMembers: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCycles();
    loadCycleStats();
  }, []);

  const loadCycles = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const sampleCycles: MatrixCycle[] = [
        {
          id: '1',
          level: 1,
          cycleNumber: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          status: 'completed',
          totalPositions: 2,
          filledPositions: 2,
          completionRate: 100,
          totalEarnings: 500,
          cycleBonus: 200,
          members: ['Member 1', 'Member 2'],
          sponsorId: 'S001',
          sponsorName: 'Sponsor 1',
          completionTime: '14 days'
        },
        {
          id: '2',
          level: 2,
          cycleNumber: 1,
          startDate: '2024-01-10',
          status: 'active',
          totalPositions: 4,
          filledPositions: 3,
          completionRate: 75,
          totalEarnings: 800,
          cycleBonus: 300,
          members: ['Member 3', 'Member 4', 'Member 5'],
          sponsorId: 'S002',
          sponsorName: 'Sponsor 2'
        },
        {
          id: '3',
          level: 3,
          cycleNumber: 1,
          startDate: '2024-01-20',
          status: 'pending',
          totalPositions: 8,
          filledPositions: 2,
          completionRate: 25,
          totalEarnings: 200,
          cycleBonus: 400,
          members: ['Member 6', 'Member 7'],
          sponsorId: 'S003',
          sponsorName: 'Sponsor 3'
        }
      ];
      setCycles(sampleCycles);
      setLoading(false);
    }, 1000);
  };

  const loadCycleStats = () => {
    const stats: CycleStats = {
      totalCycles: cycles.length,
      activeCycles: cycles.filter(c => c.status === 'active').length,
      completedCycles: cycles.filter(c => c.status === 'completed').length,
      pendingCycles: cycles.filter(c => c.status === 'pending').length,
      totalEarnings: cycles.reduce((sum, c) => sum + c.totalEarnings, 0),
      averageCompletionTime: '12 days',
      averageCycleBonus: cycles.reduce((sum, c) => sum + c.cycleBonus, 0) / Math.max(cycles.length, 1),
      totalMembers: cycles.reduce((sum, c) => sum + c.members.length, 0)
    };
    setCycleStats(stats);
  };

  const handleCreateCycle = (newCycle: Omit<MatrixCycle, 'id'>) => {
    const cycle: MatrixCycle = {
      ...newCycle,
      id: Date.now().toString()
    };
    setCycles([...cycles, cycle]);
    setShowCreateModal(false);
  };

  const handleEditCycle = (cycleId: string) => {
    // Implementation for editing cycle
    console.log('Edit cycle:', cycleId);
  };

  const handleDeleteCycle = (cycleId: string) => {
    if (window.confirm('Are you sure you want to delete this cycle?')) {
      setCycles(cycles.filter(c => c.id !== cycleId));
    }
  };

  const handleCompleteCycle = (cycleId: string) => {
    setCycles(cycles.map(c => 
      c.id === cycleId ? { ...c, status: 'completed', endDate: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Activity className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredCycles = cycles.filter(cycle => {
    const matchesSearch = !searchTerm || 
      cycle.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cycle.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || cycle.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || cycle.level.toString() === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Cycles</h1>
          <p className="text-gray-600">Manage and monitor matrix cycles</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCycles}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Cycle
          </button>
        </div>
      </div>

      {/* Cycle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RotateCcw className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cycles</p>
              <p className="text-2xl font-bold text-gray-900">{cycleStats.totalCycles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cycles</p>
              <p className="text-2xl font-bold text-gray-900">{cycleStats.activeCycles}</p>
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
              <p className="text-2xl font-bold text-gray-900">{primaryCurrency} {cycleStats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{cycleStats.totalMembers}</p>
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
              placeholder="Search cycles..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
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

      {/* Cycles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Matrix Cycles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">Level {cycle.level}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">#{cycle.cycleNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                      {getStatusIcon(cycle.status)}
                      <span className="ml-1 capitalize">{cycle.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${cycle.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{cycle.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{cycle.filledPositions}/{cycle.totalPositions}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{primaryCurrency} {cycle.totalEarnings.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{cycle.sponsorName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCycle(cycle.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {cycle.status === 'active' && (
                        <button
                          onClick={() => handleCompleteCycle(cycle.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCycle(cycle.id)}
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

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <RotateCcw className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Matrix Cycle
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Level</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cycle Number</label>
                          <input
                            type="number"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Select Sponsor</option>
                          <option value="S001">Sponsor 1</option>
                          <option value="S002">Sponsor 2</option>
                          <option value="S003">Sponsor 3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Create Cycle
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

export default MatrixCycles; 
