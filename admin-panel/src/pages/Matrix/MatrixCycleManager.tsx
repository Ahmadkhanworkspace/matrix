import React, { useState, useEffect } from 'react';
import { Network, RotateCcw, CheckCircle, Clock, AlertTriangle, BarChart3, Plus, Edit, Trash2, Download, Filter, Search, Eye, Settings, Users, DollarSign, TrendingUp } from 'lucide-react';

interface MatrixCycle {
  id: string;
  matrixId: string;
  matrixName: string;
  memberId: string;
  memberName: string;
  cycleNumber: number;
  status: 'in_progress' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  completionDate?: string;
  positionsFilled: number;
  totalPositions: number;
  completionPercentage: number;
  earnings: number;
  commission: number;
  bonus: number;
  cycleReward: number;
  nextCycleEligible: boolean;
  cycleTime: number; // in days
  spilloverCount: number;
  directReferrals: number;
  totalReferrals: number;
}

interface CycleRule {
  id: string;
  matrixLevel: number;
  matrixName: string;
  width: number;
  depth: number;
  cycleReward: number;
  completionBonus: number;
  spilloverBonus: number;
  timeLimit: number; // in days
  isActive: boolean;
  autoRecycle: boolean;
  qualificationCriteria: string[];
}

const MatrixCycleManager: React.FC = () => {
  const [cycles, setCycles] = useState<MatrixCycle[]>([]);
  const [cycleRules, setCycleRules] = useState<CycleRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<MatrixCycle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [matrixFilter, setMatrixFilter] = useState<string>('all');

  useEffect(() => {
    loadCycles();
    loadCycleRules();
  }, []);

  const loadCycles = async () => {
    setLoading(true);
    try {
      // API call to load matrix cycles
      // const response = await cycleService.getMatrixCycles();
      // setCycles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load matrix cycles:', error);
      setLoading(false);
    }
  };

  const loadCycleRules = async () => {
    setLoading(true);
    try {
      // API call to load cycle rules
      // const response = await cycleService.getCycleRules();
      // setCycleRules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load cycle rules:', error);
      setLoading(false);
    }
  };

  const createCycle = async (cycleData: Partial<MatrixCycle>) => {
    try {
      // API call to create cycle
      // const response = await cycleService.createCycle(cycleData);
      // await loadCycles();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create cycle:', error);
    }
  };

  const completeCycle = async (cycleId: string) => {
    try {
      // API call to complete cycle
      // await cycleService.completeCycle(cycleId);
      // await loadCycles();
    } catch (error) {
      console.error('Failed to complete cycle:', error);
    }
  };

  const cancelCycle = async (cycleId: string) => {
    try {
      // API call to cancel cycle
      // await cycleService.cancelCycle(cycleId);
      // await loadCycles();
    } catch (error) {
      console.error('Failed to cancel cycle:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Cycle Manager</h1>
          <p className="text-gray-600">Manage matrix cycles and completion tracking</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Create Cycle
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <Network className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cycles</p>
              <p className="text-2xl font-bold text-gray-900">
                {cycles.filter(cycle => cycle.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Cycles</p>
              <p className="text-2xl font-bold text-gray-900">
                {cycles.filter(cycle => cycle.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${cycles.reduce((sum, cycle) => sum + cycle.earnings, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {cycles.length > 0 ? (cycles.reduce((sum, cycle) => sum + cycle.completionPercentage, 0) / cycles.length).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Cycle Rules</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cycleRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{rule.matrixName}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Matrix:</span>
                    <span className="text-sm font-medium">{rule.width} x {rule.depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cycle Reward:</span>
                    <span className="text-sm font-medium">${rule.cycleReward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion Bonus:</span>
                    <span className="text-sm font-medium">${rule.completionBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Limit:</span>
                    <span className="text-sm font-medium">{rule.timeLimit} days</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button className="text-sm text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix Cycles */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Matrix Cycles</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search cycles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Matrices</option>
                <option value="starter">Starter Matrix</option>
                <option value="basic">Basic Matrix</option>
                <option value="advanced">Advanced Matrix</option>
                <option value="master">Master Matrix</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cycle.memberName}</div>
                      <div className="text-sm text-gray-500">ID: {cycle.memberId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cycle.matrixName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">#{cycle.cycleNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getCompletionColor(cycle.completionPercentage)}`}
                          style={{ width: `${cycle.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getCompletionColor(cycle.completionPercentage)}`}>
                        {cycle.completionPercentage}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {cycle.positionsFilled}/{cycle.totalPositions} positions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cycle.status)}`}>
                      {cycle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${cycle.earnings.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      Comm: ${cycle.commission.toFixed(2)} | Bonus: ${cycle.bonus.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedCycle(cycle)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {cycle.status === 'in_progress' && (
                        <>
                          <button 
                            onClick={() => completeCycle(cycle.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                          <button 
                            onClick={() => cancelCycle(cycle.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatrixCycleManager; 
