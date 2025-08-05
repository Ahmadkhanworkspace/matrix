import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  Plus,
  User,
  Network,
  Grid,
  Crown,
  Star,
  Award,
  Calendar,
  Hash,
  Activity,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Database,
  Layers,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface MatrixLevel {
  id: string;
  name: string;
  level: number;
  width: number;
  depth: number;
  price: number;
  currency: string;
  isActive: boolean;
  totalPositions: number;
  filledPositions: number;
  completionRate: number;
  referralBonus: number;
  matrixBonus: number;
  matchingBonus: number;
  cycleBonus: number;
  minReferrals: number;
  maxReferrals: number;
  cycleTime: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface MatrixLevelStats {
  totalLevels: number;
  activeLevels: number;
  totalPositions: number;
  filledPositions: number;
  completionRate: number;
  totalEarnings: number;
  averageCycleTime: number;
}

const MatrixLevels: React.FC = () => {
  const [levels, setLevels] = useState<MatrixLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLevels, setTotalLevels] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [showEditLevel, setShowEditLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadLevels();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const response = await adminService.getMatrixLevels({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setLevels(response.levels);
      setTotalPages(response.pagination.totalPages);
      setTotalLevels(response.pagination.total);
    } catch (error) {
      console.error('Error loading matrix levels:', error);
      toast.error('Failed to load matrix levels');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === 'status') {
      setStatusFilter(value);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevels(prev => 
      prev.includes(levelId) 
        ? prev.filter(id => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLevels.length === levels.length) {
      setSelectedLevels([]);
    } else {
      setSelectedLevels(levels.map(l => l.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedLevels.length === 0) {
      toast.error('Please select levels to perform this action');
      return;
    }

    try {
      setLoading(true);
      await adminService.bulkActionMatrixLevels(selectedLevels, action);
      toast.success(`Bulk ${action} completed successfully`);
      setSelectedLevels([]);
      loadLevels();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      toast.error(`Bulk ${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return Star;
      case 2:
        return Award;
      case 3:
        return Crown;
      default:
        return Grid;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLevelStats = (): MatrixLevelStats => {
    const totalLevels = levels.length;
    const activeLevels = levels.filter(l => l.isActive).length;
    const totalPositions = levels.reduce((sum, l) => sum + l.totalPositions, 0);
    const filledPositions = levels.reduce((sum, l) => sum + l.filledPositions, 0);
    const completionRate = totalPositions > 0 ? (filledPositions / totalPositions) * 100 : 0;
    const totalEarnings = levels.reduce((sum, l) => sum + (l.filledPositions * l.price), 0);
    const averageCycleTime = levels.reduce((sum, l) => sum + l.cycleTime, 0) / totalLevels;

    return {
      totalLevels,
      activeLevels,
      totalPositions,
      filledPositions,
      completionRate,
      totalEarnings,
      averageCycleTime
    };
  };

  const stats = getLevelStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Level Management</h1>
          <p className="text-gray-600">Manage matrix levels and configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            onClick={loadLevels}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddLevel(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Level
          </button>
        </div>
      </div>

      {/* Matrix Level Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Levels</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalLevels}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Levels</p>
              <p className="text-lg font-semibold text-gray-900">{stats.activeLevels}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-lg font-semibold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by level name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedLevels.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedLevels.length} level(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <XCircle className="mr-1 h-4 w-4" />
                Deactivate Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Levels Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Matrix Levels</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Total: {totalLevels}</span>
              <span>•</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLevels.length === levels.length && levels.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonuses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 text-gray-400 mr-2" />
                      Loading levels...
                    </div>
                  </td>
                </tr>
              ) : levels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No matrix levels found
                  </td>
                </tr>
              ) : (
                levels.map((level) => {
                  const LevelIcon = getLevelIcon(level.level);
                  return (
                    <tr key={level.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level.id)}
                          onChange={() => handleSelectLevel(level.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <LevelIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{level.name}</div>
                            <div className="text-sm text-gray-500">Level {level.level}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {level.width}×{level.depth} Matrix
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatAmount(level.price, level.currency)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {level.totalPositions} positions total
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Ref: {level.referralBonus}% • Matrix: {level.matrixBonus}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Match: {level.matchingBonus}% • Cycle: {level.cycleBonus}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {level.cycleTime} days cycle time
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(level.isActive)}`}>
                          {level.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {level.filledPositions}/{level.totalPositions}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${level.completionRate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {level.completionRate.toFixed(1)}% complete
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setShowEditLevel(level.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalLevels)} of {totalLevels} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixLevels; 
