import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Network, 
  Users, 
  TrendingUp, 
  Settings,
  Eye,
  Plus
} from 'lucide-react';
import { adminService } from '../services/adminService';

const Matrix: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: matrixData, isLoading: positionsLoading } = useQuery(
    ['matrix-positions', selectedLevel, currentPage],
    () => adminService.getMatrixPositions({
      level: selectedLevel,
      page: currentPage,
      limit: 20,
    })
  );

  const { data: levelsData, isLoading: levelsLoading } = useQuery(
    'matrix-levels',
    () => adminService.getMatrixLevels({
      page: 1,
      limit: 20,
      status: 'all'
    })
  );

  const { data: statistics, isLoading: statsLoading } = useQuery(
    'matrix-statistics',
    adminService.getMatrixStatistics
  );

  const levels = Array.from({ length: 15 }, (_, i) => i + 1);

  if (positionsLoading || levelsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrix Management</h1>
          <p className="text-gray-600">Monitor and manage matrix positions</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus size={16} className="mr-2" />
          Force Placement
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Network size={20} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Positions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalPositions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={20} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Positions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.activePositions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp size={20} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Cycles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.completedCycles || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings size={20} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Positions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.pendingPositions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Level Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Matrix Levels</h3>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Positions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Matrix Level {selectedLevel} Positions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {matrixData?.data?.length || 0} positions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Position ID</th>
                <th>User</th>
                <th>Sponsor</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matrixData?.data?.map((position: any) => (
                <tr key={position.id}>
                  <td className="font-mono text-sm">{position.id}</td>
                  <td>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {position.user?.firstName?.charAt(0)}{position.user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {position.user?.firstName} {position.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">@{position.user?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {position.sponsor?.firstName} {position.sponsor?.lastName}
                      </div>
                      <div className="text-gray-500">@{position.sponsor?.username}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      position.status === 'active' ? 'badge-success' :
                      position.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                      {position.status}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(position.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => {/* View position details */}}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {matrixData?.pagination && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((matrixData.pagination.page - 1) * matrixData.pagination.limit) + 1} to{' '}
                {Math.min(matrixData.pagination.page * matrixData.pagination.limit, matrixData.pagination.total)} of{' '}
                {matrixData.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {matrixData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === matrixData.pagination.totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matrix Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Matrix Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Level Settings</h4>
            <div className="space-y-3">
              {levelsData?.map((level: any) => (
                <div key={level.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Level {level.level}</div>
                    <div className="text-sm text-gray-500">
                      Width: {level.width} | Height: {level.height}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${level.price}</div>
                    <div className="text-sm text-gray-500">{level.bonusPercentage}% Bonus</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">System Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Placement</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="auto-placement"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    defaultChecked
                  />
                  <label
                    htmlFor="auto-placement"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Matrix Cycling</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="matrix-cycling"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    defaultChecked
                  />
                  <label
                    htmlFor="matrix-cycling"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bonus Distribution</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="bonus-distribution"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    defaultChecked
                  />
                  <label
                    htmlFor="bonus-distribution"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matrix; 
